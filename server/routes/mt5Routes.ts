import express from 'express';
import { mt5Service } from '../services/mt5Service.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/connect', authenticate, async (req, res) => {
  const result = await mt5Service.connect(req.body);
  res.json(result);
});

router.get('/trades/:accountId', authenticate, async (req, res) => {
  const trades = await mt5Service.getTrades(req.params.accountId);
  res.json(trades);
});

export default router;
