import { db } from './firebaseAdmin.js';

export async function upsertClientForBooking({ clientName, clientEmail, clientPhone, source }) {
  const clientsRef = db.collection('clients');
  const existing = await clientsRef.where('email', '==', clientEmail).limit(1).get();

  if (!existing.empty) {
    const docSnap = existing.docs[0];
    const totalBookings = (docSnap.data().totalBookings || 0) + 1;
    await docSnap.ref.update({
      name: clientName,
      phone: clientPhone,
      totalBookings,
      isRepeatClient: totalBookings > 1
    });
    return docSnap.id;
  }

  const created = await clientsRef.add({
    name: clientName,
    email: clientEmail,
    phone: clientPhone,
    source: source || 'booking_form',
    totalBookings: 1,
    isRepeatClient: false,
    createdAt: new Date().toISOString()
  });
  return created.id;
}
