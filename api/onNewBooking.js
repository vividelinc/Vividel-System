import { db } from './_lib/firebaseAdmin.js';
import { sendEmail, sendSms } from './_lib/notify.js';
import { getSettings } from './_lib/settings.js';
import { upsertClientForBooking } from './_lib/clients.js';
import { OWNER_EMAIL } from './_lib/constants.js';

// Public endpoint — called by the client-facing /book form on submission, and by the
// dashboard's "Create Booking" / "Convert Lead" flows. Owns every write that used to
// happen client-side plus the notification side effects (Firestore triggers don't exist
// on Vercel, so this explicit call is what "onNewBooking" fires from now).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const {
      fullName,
      email,
      phone,
      service,
      shootDate,
      backupDate,
      location,
      specialRequirements,
      totalPrice,
      depositAmount,
      depositDeadline,
      leadId,
      createLead = true
    } = req.body || {};

    if (!fullName || !email || !phone || !service || !shootDate) {
      res.status(400).json({ error: 'Missing required booking fields.' });
      return;
    }

    const now = new Date().toISOString();

    let resolvedLeadId = leadId || null;
    if (leadId) {
      await db.collection('leads').doc(leadId).update({ status: 'converted' });
    } else if (createLead) {
      const leadRef = await db.collection('leads').add({
        name: fullName,
        email,
        phone,
        source: 'referral',
        status: 'new',
        callNotes: specialRequirements ? `Online Booking Form Submission: ${specialRequirements}` : '',
        createdAt: now
      });
      resolvedLeadId = leadRef.id;
    }

    const clientId = await upsertClientForBooking({
      clientName: fullName,
      clientEmail: email,
      clientPhone: phone,
      source: 'booking_form'
    });

    const bookingRef = await db.collection('bookings').add({
      clientId,
      clientName: fullName,
      clientEmail: email,
      clientPhone: phone,
      service,
      shootDate,
      backupDate: backupDate || '',
      location: location || '',
      specialRequirements: specialRequirements || '',
      totalPrice: Number(totalPrice) || 0,
      depositAmount: Number(depositAmount) || 0,
      depositDeadline: depositDeadline || '',
      status: 'pending_contract',
      notes: '',
      createdAt: now,
      activityLog: [{ id: '1', title: 'Booking Request Received', timestamp: now, author: 'System' }]
    });

    const settings = await getSettings();

    await sendEmail({
      to: OWNER_EMAIL,
      subject: `New booking request from ${fullName}`,
      html: `<p>New booking request from <strong>${fullName}</strong> for <strong>${service}</strong> on <strong>${shootDate}</strong>.</p>`
    });

    await sendEmail({
      to: email,
      subject: 'Your Vividel Inc. booking request has been received',
      html: `<p>Thank you ${fullName}, your booking request has been received. A contract will be sent to you shortly.</p>`
    });

    await sendSms({
      to: settings.ownerPhone,
      message: `New Vividel booking: ${fullName} — ${service} — ${shootDate}`
    });

    res.status(200).json({ bookingId: bookingRef.id, leadId: resolvedLeadId, clientId });
  } catch (err) {
    console.error('onNewBooking failed', err);
    res.status(500).json({ error: 'Failed to create booking.' });
  }
}
