import React from 'react';
import { BookingStatus, LeadStatus } from '../../types';

interface BadgeProps {
  status: BookingStatus | LeadStatus | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeStyle = (st: string) => {
    switch (st) {
      case 'new':
        return 'bg-primary-soft text-primary border-primary/30';
      case 'called':
        return 'bg-slate-500/10 text-slate-700 border-slate-300';
      case 'converted':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-300';
      case 'lost':
        return 'bg-rose-500/10 text-rose-700 border-rose-300';

      case 'pending_contract':
        return 'bg-slate-500/10 text-slate-700 border-slate-300';
      case 'contract_sent':
        return 'bg-amber-500/10 text-amber-700 border-amber-300';
      case 'contract_signed':
        return 'bg-primary-soft text-primary border-primary/30';
      case 'deposit_pending':
        return 'bg-amber-500/10 text-amber-700 border-amber-300';
      case 'deposit_received':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-300';
      case 'shoot_scheduled':
        return 'bg-indigo-500/10 text-indigo-700 border-indigo-300';
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-300';
      case 'completed':
        return 'bg-primary-soft text-primary border-primary/30 font-semibold';

      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-300';
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
