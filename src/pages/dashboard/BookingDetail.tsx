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
  updateBookingStatus,
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
  const [emailModalData, setEmailModalData] = useState<{
    contractUrl: string;
    emailSubject: string;
    emailBody: string;
    clientEmail: string;
    clientName: string;
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
      <div className="p-12 text-center text-xs text-[#F5F0E8]/60">
        Loading booking details...
      </div>
    );
  }

  if (!booking || !id) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-[#F5F0E8]">Booking record not found.</p>
        <Button onClick={() => navigate('/dashboard/bookings')}>Return to Pipeline</Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: BookingStatus) => {
    setIsUpdatingStatus(true);
    try {
      const oldStatus = booking.status;
      await updateBookingStatus(id, newStatus);
      await triggerOnStatusChange(id, oldStatus, newStatus);
      setIsUpdatingStatus(false);
    } catch (err) {
      console.error('Error changing status:', err);
      setIsUpdatingStatus(false);
    }
  };

  const handleGenerateContract = async () => {
    setIsGeneratingContract(true);
    try {
      const res = await generateContract(id);
      setIsGeneratingContract(false);
      if (res && res.contractUrl) {
        setEmailModalData(res);
      }
    } catch (err) {
      console.error('Error generating contract:', err);
      setIsGeneratingContract(false);
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

      const oldStatus = booking.status;
      await updateBookingStatus(id, 'deposit_received');
      await triggerOnStatusChange(id, oldStatus, 'deposit_received');
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

      const oldStatus = booking.status;
      await updateBookingStatus(id, 'completed');
      await triggerOnStatusChange(id, oldStatus, 'completed');
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
        <Card className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-[#40E0D0]/30 bg-gradient-to-r from-[#3E3521] to-[#2B2414]">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold font-serif text-[#E9E4DC]">
                {booking.clientName}
              </h2>
              <Badge status={booking.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#BCA890]">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#40E0D0]" /> {booking.clientEmail}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#40E0D0]" /> {booking.clientPhone}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#40E0D0]" /> Shoot: {booking.shootDate}
              </span>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-1.5 shrink-0">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#40E0D0]">
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
              <div className="flex items-center justify-between border-b border-[#554A32] pb-3">
                <h3 className="font-bold text-base text-[#E9E4DC] flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-[#40E0D0]" /> DocuSeal Contract Integration
                </h3>
                <span className="text-xs text-[#40E0D0] font-semibold">
                  {booking.contractUrl ? 'Contract Active' : 'No Contract Generated'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#2B2414] p-3.5 rounded-xl border border-[#554A32] space-y-1">
                  <span className="text-[#BCA890] block">Contract Status</span>
                  <span className="font-bold text-[#E9E4DC] text-sm capitalize">
                    {booking.status.includes('contract') ? booking.status.replace(/_/g, ' ') : 'Generated'}
                  </span>
                </div>

                <div className="bg-[#2B2414] p-3.5 rounded-xl border border-[#554A32] space-y-1">
                  <span className="text-[#BCA890] block">DocuSeal Document Link</span>
                  {booking.contractUrl ? (
                    <a
                      href={booking.contractUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#40E0D0] font-semibold hover:underline flex items-center gap-1 text-xs truncate"
                    >
                      Open e-Signature Document <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[#BCA890]/40">Not generated yet</span>
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
              <div className="flex items-center justify-between border-b border-[#554A32] pb-3">
                <h3 className="font-bold text-base text-[#E9E4DC] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#40E0D0]" /> Financials & Payment Tracking
                </h3>
                <span className="text-sm font-bold text-[#40E0D0]">
                  Total: ${booking.totalPrice?.toLocaleString()} USD
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-[#2B2414] p-3.5 rounded-xl border border-[#554A32] space-y-1">
                  <span className="text-[#BCA890] block">Deposit Amount (50%)</span>
                  <span className="font-bold text-[#E9E4DC] text-base">
                    ${booking.depositAmount?.toLocaleString()}
                  </span>
                </div>

                <div className="bg-[#2B2414] p-3.5 rounded-xl border border-[#554A32] space-y-1">
                  <span className="text-[#BCA890] block">Deposit Deadline</span>
                  <span className="font-bold text-[#E9E4DC] text-sm">
                    {booking.depositDeadline || 'Within 7 days of contract'}
                  </span>
                </div>

                <div className="bg-[#2B2414] p-3.5 rounded-xl border border-[#554A32] space-y-1">
                  <span className="text-[#BCA890] block">Balance Due On Delivery</span>
                  <span className="font-bold text-[#40E0D0] text-base">
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
              <h3 className="font-bold text-base text-[#E9E4DC] border-b border-[#554A32] pb-3">
                Shoot Logistics & Venue Requirements
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#BCA890] block font-semibold uppercase">Primary Location</span>
                  <p className="text-[#E9E4DC] mt-1 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#40E0D0]" /> {booking.location || 'Location Pending'}
                  </p>
                </div>

                <div>
                  <span className="text-[#BCA890] block font-semibold uppercase">Backup Date</span>
                  <p className="text-[#E9E4DC] mt-1 font-medium">
                    {booking.backupDate || 'None specified'}
                  </p>
                </div>

                {booking.specialRequirements && (
                  <div className="sm:col-span-2 pt-2 border-t border-[#554A32]">
                    <span className="text-[#BCA890] block font-semibold uppercase">Special Requirements</span>
                    <p className="text-[#E9E4DC] mt-1 bg-[#2B2414] p-3 rounded-lg border border-[#554A32] text-xs">
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
              <h3 className="font-bold text-sm text-[#E9E4DC] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#40E0D0]" /> Internal Notes
              </h3>
              <p className="text-[11px] text-[#BCA890]">
                Private notes for James Akabo Jnr. The client never sees this.
              </p>
              <textarea
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter private studio notes..."
                className="w-full bg-[#2B2414] text-[#E9E4DC] border border-[#554A32] rounded-lg p-3 text-xs focus:border-[#40E0D0] focus:outline-none"
              />
              <Button size="sm" onClick={handleSaveNotes} className="w-full">
                Save Notes
              </Button>
            </Card>

            {/* Auto-generated Activity Log */}
            <Card className="space-y-3">
              <h3 className="font-bold text-sm text-[#E9E4DC] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#40E0D0]" /> Workflow Activity Log
              </h3>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {!booking.activityLog || booking.activityLog.length === 0 ? (
                  <p className="text-xs text-[#BCA890]/40">No activity recorded yet.</p>
                ) : (
                  booking.activityLog.map((log) => (
                    <div
                      key={log.id}
                      className="bg-[#2B2414] p-3 rounded-xl border border-[#554A32] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[#E9E4DC]">
                        <span className="font-semibold">{log.title}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#BCA890]">
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

      {/* Contract Email Dispatch Modal */}
      {emailModalData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A28] border border-[#554A32] rounded-2xl max-w-xl w-full p-6 space-y-5 text-xs text-[#E9E4DC]">
            <div className="flex justify-between items-center border-b border-[#554A32] pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#40E0D0]" />
                <h3 className="font-bold text-base text-[#E9E4DC]">Contract Agreement Email Ready</h3>
              </div>
              <button
                onClick={() => setEmailModalData(null)}
                className="text-[#BCA890] hover:text-[#E9E4DC] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#BCA890]">
              The e-signature contract agreement link has been generated. You can send it directly to <strong className="text-[#E9E4DC]">{emailModalData.clientEmail}</strong> via email or WhatsApp below:
            </p>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[#40E0D0] tracking-wider">Email Subject</label>
              <div className="bg-[#2B2414] p-2.5 rounded-lg border border-[#554A32] font-semibold text-[#E9E4DC]">
                {emailModalData.emailSubject}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[#40E0D0] tracking-wider">Email Message Body</label>
              <textarea
                rows={6}
                readOnly
                value={emailModalData.emailBody}
                className="w-full bg-[#2B2414] text-[#E9E4DC] border border-[#554A32] rounded-lg p-3 text-xs focus:outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={`mailto:${emailModalData.clientEmail}?subject=${encodeURIComponent(emailModalData.emailSubject)}&body=${encodeURIComponent(emailModalData.emailBody)}`}
                className="inline-flex items-center justify-center gap-2 bg-[#40E0D0] text-[#12121C] hover:bg-[#32c8b8] py-2.5 px-4 rounded-xl font-bold transition-all"
              >
                <Mail className="w-4 h-4" /> Open Email Client
              </a>

              <a
                href={`https://wa.me/${emailModalData.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(emailModalData.emailBody)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-black hover:opacity-90 py-2.5 px-4 rounded-xl font-bold transition-all"
              >
                <Send className="w-4 h-4" /> Send via WhatsApp
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(emailModalData.emailBody);
                  alert('Contract email text copied to clipboard!');
                }}
                className="inline-flex items-center justify-center gap-2 bg-[#2B2414] text-[#E9E4DC] hover:bg-[#3E3521] border border-[#554A32] py-2.5 px-4 rounded-xl font-semibold transition-all"
              >
                Copy Email Text
              </button>

              <a
                href={emailModalData.contractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#2B2414] text-[#40E0D0] hover:bg-[#3E3521] border border-[#40E0D0]/30 py-2.5 px-4 rounded-xl font-semibold transition-all"
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
