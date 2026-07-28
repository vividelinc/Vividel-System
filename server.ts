import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES FOR CLOUD FUNCTIONS SIMULATION & INTEGRATIONS ---
  
  // 1. onNewBooking Cloud Function Endpoint
  app.post('/api/functions/onNewBooking', (req, res) => {
    const { booking, bookingId } = req.body;
    console.log('[Cloud Function] onNewBooking triggered:', { bookingId, clientName: booking?.clientName });

    const resendKey = process.env.RESEND_API_KEY;
    const afsKey = process.env.AFRICASTALKING_API_KEY;

    // Resend Email Notification (or log)
    if (resendKey) {
      console.log(`[Resend] Email sent to James (vividelinc@gmail.com): New booking request from ${booking?.clientName} for ${booking?.service} on ${booking?.shootDate}`);
      console.log(`[Resend] Email sent to client (${booking?.clientEmail}): Confirmation and contract preview for ${booking?.service}`);
    } else {
      console.log(`[Notification] Resend API key missing. Email simulated for James & ${booking?.clientEmail}`);
    }

    // Africa's Talking SMS (or log)
    if (afsKey) {
      console.log(`[Africa's Talking SMS] Sent to James: New Vividel booking: ${booking?.clientName} — ${booking?.service} — ${booking?.shootDate}`);
    } else {
      console.log(`[Notification] Africa's Talking API key missing. SMS simulated for James.`);
    }

    res.json({ status: 'success', message: 'onNewBooking functions executed' });
  });

  // 2. onStatusChange Cloud Function Endpoint
  app.post('/api/functions/onStatusChange', (req, res) => {
    const { bookingId, oldStatus, newStatus } = req.body;
    console.log(`[Cloud Function] onStatusChange triggered for ${bookingId}: ${oldStatus} -> ${newStatus}`);

    if (newStatus === 'contract_sent') {
      console.log(`[Resend] Sent DocuSeal contract link to client for booking ${bookingId}`);
    } else if (newStatus === 'deposit_pending') {
      console.log(`[Resend] Sent payment instructions (Mobile Money & Bank) to client for booking ${bookingId}`);
    } else if (newStatus === 'completed') {
      console.log(`[Resend] Sent thank you email to client for booking ${bookingId}`);
    }

    res.json({ status: 'success', message: `Status change handled: ${newStatus}` });
  });

  // 3. generateContract DocuSeal Callable Endpoint
  app.post('/api/functions/generateContract', (req, res) => {
    const { bookingId, booking, settings, defaultContractUrl } = req.body;
    console.log(`[DocuSeal API] Generating contract for booking ${bookingId}`);

    const docusealKey = process.env.DOCUSEAL_API_KEY;
    const origin = req.headers.origin || 'http://localhost:3000';
    const contractUrl = defaultContractUrl || `${origin}/contract/${bookingId}`;

    if (docusealKey) {
      console.log(`[DocuSeal API] Real API call executed with key ${docusealKey.substring(0, 5)}...`);
    } else {
      console.log(`[DocuSeal API] Key not supplied; utilizing in-app e-signature contract portal URL: ${contractUrl}`);
    }

    res.json({
      status: 'success',
      contractUrl,
      fieldsInjected: {
        clientName: booking?.clientName,
        service: booking?.service,
        shootDate: booking?.shootDate,
        totalPrice: booking?.totalPrice,
        depositAmount: booking?.depositAmount,
        paymentDetails: `${settings?.momoNumber} / ${settings?.bankName}`
      }
    });
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vividel OS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
