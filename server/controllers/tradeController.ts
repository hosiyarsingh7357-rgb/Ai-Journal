import { Request, Response } from "express";
import { Trade } from "../models/Trade.js";
import mongoose from "mongoose";

export const getTrades = async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn("Database not connected, returning empty array");
      return res.status(200).json([]);
    }
    const trades = await Trade.find();
    res.status(200).json(trades);
  } catch (err) {
    console.error("Error in getTrades:", err);
    res.status(500).json({ error: "Failed to fetch trades", details: err instanceof Error ? err.message : String(err) });
  }
};

export const createTrade = async (req: Request, res: Response) => {
  try {
    const { pair, entry, exit, userId } = req.body;
    
    // Validation
    if (!pair || entry === undefined || exit === undefined || !userId) {
      return res.status(400).json({ error: "All fields are required" });
    }

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

    await trade.save();
    res.status(201).json({ success: true, trade });
  } catch (err) {
    console.error("Error in createTrade:", err);
    res.status(500).json({ error: "Failed to save trade", details: err instanceof Error ? err.message : String(err) });
  }
};

export const updateTrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const trade = await Trade.findByIdAndUpdate(id, req.body, { new: true });
    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }
    res.json({ success: true, trade });
  } catch (err) {
    res.status(400).json({ error: "Failed to update trade" });
  }
};

export const deleteTrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const trade = await Trade.findByIdAndDelete(id);
    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete trade" });
  }
};
