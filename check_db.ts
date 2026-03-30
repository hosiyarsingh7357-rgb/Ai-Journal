import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function check() {
  console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Database connection successful!");
      process.exit(0);
    } catch (err) {
      console.error("Database connection failed:", err);
      process.exit(1);
    }
  } else {
    console.error("MONGODB_URI is not set!");
    process.exit(1);
  }
}
check();
