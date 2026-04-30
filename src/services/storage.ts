import { TripData } from '../types';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const TRIPS_COLLECTION = "trips";

export const storage = {
  async getTrips(): Promise<TripData[]> {
    if (!auth.currentUser) return [];
    try {
      const q = query(
        collection(db, TRIPS_COLLECTION),
        where("members", "array-contains-any", [auth.currentUser.uid, auth.currentUser.email])
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TripData));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, TRIPS_COLLECTION);
      return [];
    }
  },

  async getTrip(id: string): Promise<TripData | null> {
    try {
      const docRef = doc(db, TRIPS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as TripData;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${TRIPS_COLLECTION}/${id}`);
      return null;
    }
  },

  async createTrip(id: string, data: any): Promise<void> {
    try {
      const code = Math.random().toString(36).substring(2, 5).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
      const trip = { ...data, code, createdAt: new Date().toISOString() };
      await setDoc(doc(db, TRIPS_COLLECTION, id), trip);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${TRIPS_COLLECTION}/${id}`);
    }
  },

  async getTripByCode(code: string): Promise<TripData | null> {
    try {
      const q = query(
        collection(db, TRIPS_COLLECTION),
        where("code", "==", code.toUpperCase())
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as TripData;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, TRIPS_COLLECTION);
      return null;
    }
  },

  async updateTrip(id: string, data: Partial<TripData>): Promise<void> {
    try {
      const docRef = doc(db, TRIPS_COLLECTION, id);
      await updateDoc(docRef, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${TRIPS_COLLECTION}/${id}`);
    }
  },

  async deleteTrip(id: string): Promise<void> {
    try {
      const docRef = doc(db, TRIPS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${TRIPS_COLLECTION}/${id}`);
    }
  },

  subscribeToTrips(callback: (trips: TripData[]) => void) {
    if (!auth.currentUser) return () => {};
    
    const q = query(
      collection(db, TRIPS_COLLECTION),
      where("members", "array-contains-any", [auth.currentUser.uid, auth.currentUser.email])
    );

    return onSnapshot(q, 
      (snapshot) => {
        const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TripData));
        callback(trips);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, TRIPS_COLLECTION);
      }
    );
  }
};
