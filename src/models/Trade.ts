import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: String, required: true },
  entryPrice: { type: String, required: true },
  exitPrice: { type: String },
  pnl: { type: String },
  isWinner: { type: Boolean },
  entryDate: { type: String, required: true },
  exitDate: { type: String },
  userId: { type: String, required: true }
});

export const Trade = mongoose.model('Trade', tradeSchema);
