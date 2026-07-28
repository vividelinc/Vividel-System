export type LeadStatus = 'new' | 'called' | 'converted' | 'lost';
export type LeadSource = 'instagram' | 'whatsapp' | 'referral' | 'other';

export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource | string;
  callDate?: string | null;
  callNotes?: string;
  status: LeadStatus;
  createdAt: string;
}

export type BookingStatus =
  | 'pending_contract'
  | 'contract_sent'
  | 'contract_signed'
  | 'deposit_pending'
  | 'deposit_received'
  | 'shoot_scheduled'
  | 'delivered'
  | 'completed';

export interface Booking {
  id?: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  service: string;
  shootDate: string;
  backupDate?: string;
  location: string;
  specialRequirements?: string;
  totalPrice: number;
  depositAmount: number;
  depositDeadline?: string;
  status: BookingStatus;
  contractUrl?: string;
  signedAt?: string;
  signedName?: string;
  notes?: string;
  createdAt: string;
  activityLog?: ActivityLogItem[];
}

export interface ActivityLogItem {
  id: string;
  title: string;
  timestamp: string;
  author: string;
}

export interface ClientRecord {
  id?: string;
  name: string;
  email: string;
  phone: string;
  source?: string;
  totalBookings: number;
  totalSpend?: number;
  isRepeatClient: boolean;
  notes?: string;
  createdAt: string;
}

export interface PhotographyService {
  id?: string;
  name: string;
  description: string;
  startingPrice: number;
  isActive: boolean;
}

export type PaymentType = 'deposit' | 'balance';
export type PaymentMethod = 'mobile_money' | 'bank_transfer' | 'card';
export type PaymentStatus = 'pending' | 'confirmed';

export interface Payment {
  id?: string;
  bookingId: string;
  clientId?: string;
  type: PaymentType;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  confirmedAt?: string;
  createdAt: string;
}

export interface SystemSettings {
  displayName: string;
  email: string;
  calComLink: string;
  momoNumber: string;
  momoName: string;
  bankName: string;
  accountNumber: string;
  contractEmailTemplate: string;
  paymentEmailTemplate: string;
}
