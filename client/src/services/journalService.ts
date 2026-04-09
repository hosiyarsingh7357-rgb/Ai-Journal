import { db, auth } from "../lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy 
} from "firebase/firestore";

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

export const subscribeToJournals = (userId: string, callback: (journals: any[]) => void) => {
  const path = `users/${userId}/journals`;
  const journalsRef = collection(db, "users", userId, "journals");
  const q = query(journalsRef, orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const journals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(journals);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });

  return unsubscribe;
};

export const addJournalToFirebase = async (userId: string, journal: any) => {
  const path = `users/${userId}/journals`;
  try {
    const journalsRef = collection(db, "users", userId, "journals");
    const docRef = await addDoc(journalsRef, {
      ...journal,
      userId,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateJournalInFirebase = async (userId: string, journalId: string, updates: any) => {
  const path = `users/${userId}/journals/${journalId}`;
  try {
    const journalRef = doc(db, "users", userId, "journals", journalId);
    await updateDoc(journalRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteJournalFromFirebase = async (userId: string, journalId: string) => {
  const path = `users/${userId}/journals/${journalId}`;
  try {
    const journalRef = doc(db, "users", userId, "journals", journalId);
    await deleteDoc(journalRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
