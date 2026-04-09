import { db, auth } from "../config/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy,
  getDocs
} from "firebase/firestore";
import { Trade } from "@shared/types";

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
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const subscribeToTrades = (userId: string, callback: (trades: Trade[]) => void) => {
  const path = `users/${userId}/trades`;
  const tradesRef = collection(db, "users", userId, "trades");
  const q = query(tradesRef, orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const trades = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Trade[];
    callback(trades);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });

  return unsubscribe;
};

export const addTradeToFirebase = async (userId: string, trade: Omit<Trade, 'id'>) => {
  const path = `users/${userId}/trades`;
  try {
    const tradesRef = collection(db, "users", userId, "trades");
    const tradeData = {
      userId,
      symbol: trade.symbol,
      type: trade.type,
      size: trade.size,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice || "",
      pnl: trade.pnl || "",
      isWinner: trade.isWinner ?? false,
      entryDate: trade.entryDate || "",
      exitDate: trade.exitDate || "",
      notes: trade.notes || "",
      screenshot: trade.screenshot || "",
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(tradesRef, tradeData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateTradeInFirebase = async (userId: string, tradeId: string, updates: Partial<Trade>) => {
  const path = `users/${userId}/trades/${tradeId}`;
  try {
    const tradeRef = doc(db, "users", userId, "trades", tradeId);
    await updateDoc(tradeRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteTradeFromFirebase = async (userId: string, tradeId: string) => {
  const path = `users/${userId}/trades/${tradeId}`;
  try {
    const tradeRef = doc(db, "users", userId, "trades", tradeId);
    await deleteDoc(tradeRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
