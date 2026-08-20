import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/dashboard/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Booking, BookingStatus } from '../../types';
import {
  subscribeToBookingDetail,
  updateBookingFields,
  recordPayment
} from '../../firebase/firestore';
import { generateContract, triggerOnStatusChange } from '../../services/cloudFunctions';
import {
  ArrowLeft,
  FileCheck,
  CreditCard,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Clock,
  ExternalLink,
  CheckCircle2,
  FileText,
  Send,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

export const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [contractModalData, setContractModalData] = useState<{
    contractUrl: string;
    clientEmail: string;
    clientPhone: string;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToBookingDetail(id, (b) => {
      setBooking(b);
      if (b?.notes) setNotes(b.notes);
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-on-surface/60">
        Loading booking details...
      </div>
    );
  }

  if (!booking || !id) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-on-surface">Booking record not found.</p>
        <Button onClick={() => navigate('/dashboard/bookings')}>Return to Pipeline</Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: BookingStatus) => {
    setIsUpdatingStatus(true);
    try {
      await triggerOnStatusChange(id, newStatus);
      setIsUpdatingStatus(false);
    } catch (err) {
      console.error('Error changing status:', err);
      setIsUpdatingStatus(false);
    }
  };

  const handleGenerateContract = async () => {
    setIsGeneratingContract(true);
    try {
      // generateContract moves the booking to contract_sent and stores the
      // DocuSeal URL server-side; onStatusChange then emails the client
      // automatically — nothing else to dispatch from here.
      const res = await generateContract(id);
      setIsGeneratingContract(false);
      if (res && res.contractUrl) {
        setContractModalData({ contractUrl: res.contractUrl, clientEmail: booking.clientEmail, clientPhone: booking.clientPhone });
      }
    } catch (err) {
      console.error('Error generating contract:', err);
      setIsGeneratingContract(false);
      alert('Failed to generate contract. Check that DOCUSEAL_API_KEY / DOCUSEAL_TEMPLATE_ID are configured.');
    }
  };

  const handleSaveNotes = async () => {
    await updateBookingFields(id, { notes });
  };

  const handleMarkDepositReceived = async () => {
    setIsRecordingPayment(true);
    try {
      await recordPayment({
        bookingId: id,
        clientId: booking.clientId,
        type: 'deposit',
        amount: booking.depositAmount,
        method: 'mobile_money',
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

      await triggerOnStatusChange(id, 'deposit_received');
      setIsRecordingPayment(false);
    } catch (err) {
      console.error('Error recording deposit:', err);
      setIsRecordingPayment(false);
    }
  };

  const handleMarkBalanceReceived = async () => {
    setIsRecordingPayment(true);
    try {
      const balanceAmount = booking.totalPrice - booking.depositAmount;
      await recordPayment({
        bookingId: id,
        clientId: booking.clientId,
        type: 'balance',
        amount: balanceAmount > 0 ? balanceAmount : booking.totalPrice,
        method: 'bank_transfer',
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

      await triggerOnStatusChange(id, 'completed');
      setIsRecordingPayment(false);
    } catch (err) {
      console.error('Error recording balance:', err);
      setIsRecordingPayment(false);
    }
  };

  const statusOptions: { value: BookingStatus; label: string }[] = [
    { value: 'pending_contract', label: '1. Pending Contract' },
    { value: 'contract_sent', label: '2. Contract Sent' },
    { value: 'contract_signed', label: '3. Contract Signed' },
    { value: 'deposit_pending', label: '4. Deposit Pending' },
    { value: 'deposit_received', label: '5. Deposit Received' },
    { value: 'shoot_scheduled', label: '6. Shoot Scheduled' },
    { value: 'delivered', label: '7. Delivered' },
    { value: 'completed', label: '8. Completed' }
  ];

  return (
    <div className="pb-16">
      <Header
        title={`Booking: ${booking.clientName}`}
        subtitle={`ID: ${id.substring(0, 8)} • Service: ${booking.service}`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/bookings')}
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Back to Pipeline
          </Button>
        }
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Top Status & Overview Bar */}
        <Card className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-primary/30 bg-gradient-to-r from-surface-1 to-surface-2">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold font-serif text-on-surface">
                {booking.clientName}
              </h2>
              <Badge status={booking.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-primary" /> {booking.clientEmail}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-primary" /> {booking.clientPhone}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Shoot: {booking.shootDate}
              </span>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-1.5 shrink-0">
            <label className="block text-xs font-semibold uppercase tracking-wider text-primary">
              Move Workflow Stage
            </label>
            <Select
              options={statusOptions}
              value={booking.status}
              disabled={isUpdatingStatus}
              onChange={(e) => handleStatusChange(e.target.value as BookingStatus)}
            />
          </div>
        </Card>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Contract, Payments, Shoot Details) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Section */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-outline pb-3">
                <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-primary" /> DocuSeal Contract Integration
                </h3>
                <span className="text-xs text-primary font-semibold">
                  {booking.contractUrl ? 'Contract Active' : 'No Contract Generated'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-surface-2 p-3.5 rounded-xl border border-outline space-y-1">
                  <span className="text-on-surface-variant block">Contract Status</span>
                  <span className="font-bold text-on-surface text-sm capitalize">
                    {booking.status.includes('contract') ? booking.status.replace(/_/g, ' ') : 'Generated'}
                  </span>
                </div>

                <div className="bg-surface-2 p-3.5 rounded-xl border border-outline space-y-1">
                  <span className="text-on-surface-variant block">DocuSeal Document Link</span>
                  {booking.contractUrl ? (
                    <a
                      href={booking.contractUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline flex items-center gap-1 text-xs truncate"
                    >
                      Open e-Signature Document <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-on-surface-variant/40">Not generated yet</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  onClick={handleGenerateContract}
                  disabled={isGeneratingContract}
                  icon={<FileText className="w-4 h-4" />}
                >
                  {isGeneratingContract ? 'Generating via DocuSeal...' : 'Generate & Send Contract'}
                </Button>

                {booking.contractUrl && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(booking.contractUrl!);
                      alert('Contract URL copied to clipboard!');
                    }}
                    icon={<Send className="w-4 h-4" />}
                  >
                    Copy Contract Link
                  </Button>
                )}
              </div>
            </Card>

            {/* Payment Section */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-outline pb-3">
                <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Financials & Payment Tracking
                </h3>
                <span className="text-sm font-bold text-primary">
                  Total: ${booking.totalPrice?.toLocaleString()} USD
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-surface-2 p-3.5 rounded-xl border border-outline space-y-1">
                  <span className="text-on-surface-variant block">Deposit Amount (50%)</span>
                  <span className="font-bold text-on-surface text-base">
                    ${booking.depositAmount?.toLocaleString()}
                  </span>
                </div>

                <div className="bg-surface-2 p-3.5 rounded-xl border border-outline space-y-1">
                  <span className="text-on-surface-variant block">Deposit Deadline</span>
                  <span className="font-bold text-on-surface text-sm">
                    {booking.depositDeadline || 'Within 7 days of contract'}
                  </span>
                </div>

                <div className="bg-surface-2 p-3.5 rounded-xl border border-outline space-y-1">
                  <span className="text-on-surface-variant block">Balance Due On Delivery</span>
                  <span className="font-bold text-primary text-base">
                    ${(booking.totalPrice - booking.depositAmount)?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  onClick={handleMarkDepositReceived}
                  disabled={isRecordingPayment || booking.status === 'deposit_received' || booking.status === 'completed'}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Mark Deposit Received
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleMarkBalanceReceived}
                  disabled={isRecordingPayment || booking.status === 'completed'}
                  icon={<ShieldCheck className="w-4 h-4" />}
                >
                  Mark Balance Received
                </Button>
              </div>
            </Card>

            {/* Shoot Details Card */}
            <Card className="space-y-4">
              <h3 className="font-bold text-base text-on-surface border-b border-outline pb-3">
                Shoot Logistics & Venue Requirements
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-on-surface-variant block font-semibold uppercase">Primary Location</span>
                  <p className="text-on-surface mt-1 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {booking.location || 'Location Pending'}
                  </p>
                </div>

                <div>
                  <span className="text-on-surface-variant block font-semibold uppercase">Backup Date</span>
                  <p className="text-on-surface mt-1 font-medium">
                    {booking.backupDate || 'None specified'}
                  </p>
                </div>

                {booking.specialRequirements && (
                  <div className="sm:col-span-2 pt-2 border-t border-outline">
                    <span className="text-on-surface-variant block font-semibold uppercase">Special Requirements</span>
                    <p className="text-on-surface mt-1 bg-surface-2 p-3 rounded-lg border border-outline text-xs">
                      {booking.specialRequirements}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column (Notes & Activity Log) */}
          <div className="space-y-6">
            {/* Internal Notes */}
            <Card className="space-y-3">
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" /> Internal Notes
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Private notes for James Akabo Jnr. The client never sees this.
              </p>
              <textarea
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter private studio notes..."
                className="w-full bg-surface-2 text-on-surface border border-outline rounded-lg p-3 text-xs focus:border-primary focus:outline-none"
              />
              <Button size="sm" onClick={handleSaveNotes} className="w-full">
                Save Notes
              </Button>
            </Card>

            {/* Auto-generated Activity Log */}
            <Card className="space-y-3">
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Workflow Activity Log
              </h3>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {!booking.activityLog || booking.activityLog.length === 0 ? (
                  <p className="text-xs text-on-surface-variant/40">No activity recorded yet.</p>
                ) : (
                  booking.activityLog.map((log) => (
                    <div
                      key={log.id}
                      className="bg-surface-2 p-3 rounded-xl border border-outline space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-on-surface">
                        <span className="font-semibold">{log.title}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                        <span>{log.author}</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Contract Generated Confirmation Modal */}
      {contractModalData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-outline rounded-2xl max-w-xl w-full p-6 space-y-5 text-xs text-on-surface">
            <div className="flex justify-between items-center border-b border-outline pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-on-surface">Contract Generated & Emailed</h3>
              </div>
              <button
                onClick={() => setContractModalData(null)}
                className="text-on-surface-variant hover:text-on-surface text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              The contract has been generated via DocuSeal and Vividel's system automatically emailed the signing link to <strong className="text-on-surface">{contractModalData.clientEmail}</strong>. You can also share it directly below:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={`https://wa.me/${contractModalData.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Please review and sign your Vividel Inc. contract: ${contractModalData.contractUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-black hover:opacity-90 py-2.5 px-4 rounded-xl font-bold transition-all"
              >
                <Send className="w-4 h-4" /> Send via WhatsApp
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(contractModalData.contractUrl);
                  alert('Contract URL copied to clipboard!');
                }}
                className="inline-flex items-center justify-center gap-2 bg-surface-2 text-on-surface hover:bg-surface-1 border border-outline py-2.5 px-4 rounded-xl font-semibold transition-all"
              >
                Copy Contract Link
              </button>

              <a
                href={contractModalData.contractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-surface-2 text-primary hover:bg-surface-1 border border-primary/30 py-2.5 px-4 rounded-xl font-semibold transition-all sm:col-span-2"
              >
                <ExternalLink className="w-4 h-4" /> View Contract Page
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
