import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/dashboard/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Booking, Lead, Payment } from '../../types';
import { subscribeToBookings, subscribeToLeads, subscribeToPayments, subscribeToSettings } from '../../firebase/firestore';
import { NewBookingModal } from '../../components/dashboard/NewBookingModal';
import { Users, CalendarCheck, Clock, DollarSign, ArrowUpRight, Plus, Calendar, Layers, ExternalLink } from 'lucide-react';

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [calComLink, setCalComLink] = useState<string>('https://cal.com/vividel');
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);

  useEffect(() => {
    const unsubB = subscribeToBookings(setBookings);
    const unsubL = subscribeToLeads(setLeads);
    const unsubP = subscribeToPayments(setPayments);
    const unsubS = subscribeToSettings((st) => {
      if (st.calComLink) setCalComLink(st.calComLink);
    });

    return () => {
      unsubB();
      unsubL();
      unsubP();
      unsubS();
    };
  }, []);

  // Compute stats
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const newLeadsThisWeek = leads.filter(
    (l) => new Date(l.createdAt) >= oneWeekAgo
  ).length;

  const awaitingContractCount = bookings.filter(
    (b) => b.status === 'pending_contract' || b.status === 'contract_sent'
  ).length;

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const upcomingShootsThisMonth = bookings.filter((b) => {
    if (!b.shootDate) return false;
    const d = new Date(b.shootDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const pendingPaymentsCount = bookings.filter(
    (b) => b.status === 'deposit_pending' || b.status === 'contract_signed'
  ).length;

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="pb-12">
      <Header
        title="Studio Overview"
        subtitle="Operational metrics, active bookings pipeline, and client inquiries"
        action={
          <Button
            size="sm"
            onClick={() => setIsNewBookingOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            New Booking
          </Button>
        }
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#F2F4F5]/60">
                New Leads (This Week)
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#F2F4F5] font-serif">
                {newLeadsThisWeek}
              </span>
              <span className="text-xs text-[#F2F4F5]/50">inquiries</span>
            </div>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#F2F4F5]/60">
                Awaiting Contract
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#F2F4F5] font-serif">
                {awaitingContractCount}
              </span>
              <span className="text-xs text-[#F2F4F5]/50">contracts pending</span>
            </div>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#F2F4F5]/60">
                Shoots This Month
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#F2F4F5] font-serif">
                {upcomingShootsThisMonth}
              </span>
              <span className="text-xs text-[#F2F4F5]/50">scheduled</span>
            </div>
          </Card>

          <Card className="border-l-4 border-l-[#2DD4BF]">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#8B96A0]">
                Pending Payments
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/15 flex items-center justify-center text-[#2DD4BF]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#F2F4F5] font-serif">
                {pendingPaymentsCount}
              </span>
              <span className="text-xs text-[#8B96A0]">deposits pending</span>
            </div>
          </Card>
        </div>

        {/* Recent Bookings & Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-serif text-[#F2F4F5] flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#2DD4BF]" /> Recent Bookings
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard/bookings')}
                icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                View Pipeline
              </Button>
            </div>

            <Card className="p-0 overflow-hidden divide-y divide-[#262D34]">
              {recentBookings.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8B96A0]">
                  No bookings registered yet. Share your booking link to receive requests.
                </div>
              ) : (
                recentBookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => navigate(`/dashboard/bookings/${b.id}`)}
                    className="p-4 hover:bg-[#262D34]/40 transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#F2F4F5]">
                          {b.clientName}
                        </span>
                        <Badge status={b.status} size="sm" />
                      </div>
                      <p className="text-xs text-[#8B96A0]">
                        {b.service} • <span className="text-[#2DD4BF] font-semibold">${b.totalPrice?.toLocaleString()}</span>
                      </p>
                    </div>

                    <div className="text-right text-xs shrink-0">
                      <div className="flex items-center gap-1 text-[#F2F4F5]/80">
                        <Calendar className="w-3.5 h-3.5 text-[#2DD4BF]" />
                        {b.shootDate ? new Date(b.shootDate).toLocaleDateString() : 'TBD'}
                      </div>
                      <span className="text-[10px] text-[#8B96A0] block mt-1">
                        {b.location || 'Accra, Ghana'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>

          {/* Quick Actions & Cal.com Embed CTA */}
          <div className="space-y-6">
            <Card className="space-y-4 border-[#2DD4BF]/30 bg-gradient-to-b from-[#171D23] to-[#0A0D10]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF]">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#F2F4F5]">Share Booking Form</h3>
              </div>
              <p className="text-xs text-[#8B96A0] leading-relaxed">
                Direct post-discovery call clients to the digital booking portal to capture project details and trigger contracts.
              </p>
              <Button
                className="w-full"
                onClick={() => {
                  window.open('/book', '_blank');
                }}
                icon={<ExternalLink className="w-4 h-4" />}
              >
                Open Client Form (/book)
              </Button>
            </Card>

            <Card className="space-y-3">
              <h3 className="font-bold text-sm text-[#F2F4F5] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2DD4BF]" /> Cal.com Discovery Scheduling
              </h3>
              <p className="text-xs text-[#8B96A0]">
                Discovery call scheduling is handled directly via Cal.com before sending clients to the booking portal.
              </p>
              <a
                href={calComLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-xs text-[#2DD4BF] bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/20 w-full py-2 rounded-lg font-medium transition-all"
              >
                Launch Cal.com Calendar <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Card>
          </div>
        </div>
      </div>

      <NewBookingModal
        isOpen={isNewBookingOpen}
        onClose={() => setIsNewBookingOpen(false)}
      />
    </div>
  );
};
