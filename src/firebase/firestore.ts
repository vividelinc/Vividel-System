import {
  collection,
  doc,
  getDocs,
  getDoc,
  getDocFromServer,
  addDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { db, auth } from './config';
import {
  Lead,
  Booking,
  ClientRecord,
  PhotographyService,
  Payment,
  SystemSettings
} from '../types';

// Collections References
const LEADS_COL = 'leads';
const BOOKINGS_COL = 'bookings';
const CLIENTS_COL = 'clients';
const SERVICES_COL = 'services';
const PAYMENTS_COL = 'payments';
const SETTINGS_COL = 'settings';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', errInfo);
  throw error;
}

// Validate Connection to Firestore on Boot
export async function testConnection() {
  if (!db) {
    return;
  }

  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore test connection: Client is offline or establishing connection.');
    }
  }
}

const DEFAULT_SERVICES: Omit<PhotographyService, 'id'>[] = [
  {
    name: 'Commercial & Advertising',
    description: 'High-impact commercial photography, campaign visuals, and brand storytelling.',
    startingPrice: 1500,
    isActive: true
  },
  {
    name: 'Event Coverage',
    description: 'Comprehensive photography for galas, summits, corporate events & private celebrations.',
    startingPrice: 1200,
    isActive: true
  },
  {
    name: 'Executive & Editorial Portraits',
    description: 'Premium headshots, executive profiles, and fashion editorial shoots.',
    startingPrice: 500,
    isActive: true
  },
  {
    name: 'Product & E-Commerce Photography',
    description: 'Studio lighting and multi-angle product photography for luxury e-commerce.',
    startingPrice: 800,
    isActive: true
  }
];

const DEFAULT_SETTINGS: SystemSettings = {
  displayName: 'James Akabo Jnr',
  email: 'vividelinc@gmail.com',
  ownerPhone: '',
  calComLink: 'https://cal.com/vividel-inc/30min?overlayCalendar=true',
  momoNumber: '',
  momoName: '',
  bankName: '',
  accountNumber: '',
  contractEmailTemplate:
    'Hello {clientName},\n\nYour shoot contract for {service} on {shootDate} is ready for review and e-signature.\n\nPlease review and sign using the link below:\n{contractUrl}\n\nWarm regards,\nJames Akabo Jnr\nVividel Inc.',
  paymentEmailTemplate:
    'Hello {clientName},\n\nYour deposit of ${depositAmount} for {service} on {shootDate} is pending.\n\nPayment Details:\n- Mobile Money: {momoNumber} ({momoName})\n- Bank Transfer: {bankName} - Acc #{accountNumber}\n\nDeadline: {depositDeadline}\n\nWarm regards,\nVividel Inc.'
};

// One-time seed: only writes default services/settings if the collections are
// genuinely empty. This is DB setup, not a runtime mock-data fallback — once
// seeded, everything reads from Firestore exclusively.
export const initializeDefaultDataIfNeeded = async () => {
  if (!db) {
    return;
  }

  try {
    const servicesSnap = await getDocs(collection(db, SERVICES_COL));
    if (servicesSnap.empty) {
      await Promise.all(DEFAULT_SERVICES.map((s) => addDoc(collection(db, SERVICES_COL), s)));
    }

    const settingsSnap = await getDoc(doc(db, SETTINGS_COL, 'general'));
    if (!settingsSnap.exists()) {
      await setDoc(doc(db, SETTINGS_COL, 'general'), DEFAULT_SETTINGS);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, SERVICES_COL);
  }
};

// --- SERVICES ---

export const subscribeToServices = (callback: (services: PhotographyService[]) => void): Unsubscribe => {
  return onSnapshot(
    collection(db, SERVICES_COL),
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as PhotographyService[]);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, SERVICES_COL)
  );
};

export const subscribeToActiveServices = (callback: (services: PhotographyService[]) => void): Unsubscribe => {
  const q = query(collection(db, SERVICES_COL), where('isActive', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as PhotographyService[]);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, SERVICES_COL)
  );
};

export const addService = async (service: Omit<PhotographyService, 'id'>) => {
  try {
    await addDoc(collection(db, SERVICES_COL), service);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, SERVICES_COL);
  }
};

export const updateService = async (id: string, data: Partial<PhotographyService>) => {
  try {
    await updateDoc(doc(db, SERVICES_COL, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${SERVICES_COL}/${id}`);
  }
};

// --- LEADS ---

export const subscribeToLeads = (callback: (leads: Lead[]) => void): Unsubscribe => {
  const q = query(collection(db, LEADS_COL), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Lead[]);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, LEADS_COL)
  );
};

export const addLead = async (lead: Omit<Lead, 'id'>) => {
  try {
    await addDoc(collection(db, LEADS_COL), lead);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, LEADS_COL);
  }
};

export const updateLead = async (id: string, data: Partial<Lead>) => {
  try {
    await updateDoc(doc(db, LEADS_COL, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${LEADS_COL}/${id}`);
  }
};

// --- CLIENTS ---
// Client records are created/updated exclusively by the onNewBooking Cloud
// Function (Admin SDK) so that only authenticated dashboard users ever read or
// write /clients directly — see firestore.rules.

export const subscribeToClients = (callback: (clients: ClientRecord[]) => void): Unsubscribe => {
  return onSnapshot(
    collection(db, CLIENTS_COL),
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ClientRecord[]);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, CLIENTS_COL)
  );
};

export const updateClientNotes = async (clientId: string, notes: string) => {
  try {
    await updateDoc(doc(db, CLIENTS_COL, clientId), { notes });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${CLIENTS_COL}/${clientId}`);
  }
};

// --- BOOKINGS ---

export const subscribeToBookings = (callback: (bookings: Booking[]) => void): Unsubscribe => {
  const q = query(collection(db, BOOKINGS_COL), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Booking[]);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, BOOKINGS_COL)
  );
};

export const getBookingById = async (id: string): Promise<Booking | null> => {
  try {
    const snap = await getDoc(doc(db, BOOKINGS_COL, id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Booking) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${BOOKINGS_COL}/${id}`);
  }
};

export const subscribeToBookingDetail = (id: string, callback: (booking: Booking | null) => void): Unsubscribe => {
  return onSnapshot(
    doc(db, BOOKINGS_COL, id),
    (snap) => {
      callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as Booking) : null);
    },
    (error) => handleFirestoreError(error, OperationType.GET, `${BOOKINGS_COL}/${id}`)
  );
};

// Booking creation and status transitions are owned by the Vercel API routes
// (api/onNewBooking.js, api/onStatusChange.js, api/generateContract.js) — they run
// server-side notification side effects that a plain client write can't, so the
// client never writes those fields directly. See src/services/cloudFunctions.ts.

export const updateBookingFields = async (bookingId: string, fields: Partial<Booking>) => {
  try {
    await updateDoc(doc(db, BOOKINGS_COL, bookingId), fields);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${BOOKINGS_COL}/${bookingId}`);
  }
};

// --- PAYMENTS ---

export const subscribeToPayments = (callback: (payments: Payment[]) => void): Unsubscribe => {
  const q = query(collection(db, PAYMENTS_COL), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Payment[]);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, PAYMENTS_COL)
  );
};

export const recordPayment = async (payment: Omit<Payment, 'id'>) => {
  try {
    await addDoc(collection(db, PAYMENTS_COL), payment);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PAYMENTS_COL);
  }
};

// --- SETTINGS ---

export const getSettings = async (): Promise<SystemSettings> => {
  try {
    const snap = await getDoc(doc(db, SETTINGS_COL, 'general'));
    return snap.exists() ? { ...DEFAULT_SETTINGS, ...(snap.data() as SystemSettings) } : DEFAULT_SETTINGS;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${SETTINGS_COL}/general`);
  }
};

export const updateSettings = async (settings: Partial<SystemSettings>) => {
  const cleanSettings: Record<string, any> = {};
  Object.entries(settings).forEach(([key, val]) => {
    if (val !== undefined) cleanSettings[key] = val;
  });

  try {
    await setDoc(doc(db, SETTINGS_COL, 'general'), cleanSettings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COL}/general`);
  }
};

export const subscribeToSettings = (callback: (settings: SystemSettings) => void): Unsubscribe => {
  return onSnapshot(
    doc(db, SETTINGS_COL, 'general'),
    (snap) => {
      callback(snap.exists() ? { ...DEFAULT_SETTINGS, ...(snap.data() as SystemSettings) } : DEFAULT_SETTINGS);
    },
    (error) => handleFirestoreError(error, OperationType.GET, `${SETTINGS_COL}/general`)
  );
};
