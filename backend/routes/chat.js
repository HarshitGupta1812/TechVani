import express from 'express';
import { handleTutorChat } from '../services/aiService.js';

const router = express.Router();

/**
 * POST /api/chat
 *
 * TechVani AI Tutor endpoint.
 * Accepts the current message and conversation history,
 * calls Gemini 2.5 Flash, and returns the AI reply.
 *
 * Body: { message: string, conversation_history?: Array<{from, text}> }
 * Response: { reply: string }
 */
router.post('/', async (req, res) => {
  const { message, conversation_history } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const reply = await handleTutorChat(message.trim(), conversation_history || []);
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('[POST /api/chat] Gemini API error:', error.message);
    return res.status(500).json({
      error: 'The AI tutor is temporarily unavailable. Please try again in a moment.',
    });
  }
});

export default router;
