import { Trade } from "../models/Trade.js";

export const fetchAllTrades = async () => {
  return await Trade.find();
};

export const saveTrade = async (tradeData: any) => {
  const { pair, entry, exit, userId } = tradeData;
  
  // Calculate profit: profit = exit - entry
  const profit = Number(exit) - Number(entry);
  const date = new Date();

  const trade = new Trade({
    pair,
    entry,
    exit,
    profit,
    date,
    userId,
    // Backward compatibility
    symbol: pair,
    entryPrice: String(entry),
    exitPrice: String(exit),
    pnl: (profit >= 0 ? "+$" : "-$") + Math.abs(profit).toFixed(2),
    isWinner: profit > 0,
    entryDate: date.toISOString()
  });

  return await trade.save();
};

export const updateTradeById = async (id: string, updates: any) => {
  return await Trade.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteTradeById = async (id: string) => {
  return await Trade.findByIdAndDelete(id);
};
