import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  pair: { type: String, required: true },
  entry: { type: Number, required: true },
  exit: { type: Number, required: true },
  profit: { type: Number },
  date: { type: Date, default: Date.now },
  userId: { type: String, required: true },
  // Old fields (optional)
  symbol: { type: String },
  type: { type: String },
  size: { type: String },
  entryPrice: { type: String },
  exitPrice: { type: String },
  pnl: { type: String },
  isWinner: { type: Boolean },
  entryDate: { type: String },
  exitDate: { type: String }
});

export const Trade = mongoose.model('Trade', tradeSchema);
