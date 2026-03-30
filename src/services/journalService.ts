import { db } from "../lib/firebase";
import { collection, addDoc, setDoc, doc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

export const subscribeToJournals = (userId: string, callback: (journals: any[]) => void) => {
  const q = query(
    collection(db, "users", userId, "journals"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const journals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(journals);
  }, (error) => {
    console.error("Error fetching journals:", error);
  });
};

export const addJournal = async (userId: string, journal: any) => {
  try {
    return await addDoc(collection(db, "users", userId, "journals"), {
      ...journal,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding journal:", error);
    throw error;
  }
};

export const updateJournal = async (userId: string, journalId: string, updates: any) => {
  try {
    await setDoc(doc(db, "users", userId, "journals", journalId), {
      ...updates,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error updating journal:", error);
    throw error;
  }
};

export const deleteJournal = async (userId: string, journalId: string) => {
  try {
    await deleteDoc(doc(db, "users", userId, "journals", journalId));
  } catch (error) {
    console.error("Error deleting journal:", error);
    throw error;
  }
};
