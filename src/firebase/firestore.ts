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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from './config';
import {
  Lead,
  Booking,
  ClientRecord,
  PhotographyService,
  Payment,
  SystemSettings,
  BookingStatus,
  ActivityLogItem
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
  console.warn('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Validate Connection to Firestore on Boot
export async function testConnection() {
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

// Initial Seed Data Initialization
export const initializeDefaultDataIfNeeded = async () => {
  try {
    // Check Services with timeout
    const fetchPromise = getDocs(collection(db, SERVICES_COL));
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
    const servicesSnap = await Promise.race([fetchPromise, timeoutPromise]);

    if (servicesSnap && servicesSnap.empty) {
      for (const s of DEFAULT_SERVICES) {
        await addDoc(collection(db, SERVICES_COL), s);
      }
    }

    // Check Settings with timeout
    const settingsDocPromise = getDoc(doc(db, SETTINGS_COL, 'general'));
    const settingsSnap = await Promise.race([settingsDocPromise, timeoutPromise]);
    if (settingsSnap && !settingsSnap.exists()) {
      const defaultSettings: SystemSettings = {
        displayName: 'James Akabo Jnr',
        email: 'vividelinc@gmail.com',
        calComLink: 'https://cal.com/vividel',
        momoNumber: '+233 24 123 4567',
        momoName: 'Vividel Inc (James Akabo)',
        bankName: 'Ecobank Ghana',
        accountNumber: '1441000123456',
        contractEmailTemplate: 'Hello {clientName},\n\nYour shoot contract for {service} on {shootDate} is ready for review and e-signature.\n\nPlease review and sign using the link below:\n{contractUrl}\n\nWarm regards,\nJames Akabo Jnr\nVividel Inc.',
        paymentEmailTemplate: 'Hello {clientName},\n\nYour deposit of ${depositAmount} for {service} on {shootDate} is pending.\n\nPayment Details:\n- Mobile Money: {momoNumber} ({momoName})\n- Bank Transfer: {bankName} - Acc #{accountNumber}\n\nDeadline: {depositDeadline}\n\nWarm regards,\nVividel Inc.'
      };
      await setDoc(doc(db, SETTINGS_COL, 'general'), defaultSettings);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, SERVICES_COL);
  }
};

// --- SERVICES ---
const SERVICES_LOCAL_KEY = 'vividel_studio_services';

const getLocalServices = (): PhotographyService[] => {
  try {
    const raw = localStorage.getItem(SERVICES_LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore error
  }
  const defaults = DEFAULT_SERVICES.map((s, idx) => ({ id: `default-${idx}`, ...s }));
  try {
    localStorage.setItem(SERVICES_LOCAL_KEY, JSON.stringify(defaults));
  } catch (e) {
    // ignore error
  }
  return defaults;
};

const saveLocalServices = (services: PhotographyService[]) => {
  try {
    localStorage.setItem(SERVICES_LOCAL_KEY, JSON.stringify(services));
  } catch (e) {
    console.warn('Could not save services to localStorage:', e);
  }
};

const mergeServices = (local: PhotographyService[], remote: PhotographyService[]): PhotographyService[] => {
  const map = new Map<string, PhotographyService>();
  local.forEach((s) => {
    if (s.id) map.set(s.id, s);
  });
  remote.forEach((s) => {
    if (s.id) {
      map.set(s.id, s);
    } else if (s.name) {
      const match = Array.from(map.values()).find((l) => l.name === s.name);
      if (match && match.id) {
        map.set(match.id, { ...s, id: match.id });
      }
    }
  });
  return Array.from(map.values());
};

export const subscribeToServices = (callback: (services: PhotographyService[]) => void) => {
  callback(getLocalServices());

  const handleUpdate = () => {
    callback(getLocalServices());
  };
  window.addEventListener('services-updated', handleUpdate);

  const unsub = onSnapshot(
    collection(db, SERVICES_COL),
    (snapshot) => {
      const remoteServices = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as PhotographyService[];
      const merged = mergeServices(getLocalServices(), remoteServices);
      saveLocalServices(merged);
      callback(merged);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, SERVICES_COL);
      callback(getLocalServices());
    }
  );

  return () => {
    window.removeEventListener('services-updated', handleUpdate);
    unsub();
  };
};

export const subscribeToActiveServices = (callback: (services: PhotographyService[]) => void) => {
  const getActive = () => getLocalServices().filter((s) => s.isActive !== false);

  callback(getActive());

  const handleUpdate = () => {
    callback(getActive());
  };
  window.addEventListener('services-updated', handleUpdate);

  const q = query(collection(db, SERVICES_COL), where('isActive', '==', true));
  const unsub = onSnapshot(
    q,
    (snapshot) => {
      const remoteServices = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as PhotographyService[];
      const merged = mergeServices(getLocalServices(), remoteServices);
      saveLocalServices(merged);
      callback(merged.filter((s) => s.isActive !== false));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, SERVICES_COL);
      callback(getActive());
    }
  );

  return () => {
    window.removeEventListener('services-updated', handleUpdate);
    unsub();
  };
};

export const addService = async (service: Omit<PhotographyService, 'id'>) => {
  const tempId = 'srv-' + Date.now();
  const newService: PhotographyService = {
    id: tempId,
    ...service
  };

  // 1. Instantly update local storage and notify UI
  const current = getLocalServices();
  const updated = [...current, newService];
  saveLocalServices(updated);
  window.dispatchEvent(new Event('services-updated'));

  // 2. Attempt Firestore creation with 2.5s timeout race
  try {
    const addPromise = addDoc(collection(db, SERVICES_COL), service);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 2500));
    const res = await Promise.race([addPromise, timeoutPromise]);
    if (res !== 'timeout' && (res as any)?.id) {
      const realId = (res as any).id;
      const latest = getLocalServices().map((s) => (s.id === tempId ? { ...s, id: realId } : s));
      saveLocalServices(latest);
      window.dispatchEvent(new Event('services-updated'));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, SERVICES_COL);
  }
};

export const updateService = async (id: string, data: Partial<PhotographyService>) => {
  // 1. Instantly update local storage and notify UI
  const current = getLocalServices();
  const updated = current.map((s) => (s.id === id ? { ...s, ...data } : s));
  saveLocalServices(updated);
  window.dispatchEvent(new Event('services-updated'));

  // 2. Attempt Firestore update with 2.5s timeout race
  try {
    if (!id.startsWith('srv-') && !id.startsWith('default-')) {
      const updatePromise = updateDoc(doc(db, SERVICES_COL, id), data);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 2500));
      await Promise.race([updatePromise, timeoutPromise]);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${SERVICES_COL}/${id}`);
  }
};

// --- LEADS ---
const LEADS_LOCAL_KEY = 'vividel_studio_leads';

const getLocalLeads = (): Lead[] => {
  try {
    const raw = localStorage.getItem(LEADS_LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalLeads = (leads: Lead[]) => {
  try {
    localStorage.setItem(LEADS_LOCAL_KEY, JSON.stringify(leads));
    window.dispatchEvent(new Event('leads-updated'));
  } catch (e) {}
};

export const subscribeToLeads = (callback: (leads: Lead[]) => void) => {
  callback(getLocalLeads());

  const handleUpdate = () => callback(getLocalLeads());
  window.addEventListener('leads-updated', handleUpdate);

  const unsub = onSnapshot(
    collection(db, LEADS_COL),
    (snapshot) => {
      const remote = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as Lead[];
      const local = getLocalLeads();
      const map = new Map<string, Lead>();
      local.forEach((l) => { if (l.id) map.set(l.id, l); });
      remote.forEach((r) => { if (r.id) map.set(r.id, r); });
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      saveLocalLeads(merged);
      callback(merged);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, LEADS_COL);
      callback(getLocalLeads());
    }
  );

  return () => {
    window.removeEventListener('leads-updated', handleUpdate);
    unsub();
  };
};

export const addLead = async (lead: Omit<Lead, 'id'>) => {
  const tempId = 'lead-' + Date.now();
  const newLead: Lead = { id: tempId, ...lead };
  const current = getLocalLeads();
  saveLocalLeads([newLead, ...current]);

  try {
    const addPromise = addDoc(collection(db, LEADS_COL), lead);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 2500));
    const res = await Promise.race([addPromise, timeoutPromise]);
    if (res !== 'timeout' && (res as any)?.id) {
      const realId = (res as any).id;
      const latest = getLocalLeads().map((l) => (l.id === tempId ? { ...l, id: realId } : l));
      saveLocalLeads(latest);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, LEADS_COL);
  }
};

export const updateLead = async (id: string, data: Partial<Lead>) => {
  const current = getLocalLeads();
  const updated = current.map((l) => (l.id === id ? { ...l, ...data } : l));
  saveLocalLeads(updated);

  try {
    if (!id.startsWith('lead-')) {
      const updatePromise = updateDoc(doc(db, LEADS_COL, id), data);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 2500));
      await Promise.race([updatePromise, timeoutPromise]);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${LEADS_COL}/${id}`);
  }
};

// --- CLIENTS ---
const CLIENTS_LOCAL_KEY = 'vividel_studio_clients';

const getLocalClients = (): ClientRecord[] => {
  try {
    const raw = localStorage.getItem(CLIENTS_LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalClients = (clients: ClientRecord[]) => {
  try {
    localStorage.setItem(CLIENTS_LOCAL_KEY, JSON.stringify(clients));
    window.dispatchEvent(new Event('clients-updated'));
  } catch (e) {}
};

export const subscribeToClients = (callback: (clients: ClientRecord[]) => void) => {
  callback(getLocalClients());

  const handleUpdate = () => callback(getLocalClients());
  window.addEventListener('clients-updated', handleUpdate);

  const unsub = onSnapshot(
    collection(db, CLIENTS_COL),
    (snapshot) => {
      const remote = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as ClientRecord[];
      const local = getLocalClients();
      const map = new Map<string, ClientRecord>();
      local.forEach((c) => { if (c.id) map.set(c.id, c); });
      remote.forEach((r) => { if (r.id) map.set(r.id, r); });
      const merged = Array.from(map.values());
      saveLocalClients(merged);
      callback(merged);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, CLIENTS_COL);
      callback(getLocalClients());
    }
  );

  return () => {
    window.removeEventListener('clients-updated', handleUpdate);
    unsub();
  };
};

export const addOrUpdateClientOnBooking = async (
  name: string,
  email: string,
  phone: string,
  source: string = 'booking'
): Promise<string> => {
  const local = getLocalClients();
  const existing = local.find((c) => c.email === email);
  let clientId = existing?.id || 'client-' + Date.now();

  if (existing) {
    const totalBookings = (existing.totalBookings || 0) + 1;
    const updatedClients = local.map((c) =>
      c.email === email ? { ...c, name, phone, totalBookings, isRepeatClient: totalBookings > 1 } : c
    );
    saveLocalClients(updatedClients);
  } else {
    const newClient: ClientRecord = {
      id: clientId,
      name,
      email,
      phone,
      source,
      totalBookings: 1,
      totalSpend: 0,
      isRepeatClient: false,
      createdAt: new Date().toISOString()
    };
    saveLocalClients([newClient, ...local]);
  }

  try {
    const q = query(collection(db, CLIENTS_COL), where('email', '==', email));
    const queryPromise = getDocs(q);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
    const snap = await Promise.race([queryPromise, timeoutPromise]);

    if (snap && !snap.empty) {
      const existingDoc = snap.docs[0];
      const data = existingDoc.data() as ClientRecord;
      const totalBookings = (data.totalBookings || 0) + 1;
      await updateDoc(doc(db, CLIENTS_COL, existingDoc.id), {
        name,
        phone,
        totalBookings,
        isRepeatClient: totalBookings > 1
      });
      return existingDoc.id;
    } else if (snap) {
      const newDocPromise = addDoc(collection(db, CLIENTS_COL), {
        name,
        email,
        phone,
        source,
        totalBookings: 1,
        totalSpend: 0,
        isRepeatClient: false,
        createdAt: new Date().toISOString()
      });
      const res = await Promise.race([newDocPromise, timeoutPromise]);
      if (res && (res as any)?.id) {
        return (res as any).id;
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CLIENTS_COL);
  }

  return clientId;
};

export const updateClientNotes = async (clientId: string, notes: string) => {
  const current = getLocalClients();
  const updated = current.map((c) => (c.id === clientId ? { ...c, notes } : c));
  saveLocalClients(updated);

  try {
    if (!clientId.startsWith('client-')) {
      const updatePromise = updateDoc(doc(db, CLIENTS_COL, clientId), { notes });
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 2500));
      await Promise.race([updatePromise, timeoutPromise]);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${CLIENTS_COL}/${clientId}`);
  }
};

// --- BOOKINGS ---
const BOOKINGS_LOCAL_KEY = 'vividel_studio_bookings';

const getLocalBookings = (): Booking[] => {
  try {
    const raw = localStorage.getItem(BOOKINGS_LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalBookings = (bookings: Booking[]) => {
  try {
    localStorage.setItem(BOOKINGS_LOCAL_KEY, JSON.stringify(bookings));
    window.dispatchEvent(new Event('bookings-updated'));
  } catch (e) {}
};

export const subscribeToBookings = (callback: (bookings: Booking[]) => void) => {
  callback(getLocalBookings());

  const handleUpdate = () => callback(getLocalBookings());
  window.addEventListener('bookings-updated', handleUpdate);

  const unsub = onSnapshot(
    collection(db, BOOKINGS_COL),
    (snapshot) => {
      const remote = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as Booking[];
      const local = getLocalBookings();
      const map = new Map<string, Booking>();
      local.forEach((b) => { if (b.id) map.set(b.id, b); });
      remote.forEach((r) => { if (r.id) map.set(r.id, r); });
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      saveLocalBookings(merged);
      callback(merged);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, BOOKINGS_COL);
      callback(getLocalBookings());
    }
  );

  return () => {
    window.removeEventListener('bookings-updated', handleUpdate);
    unsub();
  };
};

export const getBookingById = async (id: string): Promise<Booking | null> => {
  const local = getLocalBookings();
  let localMatch = local.find((b) => b.id === id);
  if (!localMatch && id) {
    localMatch = local.find((b) => b.id && (b.id.includes(id) || id.includes(b.id)));
  }
  if (localMatch) return localMatch;

  try {
    if (!id.startsWith('bk-')) {
      const getPromise = getDoc(doc(db, BOOKINGS_COL, id));
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
      const d = await Promise.race([getPromise, timeoutPromise]);
      if (d && d.exists()) {
        const remoteBooking = { id: d.id, ...d.data() } as Booking;
        const updatedLocal = local.some((b) => b.id === d.id)
          ? local.map((b) => (b.id === d.id ? remoteBooking : b))
          : [remoteBooking, ...local];
        saveLocalBookings(updatedLocal);
        return remoteBooking;
      }
    }

    // Fallback: Query all bookings from Firestore to sync
    const snapPromise = getDocs(collection(db, BOOKINGS_COL));
    const timeoutPromise2 = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
    const snap = await Promise.race([snapPromise, timeoutPromise2]);
    if (snap && !snap.empty) {
      const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Booking[];
      const map = new Map<string, Booking>();
      getLocalBookings().forEach((b) => { if (b.id) map.set(b.id, b); });
      remote.forEach((r) => { if (r.id) map.set(r.id, r); });
      const merged = Array.from(map.values());
      saveLocalBookings(merged);
      const match = merged.find((b) => b.id === id || (b.id && (b.id.includes(id) || id.includes(b.id))));
      if (match) return match;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${BOOKINGS_COL}/${id}`);
  }

  return localMatch || null;
};

export const subscribeToBookingDetail = (id: string, callback: (booking: Booking | null) => void) => {
  const local = getLocalBookings();
  let localMatch = local.find((b) => b.id === id) || local.find((b) => b.id && (b.id.includes(id) || id.includes(b.id))) || null;
  if (localMatch) callback(localMatch);

  const handleUpdate = () => {
    const current = getLocalBookings();
    const m = current.find((b) => b.id === id) || current.find((b) => b.id && (b.id.includes(id) || id.includes(b.id))) || null;
    if (m) callback(m);
  };
  window.addEventListener('bookings-updated', handleUpdate);

  let unsub = () => {};

  if (!id.startsWith('bk-')) {
    unsub = onSnapshot(
      doc(db, BOOKINGS_COL, id),
      (d) => {
        if (d.exists()) {
          const remote = { id: d.id, ...d.data() } as Booking;
          const current = getLocalBookings();
          const updated = current.some((b) => b.id === id)
            ? current.map((b) => (b.id === id ? remote : b))
            : [remote, ...current];
          saveLocalBookings(updated);
          callback(remote);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `${BOOKINGS_COL}/${id}`);
      }
    );
  }

  return () => {
    window.removeEventListener('bookings-updated', handleUpdate);
    unsub();
  };
};

export const createBookingRequest = async (bookingData: Omit<Booking, 'id'>) => {
  const clientId = await addOrUpdateClientOnBooking(
    bookingData.clientName,
    bookingData.clientEmail,
    bookingData.clientPhone
  );

  const tempBookingId = 'bk-' + Date.now();
  const newBooking: Booking = {
    ...bookingData,
    id: tempBookingId,
    clientId,
    createdAt: new Date().toISOString(),
    activityLog: [
      {
        id: '1',
        title: 'Booking Request Received from Client',
        timestamp: new Date().toISOString(),
        author: 'System'
      }
    ]
  };

  // 1. Instantly store locally & notify UI
  const current = getLocalBookings();
  saveLocalBookings([newBooking, ...current]);

  // 2. Race Firestore write
  try {
    const addPromise = addDoc(collection(db, BOOKINGS_COL), {
      ...bookingData,
      clientId,
      createdAt: newBooking.createdAt,
      activityLog: newBooking.activityLog
    });
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 2500));
    const res = await Promise.race([addPromise, timeoutPromise]);
    if (res !== 'timeout' && (res as any)?.id) {
      const realId = (res as any).id;
      const latest = getLocalBookings().map((b) => (b.id === tempBookingId ? { ...b, id: realId } : b));
      saveLocalBookings(latest);
      return { id: realId, clientId };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, BOOKINGS_COL);
  }

  return { id: tempBookingId, clientId };
};

export const updateBookingStatus = async (
  bookingId: string,
  newStatus: BookingStatus,
  author = 'James Akabo Jnr',
  customLogTitle?: string
) => {
  const statusLabels: Record<BookingStatus, string> = {
    pending_contract: 'Moved to Pending Contract',
    contract_sent: 'Contract Generated & Sent to Client',
    contract_signed: 'Contract Signed by Client',
    deposit_pending: 'Deposit Payment Requested',
    deposit_received: 'Deposit Payment Confirmed Received',
    shoot_scheduled: 'Shoot Date Confirmed & Scheduled',
    delivered: 'Final Gallery Delivered',
    completed: 'Booking Fully Completed'
  };

  const currentLocal = getLocalBookings();
  const booking = currentLocal.find((b) => b.id === bookingId);
  if (!booking) return;

  const currentLog = booking.activityLog || [];
  const logItem: ActivityLogItem = {
    id: Date.now().toString(),
    title: customLogTitle || statusLabels[newStatus] || `Status updated to ${newStatus}`,
    timestamp: new Date().toISOString(),
    author
  };

  const updatedBooking: Booking = {
    ...booking,
    status: newStatus,
    activityLog: [logItem, ...currentLog]
  };

  saveLocalBookings(currentLocal.map((b) => (b.id === bookingId ? updatedBooking : b)));

  try {
    if (!bookingId.startsWith('bk-')) {
      const bookingRef = doc(db, BOOKINGS_COL, bookingId);
      const updatePromise = updateDoc(bookingRef, {
        status: newStatus,
        activityLog: [logItem, ...currentLog]
      });
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 2500));
      await Promise.race([updatePromise, timeoutPromise]);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${BOOKINGS_COL}/${bookingId}`);
  }
};

export const updateBookingFields = async (bookingId: string, fields: Partial<Booking>) => {
  const current = getLocalBookings();
  const updated = current.map((b) => (b.id === bookingId ? { ...b, ...fields } : b));
  saveLocalBookings(updated);

  try {
    if (!bookingId.startsWith('bk-')) {
      const updatePromise = updateDoc(doc(db, BOOKINGS_COL, bookingId), fields);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 2500));
      await Promise.race([updatePromise, timeoutPromise]);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${BOOKINGS_COL}/${bookingId}`);
  }
};

// --- PAYMENTS ---
const PAYMENTS_LOCAL_KEY = 'vividel_studio_payments';

const getLocalPayments = (): Payment[] => {
  try {
    const raw = localStorage.getItem(PAYMENTS_LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalPayments = (payments: Payment[]) => {
  try {
    localStorage.setItem(PAYMENTS_LOCAL_KEY, JSON.stringify(payments));
    window.dispatchEvent(new Event('payments-updated'));
  } catch (e) {}
};

export const subscribeToPayments = (callback: (payments: Payment[]) => void) => {
  callback(getLocalPayments());

  const handleUpdate = () => callback(getLocalPayments());
  window.addEventListener('payments-updated', handleUpdate);

  const unsub = onSnapshot(
    collection(db, PAYMENTS_COL),
    (snapshot) => {
      const remote = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as Payment[];
      const local = getLocalPayments();
      const map = new Map<string, Payment>();
      local.forEach((p) => { if (p.id) map.set(p.id, p); });
      remote.forEach((r) => { if (r.id) map.set(r.id, r); });
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      saveLocalPayments(merged);
      callback(merged);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, PAYMENTS_COL);
      callback(getLocalPayments());
    }
  );

  return () => {
    window.removeEventListener('payments-updated', handleUpdate);
    unsub();
  };
};

export const recordPayment = async (payment: Omit<Payment, 'id'>) => {
  const tempId = 'pay-' + Date.now();
  const newPayment: Payment = { id: tempId, ...payment };
  const current = getLocalPayments();
  saveLocalPayments([newPayment, ...current]);

  try {
    const addPromise = addDoc(collection(db, PAYMENTS_COL), payment);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 2500));
    const res = await Promise.race([addPromise, timeoutPromise]);
    if (res !== 'timeout' && (res as any)?.id) {
      const realId = (res as any).id;
      const latest = getLocalPayments().map((p) => (p.id === tempId ? { ...p, id: realId } : p));
      saveLocalPayments(latest);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PAYMENTS_COL);
  }
};

// --- SETTINGS ---
const SETTINGS_LOCAL_KEY = 'vividel_studio_settings';

export const getSettings = async (): Promise<SystemSettings> => {
  const defaultSettings: SystemSettings = {
    displayName: 'James Akabo Jnr',
    email: 'vividelinc@gmail.com',
    calComLink: 'https://cal.com/vividel',
    momoNumber: '+233 24 123 4567',
    momoName: 'Vividel Inc (James Akabo)',
    bankName: 'Ecobank Ghana',
    accountNumber: '1441000123456',
    contractEmailTemplate: 'Hello {clientName},\n\nYour shoot contract for {service} on {shootDate} is ready for review and e-signature.\n\nPlease review and sign using the link below:\n{contractUrl}\n\nWarm regards,\nJames Akabo Jnr\nVividel Inc.',
    paymentEmailTemplate: 'Hello {clientName},\n\nYour deposit of ${depositAmount} for {service} on {shootDate} is pending.\n\nPayment Details:\n- Mobile Money: {momoNumber} ({momoName})\n- Bank Transfer: {bankName} - Acc #{accountNumber}\n\nDeadline: {depositDeadline}\n\nWarm regards,\nVividel Inc.'
  };

  try {
    const cached = localStorage.getItem(SETTINGS_LOCAL_KEY);
    const localData = cached ? JSON.parse(cached) : null;

    const fetchPromise = getDoc(doc(db, SETTINGS_COL, 'general'));
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
    const d = await Promise.race([fetchPromise, timeoutPromise]);

    if (d && d.exists()) {
      const remoteData = d.data() as SystemSettings;
      const merged = { ...defaultSettings, ...localData, ...remoteData };
      localStorage.setItem(SETTINGS_LOCAL_KEY, JSON.stringify(merged));
      return merged;
    }

    if (localData) {
      return { ...defaultSettings, ...localData };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${SETTINGS_COL}/general`);
  }

  const cached = localStorage.getItem(SETTINGS_LOCAL_KEY);
  if (cached) {
    try {
      return { ...defaultSettings, ...JSON.parse(cached) };
    } catch (e) {
      // ignore JSON parse error
    }
  }

  return defaultSettings;
};

export const updateSettings = async (settings: Partial<SystemSettings>) => {
  // 1. Sanitize settings object to strip undefined values
  const cleanSettings: Record<string, any> = {};
  Object.entries(settings).forEach(([key, val]) => {
    if (val !== undefined) {
      cleanSettings[key] = val;
    }
  });

  // 2. Save to localStorage immediately and dispatch update event
  try {
    const currentCached = localStorage.getItem(SETTINGS_LOCAL_KEY);
    const prev = currentCached ? JSON.parse(currentCached) : {};
    const updated = { ...prev, ...cleanSettings };
    localStorage.setItem(SETTINGS_LOCAL_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('settings-updated'));
  } catch (e) {
    console.warn('Could not save settings to localStorage:', e);
  }

  // 3. Attempt Firestore write with timeout race
  try {
    const writePromise = setDoc(doc(db, SETTINGS_COL, 'general'), cleanSettings, { merge: true });
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 2500));

    const result = await Promise.race([writePromise, timeoutPromise]);
    if (result === 'timeout') {
      console.warn('Firestore setDoc settings timed out, settings persisted to local storage.');
    }
    return;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COL}/general`);
  }
};

export const subscribeToSettings = (callback: (settings: SystemSettings) => void) => {
  getSettings().then(callback);

  const handleUpdate = () => {
    getSettings().then(callback);
  };
  window.addEventListener('settings-updated', handleUpdate);

  return () => {
    window.removeEventListener('settings-updated', handleUpdate);
  };
};

