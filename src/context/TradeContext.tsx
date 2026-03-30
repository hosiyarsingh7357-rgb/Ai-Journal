import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp, orderBy, setDoc, doc, deleteDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { Trade } from "../types";

const TradeContext = createContext<{
  trades: Trade[];
  setTrades: React.Dispatch<React.SetStateAction<Trade[]>>;
  addTrade: (trade: Trade) => Promise<void>;
  updateTrade: (tradeId: string, updates: Partial<Trade>) => Promise<void>;
  deleteTrade: (tradeId: string) => Promise<void>;
} | null>(null);

export const TradeProvider = ({ children }: any) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTrades([]);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "trades"),
      orderBy("tradeDate", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tradesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[];
      setTrades(tradesData);
    }, (error) => {
      console.error("Error fetching trades:", error);
    });

    return unsubscribe;
  }, [user]);

  const addTrade = async (trade: Trade) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "trades"), {
        ...trade,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding trade:", error);
    }
  };

  const updateTrade = async (tradeId: string, updates: Partial<Trade>) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid, "trades", tradeId), updates, { merge: true });
    } catch (error) {
      console.error("Error updating trade:", error);
    }
  };

  const deleteTrade = async (tradeId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "trades", tradeId));
    } catch (error) {
      console.error("Error deleting trade:", error);
    }
  };

  return (
    <TradeContext.Provider value={{ trades, setTrades, addTrade, updateTrade, deleteTrade }}>
      {children}
    </TradeContext.Provider>
  );
};

export const useTrades = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error("useTrades must be used within a TradeProvider");
  }
  return context;
};
