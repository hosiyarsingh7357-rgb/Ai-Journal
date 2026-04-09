import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Trade } from "@shared/types";
import { subscribeToTrades, addTradeToFirebase, updateTradeInFirebase, deleteTradeFromFirebase } from "../services/tradeService";

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

    const unsubscribe = subscribeToTrades(user.uid, (data) => {
      setTrades(data);
    });

    return () => unsubscribe();
  }, [user]);

  const addTrade = async (trade: Trade) => {
    if (!user) return;
    try {
      await addTradeToFirebase(user.uid, trade);
    } catch (error) {
      console.error("Error adding trade:", error);
    }
  };

  const updateTrade = async (tradeId: string, updates: Partial<Trade>) => {
    if (!user) return;
    try {
      await updateTradeInFirebase(user.uid, tradeId, updates);
    } catch (error) {
      console.error("Error updating trade:", error);
    }
  };

  const deleteTrade = async (tradeId: string) => {
    if (!user) return;
    try {
      await deleteTradeFromFirebase(user.uid, tradeId);
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
