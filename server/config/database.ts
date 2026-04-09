import mongoose from "mongoose";

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.warn("⚠️ MONGO_URI not set, using in-memory storage (simulated)");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};
