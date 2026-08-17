const FROM_EMAIL = 'Vividel Inc. <bookings@vividel.studio>';

export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`RESEND_API_KEY not configured — skipping email to ${to}: "${subject}"`);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html })
    });
    if (!res.ok) {
      console.error(`Resend email to ${to} failed: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error(`Resend email to ${to} threw`, err);
  }
}

export async function sendSms({ to, message }) {
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  const username = process.env.AFRICASTALKING_USERNAME;
  if (!apiKey || !username || !to) {
    console.warn("Africa's Talking not configured (missing key/username/owner phone) — skipping SMS", message);
    return;
  }
  try {
    const res = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      },
      body: new URLSearchParams({ username, to, message }).toString()
    });
    if (!res.ok) {
      console.error(`Africa's Talking SMS failed: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error("Africa's Talking SMS threw", err);
  }
}
