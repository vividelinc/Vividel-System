import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/dashboard/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Booking, BookingStatus } from '../../types';
import { subscribeToBookings } from '../../firebase/firestore';
import { triggerOnStatusChange } from '../../services/cloudFunctions';
import { NewBookingModal } from '../../components/dashboard/NewBookingModal';
import { Plus, Calendar, DollarSign, ChevronRight, ChevronLeft, Layers } from 'lucide-react';

export const Bookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToBookings(setBookings);
    return () => unsub();
  }, []);

  const columns: { id: BookingStatus; label: string; color: string }[] = [
    { id: 'pending_contract', label: 'Pending Contract', color: 'border-t-amber-500' },
    { id: 'contract_sent', label: 'Contract Sent', color: 'border-t-indigo-500' },
    { id: 'contract_signed', label: 'Contract Signed', color: 'border-t-cyan-500' },
    { id: 'deposit_pending', label: 'Deposit Pending', color: 'border-t-yellow-500' },
    { id: 'deposit_received', label: 'Deposit Received', color: 'border-t-emerald-500' },
    { id: 'shoot_scheduled', label: 'Shoot Scheduled', color: 'border-t-purple-500' },
    { id: 'delivered', label: 'Delivered', color: 'border-t-teal-500' },
    { id: 'completed', label: 'Completed', color: 'border-t-[#2DD4BF]' }
  ];

  const handleMoveStatus = async (
    bookingId: string,
    currentStatus: BookingStatus,
    direction: 'next' | 'prev'
  ) => {
    const statusOrder: BookingStatus[] = [
      'pending_contract',
      'contract_sent',
      'contract_signed',
      'deposit_pending',
      'deposit_received',
      'shoot_scheduled',
      'delivered',
      'completed'
    ];

    const currentIndex = statusOrder.indexOf(currentStatus);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < statusOrder.length) {
      const nextStatus = statusOrder[newIndex];
      await triggerOnStatusChange(bookingId, nextStatus);
    }
  };

  return (
    <div className="pb-12 min-h-screen">
      <Header
        title="Bookings Pipeline"
        subtitle="Kanban workflow tracking contracts, deposits, shoot dates, and gallery deliveries"
        action={
          <Button
            size="sm"
            onClick={() => setIsNewBookingOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Booking
          </Button>
        }
      />

      <div className="p-8 max-w-[1700px] mx-auto overflow-x-auto">
        <div className="flex gap-4 min-w-[1400px]">
          {columns.map((col) => {
            const colBookings = bookings.filter((b) => b.status === col.id);
            return (
              <div
                key={col.id}
                className="w-72 shrink-0 bg-[#10151A] border border-[#262D34] rounded-2xl flex flex-col max-h-[calc(100vh-180px)] shadow-lg"
              >
                {/* Column Header */}
                <div
                  className={`p-4 border-b border-[#262D34] border-t-4 ${col.color} flex items-center justify-between bg-[#10151A]/90 rounded-t-2xl`}
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#F2F4F5] flex items-center gap-1.5">
                    {col.label}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#262D34] text-[#2DD4BF]">
                    {colBookings.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {colBookings.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#8B96A0]/40 border border-dashed border-[#262D34] rounded-xl">
                      No bookings in stage
                    </div>
                  ) : (
                    colBookings.map((b) => (
                      <Card
                        key={b.id}
                        onClick={() => navigate(`/dashboard/bookings/${b.id}`)}
                        className="p-4 space-y-3 border-[#262D34] bg-[#171D23] hover:border-[#2DD4BF]/60 transition-all cursor-pointer relative group"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-[#F2F4F5] group-hover:text-[#2DD4BF] transition-colors">
                            {b.clientName}
                          </h4>
                          <p className="text-xs text-[#8B96A0] mt-0.5">
                            {b.service}
                          </p>
                        </div>

                        <div className="space-y-1 text-xs pt-2 border-t border-[#262D34]/80">
                          <div className="flex items-center justify-between text-[#F2F4F5]/80">
                            <span className="flex items-center gap-1 text-[11px]">
                              <Calendar className="w-3 h-3 text-[#2DD4BF]" />
                              {b.shootDate ? new Date(b.shootDate).toLocaleDateString() : 'Date TBD'}
                            </span>
                            <span className="font-bold text-[#2DD4BF]">
                              ${b.totalPrice?.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#8B96A0]/70 pt-1">
                            <span>Deposit: ${b.depositAmount}</span>
                            <span className="capitalize">{b.location || 'Accra'}</span>
                          </div>
                        </div>

                        {/* Direct Quick Move Arrow Controls */}
                        <div
                          className="flex items-center justify-between pt-2 border-t border-[#262D34]/50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            disabled={col.id === 'pending_contract'}
                            onClick={() => b.id && handleMoveStatus(b.id, b.status, 'prev')}
                            title="Move to previous status"
                            className="p-1 rounded bg-[#0A0D10] text-[#8B96A0] hover:text-[#F2F4F5] hover:bg-[#262D34] disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          <span className="text-[10px] text-[#8B96A0]/50">Quick Move</span>

                          <button
                            disabled={col.id === 'completed'}
                            onClick={() => b.id && handleMoveStatus(b.id, b.status, 'next')}
                            title="Move to next status"
                            className="p-1 rounded bg-[#0A0D10] text-[#2DD4BF] hover:bg-[#2DD4BF]/20 disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NewBookingModal
        isOpen={isNewBookingOpen}
        onClose={() => setIsNewBookingOpen(false)}
      />
    </div>
  );
};
