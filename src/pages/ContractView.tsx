import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Booking } from '../types';
import { getBookingById, subscribeToBookingDetail, updateBookingFields, updateBookingStatus, getSettings } from '../firebase/firestore';
import { triggerOnStatusChange } from '../services/cloudFunctions';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  FileCheck,
  CheckCircle2,
  Printer,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Mail,
  Phone,
  ShieldCheck,
  PenTool,
  ArrowLeft,
  Clock,
  Send
} from 'lucide-react';

export const ContractView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [typedSignature, setTypedSignature] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [momoDetails, setMomoDetails] = useState('');
  const [bankDetails, setBankDetails] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'type' | 'draw'>('type');
  const [drawnSignatureData, setDrawnSignatureData] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    let isMounted = true;

    const unsubDetail = subscribeToBookingDetail(id, (b) => {
      if (b && isMounted) {
        setBooking(b);
        setTypedSignature(b.signedName || b.clientName || '');
        setLoading(false);
      }
    });

    getBookingById(id).then((b) => {
      if (isMounted) {
        if (b) {
          setBooking(b);
          setTypedSignature(b.signedName || b.clientName || '');
          setLoading(false);
        } else {
          // Grace period to ensure Firestore subscriptions finish
          setTimeout(() => {
            if (isMounted) setLoading(false);
          }, 1500);
        }
      }
    });

    getSettings().then((st) => {
      if (isMounted) {
        if (st.momoNumber) setMomoDetails(`${st.momoNumber} (${st.momoName})`);
        if (st.bankName) setBankDetails(`${st.bankName} - Acc: ${st.accountNumber}`);
      }
    });

    return () => {
      isMounted = false;
      unsubDetail();
    };
  }, [id]);

  // Drawing Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#40E0D0';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setDrawnSignatureData(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawnSignatureData(null);
  };

  const handleSignContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !booking) return;

    const finalSignatureName = signatureMode === 'type' ? typedSignature.trim() : (typedSignature || booking.clientName);

    if (!finalSignatureName) {
      alert('Please enter your full name for signature verification.');
      return;
    }

    if (!isAgreed) {
      alert('Please check the confirmation box to agree to the contract terms.');
      return;
    }

    setIsSubmitting(true);
    const signedTimestamp = new Date().toISOString();

    try {
      const oldStatus = booking.status;
      const updatedFields = {
        status: 'contract_signed' as const,
        signedAt: signedTimestamp,
        signedName: finalSignatureName
      };

      await updateBookingFields(id, updatedFields);
      await updateBookingStatus(
        id,
        'contract_signed',
        finalSignatureName,
        `Contract e-signed by client ${finalSignatureName}`
      );
      await triggerOnStatusChange(id, oldStatus, 'contract_signed');

      setBooking((prev) => prev ? { ...prev, ...updatedFields } : null);
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      console.error('Error signing contract:', err);
      setIsSubmitting(false);
      alert('An error occurred while submitting your signature. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#12121C] flex items-center justify-center p-6 text-[#E9E4DC]">
        <div className="text-center space-y-3">
          <Clock className="w-8 h-8 text-[#40E0D0] animate-spin mx-auto" />
          <p className="text-sm">Loading official photography contract...</p>
        </div>
      </div>
    );
  }

  if (!booking || !id) {
    return (
      <div className="min-h-screen bg-[#12121C] flex items-center justify-center p-6 text-[#E9E4DC]">
        <div className="text-center space-y-4 max-w-md">
          <FileCheck className="w-12 h-12 text-[#40E0D0]/50 mx-auto" />
          <h1 className="text-xl font-bold font-serif">Contract Not Found</h1>
          <p className="text-xs text-[#BCA890]">
            The requested contract agreement link is invalid or may have expired. Please contact Vividel Inc for assistance.
          </p>
        </div>
      </div>
    );
  }

  const isAlreadySigned = booking.status === 'contract_signed' || booking.signedAt;

  return (
    <div className="min-h-screen bg-[#12121C] text-[#E9E4DC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Branding Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#554A32] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#40E0D0]/10 border border-[#40E0D0]/30 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-[#40E0D0]" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif tracking-wide text-[#E9E4DC]">
                VIVIDEL INC.
              </h1>
              <p className="text-xs text-[#BCA890]">Official Client e-Signature Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              icon={<Printer className="w-3.5 h-3.5" />}
            >
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Success Banner */}
        {(isSuccess || isAlreadySigned) && (
          <div className="bg-[#40E0D0]/10 border border-[#40E0D0]/40 rounded-2xl p-6 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#40E0D0]/20 text-[#40E0D0] mb-1">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-[#E9E4DC]">Contract E-Signed & Executed!</h2>
            <p className="text-xs text-[#BCA890] max-w-lg mx-auto">
              Thank you, <strong className="text-[#E9E4DC]">{booking.signedName || booking.clientName}</strong>! Your photography services agreement has been legally verified and logged on {booking.signedAt ? new Date(booking.signedAt).toLocaleString() : 'today'}.
            </p>
          </div>
        )}

        {/* Main Paper Document View */}
        <div className="bg-[#1A1A28] border border-[#554A32] rounded-2xl shadow-2xl p-6 sm:p-10 space-y-8 text-xs sm:text-sm leading-relaxed font-sans text-[#E9E4DC] print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
          
          {/* Document Header */}
          <div className="border-b border-[#554A32] pb-6 space-y-3">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#40E0D0]">
                  PHOTOGRAPHY SERVICES AGREEMENT
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#E9E4DC] mt-1">
                  Client Booking Contract
                </h2>
              </div>
              <div className="text-right text-xs text-[#BCA890] space-y-0.5">
                <p>Ref: <strong className="text-[#E9E4DC] font-mono">VIV-CTR-{id.substring(0, 8)}</strong></p>
                <p>Date Generated: {new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Parties & Session Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#232334] p-5 rounded-xl border border-[#554A32]/60">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#40E0D0] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Service Provider (Studio)
              </h3>
              <p className="font-semibold text-[#E9E4DC]">Vividel Inc.</p>
              <p className="text-xs text-[#BCA890]">Primary Photographer: James Akabo Jnr</p>
              <p className="text-xs text-[#BCA890]">Email: vividelinc@gmail.com</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#40E0D0] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Client Details
              </h3>
              <p className="font-semibold text-[#E9E4DC]">{booking.clientName}</p>
              <p className="text-xs text-[#BCA890]">Email: {booking.clientEmail}</p>
              <p className="text-xs text-[#BCA890]">Phone: {booking.clientPhone}</p>
            </div>
          </div>

          {/* Shoot Specifications Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#40E0D0] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Shoot Specifications & Financial Summary
            </h3>

            <div className="border border-[#554A32] rounded-xl overflow-hidden divide-y divide-[#554A32]">
              <div className="grid grid-cols-2 sm:grid-cols-4 p-3 bg-[#2B2414] text-xs font-semibold text-[#BCA890]">
                <span>Service Package</span>
                <span>Shoot Date</span>
                <span>Shoot Location</span>
                <span className="text-right">Package Fee</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 p-3.5 text-xs text-[#E9E4DC] items-center">
                <span className="font-bold text-[#40E0D0]">{booking.service}</span>
                <span>{booking.shootDate} {booking.backupDate ? `(Backup: ${booking.backupDate})` : ''}</span>
                <span className="truncate">{booking.location || 'Studio / To be agreed'}</span>
                <span className="text-right font-bold text-base text-[#E9E4DC]">${booking.totalPrice}</span>
              </div>
              <div className="p-3.5 bg-[#232334] flex flex-wrap justify-between items-center text-xs gap-2">
                <span className="text-[#BCA890]">Required Retainer Deposit (50%):</span>
                <span className="font-bold text-[#40E0D0] text-sm">${booking.depositAmount} USD</span>
              </div>
            </div>
          </div>

          {/* Standard Contract Clauses */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#40E0D0] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Terms & Conditions
            </h3>

            <div className="space-y-3 text-xs text-[#BCA890] leading-relaxed bg-[#232334]/50 p-5 rounded-xl border border-[#554A32]/40">
              <div>
                <strong className="text-[#E9E4DC]">1. Retainer Deposit & Payment Schedule:</strong>
                <p className="mt-0.5">
                  A non-refundable retainer deposit of <strong>${booking.depositAmount}</strong> is required upon signing to reserve the shoot date. The remaining balance of <strong>${booking.totalPrice - booking.depositAmount}</strong> is due on or before the day of the photoshoot.
                </p>
              </div>

              <div>
                <strong className="text-[#E9E4DC]">2. Payment Channels:</strong>
                <p className="mt-0.5">
                  Payments are accepted via Mobile Money {momoDetails ? `(${momoDetails})` : ''} or Bank Transfer {bankDetails ? `(${bankDetails})` : ''}.
                </p>
              </div>

              <div>
                <strong className="text-[#E9E4DC]">3. Rescheduling & Weather Policy:</strong>
                <p className="mt-0.5">
                  Rescheduling requested at least 48 hours in advance will transfer the retainer deposit to an agreed backup date without penalty. Outdoor shoots delayed due to severe weather will be rescheduled at no additional fee.
                </p>
              </div>

              <div>
                <strong className="text-[#E9E4DC]">4. Copyright & Image Usage Rights:</strong>
                <p className="mt-0.5">
                  Vividel Inc. retains full copyright of all photographs produced. The client is granted an exclusive personal usage license for digital sharing, printing, and personal promotional display.
                </p>
              </div>

              <div>
                <strong className="text-[#E9E4DC]">5. Delivery Timeline:</strong>
                <p className="mt-0.5">
                  High-resolution edited digital gallery deliverables will be delivered within 5–7 business days following the completed shoot date.
                </p>
              </div>
            </div>
          </div>

          {/* Signature Verification Block */}
          <div className="pt-6 border-t border-[#554A32] space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#40E0D0] flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5" /> Electronic Signature Verification
            </h3>

            {isAlreadySigned ? (
              <div className="bg-[#232334] p-6 rounded-xl border border-[#40E0D0]/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-[#BCA890]">Client E-Signature:</span>
                  <span className="text-xs font-mono text-[#40E0D0]">Verified Signature #VS-{id.substring(0, 6).toUpperCase()}</span>
                </div>
                <div className="font-serif italic text-2xl font-bold text-[#E9E4DC] border-b border-[#554A32] pb-2">
                  {booking.signedName || booking.clientName}
                </div>
                <div className="flex flex-wrap justify-between text-xs text-[#BCA890] pt-1">
                  <span>Signer: {booking.signedName || booking.clientName} ({booking.clientEmail})</span>
                  <span>Signed On: {new Date(booking.signedAt!).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignContract} className="space-y-6 print:hidden">
                {/* Signature Mode Selector */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setSignatureMode('type')}
                    className={`text-xs px-4 py-2 rounded-lg font-medium border transition-all ${
                      signatureMode === 'type'
                        ? 'bg-[#40E0D0]/20 border-[#40E0D0] text-[#40E0D0]'
                        : 'bg-[#232334] border-[#554A32] text-[#BCA890]'
                    }`}
                  >
                    Type Signature
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureMode('draw')}
                    className={`text-xs px-4 py-2 rounded-lg font-medium border transition-all ${
                      signatureMode === 'draw'
                        ? 'bg-[#40E0D0]/20 border-[#40E0D0] text-[#40E0D0]'
                        : 'bg-[#232334] border-[#554A32] text-[#BCA890]'
                    }`}
                  >
                    Draw Signature
                  </button>
                </div>

                {signatureMode === 'type' ? (
                  <div className="space-y-2">
                    <Input
                      label="Type Full Legal Name for Signature"
                      placeholder="e.g. Sarah Jenkins"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                    />
                    {typedSignature && (
                      <div className="p-4 bg-[#232334] rounded-xl border border-[#554A32] font-serif italic text-xl text-[#40E0D0]">
                        {typedSignature}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#BCA890]">
                      Draw Signature Below
                    </label>
                    <div className="bg-[#232334] border border-[#554A32] rounded-xl p-2 relative">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={120}
                        className="w-full h-28 cursor-crosshair touch-none bg-[#12121C] rounded-lg"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="absolute bottom-4 right-4 text-[10px] bg-[#2B2414] text-[#BCA890] hover:text-[#E9E4DC] px-2.5 py-1 rounded border border-[#554A32]"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* Agreement Checkbox */}
                <label className="flex items-start gap-3 text-xs text-[#BCA890] cursor-pointer bg-[#232334] p-4 rounded-xl border border-[#554A32]">
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-[#554A32] bg-[#12121C] text-[#40E0D0] focus:ring-[#40E0D0]"
                  />
                  <span>
                    I, <strong className="text-[#E9E4DC]">{typedSignature || booking.clientName}</strong>, confirm that I am authorized to sign this photography services agreement and agree to all terms and conditions stated above.
                  </span>
                </label>

                <Button
                  type="submit"
                  disabled={isSubmitting || !isAgreed}
                  className="w-full py-3.5 text-sm font-semibold"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Signing Contract...' : 'Sign & Submit Photography Agreement'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
