import { db } from './_lib/firebaseAdmin.js';
import { requireAuth } from './_lib/auth.js';
import { getSettings } from './_lib/settings.js';
import { FieldValue } from 'firebase-admin/firestore';

// Dashboard-only (requires a Firebase ID token). Fetches booking + settings, asks DocuSeal
// to generate a contract from the studio's template, moves the booking to contract_sent,
// and stores the signing URL. DocuSeal's own webhook (api/docusealWebhook.js) is what
// later confirms the client actually signed it.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await requireAuth(req);
  } catch (err) {
    res.status(err.statusCode || 401).json({ error: err.message });
    return;
  }

  try {
    const { bookingId } = req.body || {};
    if (!bookingId) {
      res.status(400).json({ error: 'bookingId is required.' });
      return;
    }

    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }
    const booking = bookingSnap.data();
    const settings = await getSettings();

    const apiKey = process.env.DOCUSEAL_API_KEY;
    const templateId = process.env.DOCUSEAL_TEMPLATE_ID;
    if (!apiKey || !templateId) {
      res.status(412).json({
        error: 'DOCUSEAL_API_KEY / DOCUSEAL_TEMPLATE_ID are not configured on this deployment.'
      });
      return;
    }

    let docusealRes;
    try {
      docusealRes = await fetch('https://api.docuseal.com/submissions', {
        method: 'POST',
        headers: { 'X-Auth-Token': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: templateId,
          // metadata must live on the submitter object, not top-level — DocuSeal
          // echoes it back as data.metadata in the form.completed webhook payload.
          submitters: [{ email: booking.clientEmail, name: booking.clientName, metadata: { bookingId } }],
          fields: [
            { name: 'clientName', default_value: booking.clientName },
            { name: 'service', default_value: booking.service },
            { name: 'shootDate', default_value: booking.shootDate },
            { name: 'location', default_value: booking.location },
            { name: 'totalPrice', default_value: String(booking.totalPrice) },
            { name: 'depositAmount', default_value: String(booking.depositAmount) },
            { name: 'depositDeadline', default_value: booking.depositDeadline || '' },
            {
              name: 'paymentDetails',
              default_value: `${settings.momoNumber || ''} (${settings.momoName || ''}) / ${settings.bankName || ''} — Acc #${settings.accountNumber || ''}`
            }
          ]
        })
      });
    } catch (err) {
      console.error('generateContract: DocuSeal request threw', err);
      res.status(502).json({ error: 'Failed to reach DocuSeal.' });
      return;
    }

    if (!docusealRes.ok) {
      console.error('generateContract: DocuSeal API error', await docusealRes.text());
      res.status(502).json({ error: 'DocuSeal API request failed.' });
      return;
    }

    const data = await docusealRes.json();
    const firstSubmitter = Array.isArray(data) ? data[0] : data?.submitters?.[0];
    const contractUrl = firstSubmitter?.embed_src;
    if (!contractUrl) {
      console.error('generateContract: no signing URL in DocuSeal response', data);
      res.status(502).json({ error: 'DocuSeal response did not include a signing URL.' });
      return;
    }
    // Fallback correlation key for docusealWebhook.js, in case metadata doesn't
    // round-trip on a given event type — submission_id is always present.
    const docusealSubmissionId = firstSubmitter?.submission_id ?? null;

    const now = new Date().toISOString();
    await bookingRef.update({
      status: 'contract_sent',
      contractUrl,
      docusealSubmissionId,
      activityLog: FieldValue.arrayUnion({
        id: Date.now().toString(),
        title: `Contract generated & dispatched to ${booking.clientEmail}`,
        timestamp: now,
        author: 'DocuSeal Integration'
      })
    });

    res.status(200).json({ contractUrl });
  } catch (err) {
    console.error('generateContract failed', err);
    res.status(500).json({ error: 'Failed to generate contract.' });
  }
}
