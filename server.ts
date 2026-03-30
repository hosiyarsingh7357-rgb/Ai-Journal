import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Trade } from "./src/models/Trade";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB");
    } catch (err) {
      console.error("MongoDB connection error:", err);
    }
  } else {
    console.warn("MONGODB_URI not set, using in-memory storage");
  }

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      readyState: mongoose.connection.readyState 
    });
  });

  app.get("/api/trades", async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        console.warn("Database not connected, returning empty array");
        return res.json([]);
      }
      const trades = await Trade.find();
      res.json(trades);
    } catch (err) {
      console.error("Error in /api/trades:", err);
      res.status(500).json({ error: "Failed to fetch trades", details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post("/api/trades", async (req, res) => {
    try {
      const trade = new Trade(req.body);
      await trade.save();
      res.json({ success: true, trade });
    } catch (err) {
      res.status(400).json({ error: "Failed to save trade" });
    }
  });

  app.put("/api/trades/:id", async (req, res) => {
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
  });

  app.delete("/api/trades/:id", async (req, res) => {
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
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
