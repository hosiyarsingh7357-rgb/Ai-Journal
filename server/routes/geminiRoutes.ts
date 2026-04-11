import express from 'express';
import { geminiService } from '../services/geminiService.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/insights', authenticate, async (req, res) => {
  try {
    const insights = await geminiService.generateInsights(req.body);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

export default router;
