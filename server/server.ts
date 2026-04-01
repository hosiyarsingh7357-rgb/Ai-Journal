import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import tradeRoutes from "./routes/tradeRoutes.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // Connect to MongoDB
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (mongoUri) {
    mongoose.connect(mongoUri)
      .then(() => {
        console.log("✅ MongoDB Connected");
      })
      .catch((error) => {
        console.error("❌ MongoDB Connection Failed:", error.message);
        process.exit(1);
      });
  } else {
    console.warn("⚠️ MONGO_URI not set, using in-memory storage");
  }

  // Basic routes
  app.get("/api", (req, res) => {
    res.send("API is running");
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      readyState: mongoose.connection.readyState 
    });
  });

  app.use("/api/trades", tradeRoutes);
  app.use("/api/trade", tradeRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.join(process.cwd(), 'client'),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'client', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
