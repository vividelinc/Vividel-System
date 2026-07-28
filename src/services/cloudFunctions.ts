import {
  getBookingById,
  updateBookingStatus,
  updateBookingFields,
  getSettings,
  updateLead
} from '../firebase/firestore';
import { Booking, BookingStatus } from '../types';

export const triggerOnNewBooking = async (booking: Booking, bookingId: string) => {
  console.log('⚡ Cloud Function triggered: onNewBooking', { bookingId, clientName: booking.clientName });
  
  try {
    const res = await fetch('/api/functions/onNewBooking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking, bookingId })
    });
    if (!res.ok) {
      console.warn('API route call failed, proceeding with client simulation fallback.');
    }
  } catch (err) {
    console.warn('Client execution fallback for onNewBooking:', err);
  }
};

export const triggerOnStatusChange = async (
  bookingId: string,
  oldStatus: BookingStatus,
  newStatus: BookingStatus
) => {
  console.log(`⚡ Cloud Function triggered: onStatusChange from ${oldStatus} to ${newStatus}`, { bookingId });

  try {
    await fetch('/api/functions/onStatusChange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, oldStatus, newStatus })
    });
  } catch (err) {
    console.warn('Client execution fallback for onStatusChange:', err);
  }
};

export const generateContract = async (bookingId: string) => {
  console.log(`⚡ Cloud Function triggered: generateContract for ${bookingId}`);

  // Fetch booking
  const booking = await getBookingById(bookingId);
  if (!booking) throw new Error('Booking not found');

  const settings = await getSettings();

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const defaultContractUrl = `${origin}/contract/${bookingId}`;

  let contractUrl = defaultContractUrl;

  try {
    const res = await fetch('/api/functions/generateContract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, booking, settings, defaultContractUrl })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.contractUrl) {
        contractUrl = data.contractUrl;
      }
    }
  } catch (err) {
    console.warn('API call failed, using in-app contract signature portal:', err);
  }

  if (!contractUrl || contractUrl.includes('docuseal.co/d/')) {
    contractUrl = defaultContractUrl;
  }

  // Compile contract email template
  const rawTemplate =
    settings.contractEmailTemplate ||
    'Hello {clientName},\n\nYour shoot contract for {service} on {shootDate} is ready for review and e-signature.\n\nPlease review and sign using the link below:\n{contractUrl}\n\nWarm regards,\nJames Akabo Jnr\nVividel Inc.';

  const emailSubject = `Contract Agreement for ${booking.service} — Vividel Inc.`;
  const emailBody = rawTemplate
    .replace(/{clientName}/g, booking.clientName)
    .replace(/{service}/g, booking.service)
    .replace(/{shootDate}/g, booking.shootDate)
    .replace(/{contractUrl}/g, contractUrl);

  // Update booking
  await updateBookingFields(bookingId, {
    contractUrl,
    status: 'contract_sent'
  });

  await updateBookingStatus(
    bookingId,
    'contract_sent',
    'DocuSeal Integration',
    `Generated Contract & Dispatched Link to ${booking.clientEmail}`
  );

  return {
    contractUrl,
    emailSubject,
    emailBody,
    clientEmail: booking.clientEmail,
    clientName: booking.clientName,
    clientPhone: booking.clientPhone
  };
};
