import React, { createContext, useContext, useState, useEffect } from "react";
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

    const fetchTrades = async () => {
      try {
        const response = await fetch("/api/trades");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("API response:", data);
        if (Array.isArray(data)) {
          setTrades(data.filter((t: any) => t.userId === user.uid));
        } else {
          console.error("Fetched data is not an array:", data);
          setTrades([]);
        }
      } catch (error) {
        console.error("Error fetching trades:", error);
      }
    };
    fetchTrades();
  }, [user]);

  const addTrade = async (trade: Trade) => {
    if (!user) return;
    try {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...trade, userId: user.uid }),
      });
      const data = await response.json();
      if (data.success) {
        setTrades(prev => [...prev, data.trade]);
      }
    } catch (error) {
      console.error("Error adding trade:", error);
    }
  };

  const updateTrade = async (tradeId: string, updates: Partial<Trade>) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (data.success) {
        setTrades(prev => prev.map(t => (t.id === tradeId || (t as any)._id === tradeId ? data.trade : t)));
      }
    } catch (error) {
      console.error("Error updating trade:", error);
    }
  };

  const deleteTrade = async (tradeId: string) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setTrades(prev => prev.filter(t => t.id !== tradeId && (t as any)._id !== tradeId));
      }
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
