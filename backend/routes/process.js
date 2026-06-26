import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import youtubedl from 'youtube-dl-exec';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

import { transcribeAudio } from '../services/groqService.js';
import { summarizeAndTranslate } from '../services/aiService.js';
import { generateSpeech } from '../services/ttsService.js';

const router = express.Router();

// Ensure temp/uploads directory exists
const uploadDir = path.join(process.cwd(), 'temp', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

/**
 * Helper to download YouTube audio to a temp file
 */
const downloadYoutubeAudio = async (url) => {
  const audioPath = path.join(process.cwd(), 'temp', `yt_${Date.now()}.webm`);
  await youtubedl(url, {
    format: 'bestaudio/best',
    output: audioPath
  });
  return audioPath;
};

/**
 * POST /api/process/youtube
 */
router.post('/youtube', async (req, res) => {
  try {
    const { url, subject, outputLang, outputFormat } = req.body;
    if (!url || !subject || !outputLang || !outputFormat) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Download audio
    const audioPath = await downloadYoutubeAudio(url);

    // 2. Transcribe via Groq Whisper
    const transcript = await transcribeAudio(audioPath);

    // 3. Summarize and Translate via Gemini
    const summary = await summarizeAndTranslate(transcript, subject, outputLang);

    // Cleanup temp audio
    fs.unlink(audioPath, () => {});

    // 4. Handle output format
    if (outputFormat === 'audio') {
      const ttsAudioPath = await generateSpeech(summary, outputLang);
      return res.sendFile(ttsAudioPath);
    } else {
      return res.json({ summary });
    }
  } catch (error) {
    console.error('[Process YouTube Error]', error);
    res.status(500).json({ error: error.message || 'Failed to process YouTube video' });
  }
});

/**
 * POST /api/process/document
 */
router.post('/document', upload.single('file'), async (req, res) => {
  try {
    const { subject, outputLang, outputFormat } = req.body;
    const file = req.file;
    if (!file || !subject || !outputLang || !outputFormat) {
      return res.status(400).json({ error: 'Missing required fields or file' });
    }

    // 1. Extract text
    let extractedText = '';
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (ext === '.pdf') {
      const data = await fs.promises.readFile(file.path);
      const pdfData = await pdfParse(data);
      extractedText = pdfData.text;
    } else if (ext === '.doc' || ext === '.docx') {
      const docData = await mammoth.extractRawText({ path: file.path });
      extractedText = docData.value;
    } else if (ext === '.txt') {
      extractedText = await fs.promises.readFile(file.path, 'utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    // Cleanup uploaded file
    fs.unlink(file.path, () => {});

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'Could not extract text from document' });
    }

    // 2. Summarize and Translate via Gemini
    const summary = await summarizeAndTranslate(extractedText, subject, outputLang);

    // 3. Handle output format
    if (outputFormat === 'audio') {
      const ttsAudioPath = await generateSpeech(summary, outputLang);
      return res.sendFile(ttsAudioPath);
    } else {
      return res.json({ summary });
    }
  } catch (error) {
    console.error('[Process Document Error]', error);
    res.status(500).json({ error: error.message || 'Failed to process document' });
  }
});

export default router;
