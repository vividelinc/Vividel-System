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
        return 'bg-[#40E0D0]/20 text-[#40E0D0] border-[#40E0D0]/40';
      case 'called':
        return 'bg-[#BCA890]/20 text-[#BCA890] border-[#BCA890]/40';
      case 'converted':
        return 'bg-[#585D27]/30 text-[#A2AC48] border-[#585D27]/60';
      case 'lost':
        return 'bg-[#775B45]/25 text-[#D19D7A] border-[#775B45]/50';

      // Booking statuses
      case 'pending_contract':
        return 'bg-[#775B45]/30 text-[#E3B08B] border-[#775B45]/60';
      case 'contract_sent':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'contract_signed':
        return 'bg-[#40E0D0]/20 text-[#40E0D0] border-[#40E0D0]/40';
      case 'deposit_pending':
        return 'bg-[#BCA890]/25 text-[#E9E4DC] border-[#BCA890]/50';
      case 'deposit_received':
        return 'bg-[#585D27]/30 text-[#A2AC48] border-[#585D27]/60';
      case 'shoot_scheduled':
        return 'bg-[#00CED1]/20 text-[#40E0D0] border-[#00CED1]/40';
      case 'delivered':
        return 'bg-[#585D27]/25 text-[#A2AC48] border-[#585D27]/50';
      case 'completed':
        return 'bg-[#40E0D0]/25 text-[#40E0D0] border-[#40E0D0]/60 font-semibold';

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
