import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import tradeRoutes from "./routes/tradeRoutes.js";
import { connectDatabase } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // Connect to MongoDB
  await connectDatabase();

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

  // Error Handler
  app.use(errorHandler);

  app.get("/api/economic-news", async (req, res) => {
    // Generate a comprehensive mock dataset for the month
    const today = new Date();
    const events = [];
    
    for (let i = -5; i <= 25; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Add 2-3 events per day
      for (let j = 0; j < 3; j++) {
        events.push({
          id: `${i}-${j}`,
          date: date.toISOString().split('T')[0],
          time: `${10 + j * 2}:00`,
          country: '🇺🇸',
          currency: 'USD',
          impact: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          title: ['Crude Oil Inventories', 'Non-Farm Payrolls', 'CPI Inflation Rate', 'Fed Interest Rate Decision', 'Retail Sales'][Math.floor(Math.random() * 5)],
          actual: i < 0 ? (Math.random() * 10).toFixed(2) : '-',
          forecast: (Math.random() * 10).toFixed(2),
          previous: (Math.random() * 10).toFixed(2),
          aiTag: Math.random() > 0.5 ? 'AI' : null
        });
      }
    }
    res.json(events);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.join(process.cwd(), 'client'),
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
        hmr: false // Disable HMR explicitly
      },
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("CRITICAL: Failed to start server:", err);
  process.exit(1);
});
