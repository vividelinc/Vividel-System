import { db } from './_lib/firebaseAdmin.js';
import { sendEmail } from './_lib/notify.js';
import { getSettings } from './_lib/settings.js';
import { depositInstructionsHtml } from './_lib/constants.js';
import { FieldValue } from 'firebase-admin/firestore';

// Public endpoint — called by DocuSeal's servers, not the browser. Configure this URL
// (https://<your-domain>/api/docusealWebhook) in DocuSeal's webhook settings, and set
// DOCUSEAL_WEBHOOK_SECRET here + as a custom header DocuSeal sends on every call, so this
// route can reject requests that aren't actually from DocuSeal.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const expectedSecret = process.env.DOCUSEAL_WEBHOOK_SECRET;
  if (expectedSecret) {
    const providedSecret = req.headers['x-docuseal-secret'];
    if (providedSecret !== expectedSecret) {
      res.status(401).json({ error: 'Invalid webhook secret.' });
      return;
    }
  } else {
    console.warn('DOCUSEAL_WEBHOOK_SECRET not set — accepting webhook without verification.');
  }

  try {
    const payload = req.body || {};

    // Only the signing-completion events should flip the booking to contract_signed.
    // form.viewed / form.started / form.declined are also subscribed in DocuSeal
    // (for visibility/future use) but must be no-ops here.
    const eventType = payload?.event_type || payload?.type;
    const COMPLETION_EVENTS = new Set(['form.completed', 'submission.completed']);
    if (!COMPLETION_EVENTS.has(eventType)) {
      res.status(200).json({ ok: true, ignored: eventType });
      return;
    }

    // Confirmed from live payloads: form.completed nests metadata on data.metadata
    // (the submitter object); submission.completed nests it one level deeper, on
    // data.submitters[0].metadata (the submission object's submitters array).
    const bookingId =
      payload?.data?.metadata?.bookingId ||
      payload?.data?.submitters?.[0]?.metadata?.bookingId ||
      req.query?.bookingId;

    let bookingRef = bookingId ? db.collection('bookings').doc(bookingId) : null;
    let bookingSnap = bookingRef ? await bookingRef.get() : null;

    if (!bookingSnap?.exists) {
      // Fallback: match on the submission_id we stored at generateContract time.
      // form.completed carries it as data.submission_id; submission.completed's
      // own id *is* the submission id (data.id).
      const submissionId = payload?.data?.submission_id ?? payload?.data?.id;
      if (submissionId) {
        const matches = await db
          .collection('bookings')
          .where('docusealSubmissionId', '==', submissionId)
          .limit(1)
          .get();
        if (!matches.empty) {
          bookingRef = matches.docs[0].ref;
          bookingSnap = matches.docs[0];
        }
      }
    }

    if (!bookingSnap?.exists) {
      console.error('docusealWebhook: could not resolve booking from payload', payload);
      res.status(400).json({ error: 'Could not resolve booking from webhook payload.' });
      return;
    }
    const booking = bookingSnap.data();

    // form.completed and submission.completed both fire for a single-signer contract —
    // without this guard we'd double-log and double-send the deposit email.
    if (booking.status === 'contract_signed' || booking.signedAt) {
      res.status(200).json({ ok: true, alreadyProcessed: true });
      return;
    }

    const now = new Date().toISOString();

    await bookingRef.update({
      status: 'contract_signed',
      signedAt: now,
      activityLog: FieldValue.arrayUnion({
        id: Date.now().toString(),
        title: 'Contract signed by client (DocuSeal)',
        timestamp: now,
        author: 'DocuSeal Webhook'
      })
    });

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

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('docusealWebhook failed', err);
    res.status(500).json({ error: 'Failed to process webhook.' });
  }
}
