import express from 'express';
import History from '../models/History.js';

const router = express.Router();

/**
 * GET /api/history/:userId
 * Fetch history for a specific user (optional functionality depending on auth status)
 */
router.get('/:userId', async (req, res) => {
  try {
    const history = await History.find({ userId: req.params.userId })
                                 .sort({ createdAt: -1 })
                                 .limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * DELETE /api/history/:id
 * Delete a specific history entry
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await History.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'History item not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete history item' });
  }
});

export default router;
