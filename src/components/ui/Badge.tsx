import React from 'react';
import { BookingStatus, LeadStatus } from '../../types';

interface BadgeProps {
  status: BookingStatus | LeadStatus | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeStyle = (st: string) => {
    switch (st) {
      // Lead statuses
      case 'new':
        return 'bg-[#2DD4BF]/20 text-[#2DD4BF] border-[#2DD4BF]/40';
      case 'called':
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
      case 'converted':
        return 'bg-[#059669]/30 text-[#34D399] border-[#059669]/60';
      case 'lost':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';

      // Booking statuses
      case 'pending_contract':
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
      case 'contract_sent':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'contract_signed':
        return 'bg-[#2DD4BF]/20 text-[#2DD4BF] border-[#2DD4BF]/40';
      case 'deposit_pending':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'deposit_received':
        return 'bg-[#059669]/30 text-[#34D399] border-[#059669]/60';
      case 'shoot_scheduled':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'delivered':
        return 'bg-[#059669]/25 text-[#34D399] border-[#059669]/50';
      case 'completed':
        return 'bg-[#2DD4BF]/25 text-[#2DD4BF] border-[#2DD4BF]/60 font-semibold';

      default:
        return 'bg-gray-500/15 text-gray-300 border-gray-500/30';
    }
  };

  const formatLabel = (st: string) => {
    return st.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeStyles} ${getBadgeStyle(
        status
      )}`}
    >
      {formatLabel(status)}
    </span>
  );
};
