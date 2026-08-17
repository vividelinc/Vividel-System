import { db } from './_lib/firebaseAdmin.js';
import { requireAuth } from './_lib/auth.js';
import { sendEmail } from './_lib/notify.js';
import { getSettings } from './_lib/settings.js';
import { STATUS_LABELS, depositInstructionsHtml } from './_lib/constants.js';
import { FieldValue } from 'firebase-admin/firestore';

// Statuses that trigger a client email. contract_signed is deliberately excluded —
// that transition is owned exclusively by api/docusealWebhook.js.
const HANDLED_STATUSES = new Set(['contract_sent', 'deposit_pending', 'completed']);

// Dashboard-only. Owns the booking status write (activity log included) plus whichever
// transactional email that transition requires — replaces the old Firestore onUpdate
// trigger, since Vercel has no equivalent of Firestore triggers.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let decoded;
  try {
    decoded = await requireAuth(req);
  } catch (err) {
    res.status(err.statusCode || 401).json({ error: err.message });
    return;
  }

  try {
    const { bookingId, newStatus, author, customLogTitle } = req.body || {};
    if (!bookingId || !newStatus) {
      res.status(400).json({ error: 'bookingId and newStatus are required.' });
      return;
    }

    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }
    const booking = bookingSnap.data();
    const now = new Date().toISOString();

    await bookingRef.update({
      status: newStatus,
      activityLog: FieldValue.arrayUnion({
        id: Date.now().toString(),
        title: customLogTitle || STATUS_LABELS[newStatus] || `Status updated to ${newStatus}`,
        timestamp: now,
        author: author || decoded.email || 'James Akabo Jnr'
      })
    });

    if (!HANDLED_STATUSES.has(newStatus)) {
      res.status(200).json({ ok: true });
      return;
    }

    if (newStatus === 'contract_sent') {
      await sendEmail({
        to: booking.clientEmail,
        subject: 'Your Vividel Inc. contract is ready to sign',
        html:
          `<p>Hi ${booking.clientName}, your contract for ${booking.service} on ${booking.shootDate} is ready.</p>` +
          `<p>Please review and sign here: <a href="${booking.contractUrl}">${booking.contractUrl}</a></p>`
      });
    } else if (newStatus === 'deposit_pending') {
      const settings = await getSettings();
      await sendEmail({
        to: booking.clientEmail,
        subject: 'Deposit payment instructions — Vividel Inc.',
        html: depositInstructionsHtml({
          clientName: booking.clientName,
          service: booking.service,
          shootDate: booking.shootDate,
          depositAmount: booking.depositAmount,
          depositDeadline: booking.depositDeadline,
          settings
        })
      });
    } else if (newStatus === 'completed') {
      await sendEmail({
        to: booking.clientEmail,
        subject: 'Thank you from Vividel Inc.',
        html: '<p>Thank you for working with Vividel Inc. We hope to work with you again.</p>'
      });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('onStatusChange failed', err);
    res.status(500).json({ error: 'Failed to update status.' });
  }
}
