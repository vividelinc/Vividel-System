export const OWNER_EMAIL = 'vividelinc@gmail.com';

export const STATUS_LABELS = {
  pending_contract: 'Moved to Pending Contract',
  contract_sent: 'Contract Generated & Sent to Client',
  contract_signed: 'Contract Signed by Client',
  deposit_pending: 'Deposit Payment Requested',
  deposit_received: 'Deposit Payment Confirmed Received',
  shoot_scheduled: 'Shoot Date Confirmed & Scheduled',
  delivered: 'Final Gallery Delivered',
  completed: 'Booking Fully Completed'
};

export function depositInstructionsHtml({ clientName, service, shootDate, depositAmount, depositDeadline, settings }) {
  return (
    `<p>Hi ${clientName}, your deposit of $${depositAmount} for ${service}` +
    `${depositDeadline ? ` is due by ${depositDeadline}` : ' is now due'}.</p>` +
    `<p>Mobile Money: ${settings.momoNumber || ''} (${settings.momoName || ''})<br/>` +
    `Bank Transfer: ${settings.bankName || ''} — Acc #${settings.accountNumber || ''}</p>`
  );
}
