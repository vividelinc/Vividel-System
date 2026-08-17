import { auth } from '../firebase/config';
import { BookingStatus } from '../types';

// These call the Vercel serverless functions in /api. onNewBooking and onStatusChange
// replace what used to be Firestore-triggered Cloud Functions — since Vercel has no
// trigger equivalent, every write that needs a notification side effect goes through
// one of these endpoints instead of a direct Firestore write from the client.

async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in to do this.');
  return user.getIdToken();
}

async function postJson<T>(url: string, body: unknown, authenticated: boolean): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authenticated) {
    headers.Authorization = `Bearer ${await getIdToken()}`;
  }

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request to ${url} failed (${res.status}).`);
  }
  return data as T;
}

export interface NewBookingPayload {
  fullName: string;
  email: string;
  phone: string;
  service: string;
  shootDate: string;
  backupDate?: string;
  location?: string;
  specialRequirements?: string;
  totalPrice: number;
  depositAmount: number;
  depositDeadline?: string;
  // Pass an existing lead's id to mark it converted instead of creating a new lead.
  leadId?: string;
  // Set false for a manual dashboard booking with no associated lead.
  createLead?: boolean;
}

interface NewBookingResult {
  bookingId: string;
  leadId: string | null;
  clientId: string;
}

export const triggerOnNewBooking = (payload: NewBookingPayload) =>
  postJson<NewBookingResult>('/api/onNewBooking', payload, false);

interface StatusChangeResult {
  ok: true;
}

export const triggerOnStatusChange = (
  bookingId: string,
  newStatus: BookingStatus,
  author?: string,
  customLogTitle?: string
) => postJson<StatusChangeResult>('/api/onStatusChange', { bookingId, newStatus, author, customLogTitle }, true);

interface GenerateContractResult {
  contractUrl: string;
}

export const generateContract = (bookingId: string) =>
  postJson<GenerateContractResult>('/api/generateContract', { bookingId }, true);
