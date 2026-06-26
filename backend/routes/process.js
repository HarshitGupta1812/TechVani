import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// Load pdf-parse via its internal path to skip the broken self-test in index.js
const pdfParse = require('pdf-parse/lib/pdf-parse.js');
const PDFParser = require('pdf2json');
import mammoth from 'mammoth';
import { YoutubeTranscript } from 'youtube-transcript';

import { summarizeAndTranslate } from '../services/aiService.js';
import { generateSpeech } from '../services/ttsService.js';

const router = express.Router();

// Ensure temp/uploads directory exists
const uploadDir = path.join(process.cwd(), 'temp', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

/**
 * Fetches the YouTube transcript using the youtube-transcript package.
 * Uses YouTube's own caption endpoint — works without downloading audio.
 * @param {string} url - YouTube video URL
 * @returns {Promise<string>} Full transcript text
 */
const getYoutubeTranscript = async (url) => {
  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(url, {
      lang: 'en', // prefer English captions
    });
    if (!transcriptItems || transcriptItems.length === 0) {
      throw new Error('No transcript available for this video.');
    }
    // Join all caption segments into a single text block
    return transcriptItems.map(item => item.text).join(' ');
  } catch (err) {
    // If English captions don't exist, try without language preference (auto-captions)
    if (err.message?.includes('lang')) {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(url);
      if (!transcriptItems || transcriptItems.length === 0) {
        throw new Error('No transcript/captions available for this video. Try a video with auto-generated or manual captions enabled.');
      }
      return transcriptItems.map(item => item.text).join(' ');
    }
    throw new Error(`Could not fetch transcript: ${err.message}`);
  }
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

    // Basic YouTube URL check
    const isYouTubeUrl = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)/.test(url);
    if (!isYouTubeUrl) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // 1. Fetch transcript directly from YouTube captions (no audio download needed)
    console.log(`[YouTube] Fetching transcript for: ${url}`);
    const transcript = await getYoutubeTranscript(url);
    console.log(`[YouTube] Transcript fetched: ${transcript.length} characters`);

    // 2. Summarize and Translate via Gemini
    console.log(`[YouTube] Summarizing and translating to ${outputLang}...`);
    const summary = await summarizeAndTranslate(transcript, subject, outputLang);

    // 3. Handle output format
    if (outputFormat === 'audio') {
      const ttsAudioPath = await generateSpeech(summary, outputLang);
      res.set('Content-Type', 'audio/mpeg');
      return res.sendFile(path.resolve(ttsAudioPath));
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
    const ext = path.extname(file.originalname || '').toLowerCase();

    if (ext === '.pdf') {
      // Try pdf-parse first; fall back to pdf2json if it throws
      try {
        const data = await fs.promises.readFile(file.path);
        const pdfData = await pdfParse(data);
        extractedText = pdfData.text;
      } catch (pdfErr) {
        console.warn('[PDF Parse] pdf-parse failed, trying pdf2json fallback:', pdfErr.message);
        try {
          extractedText = await new Promise((resolve, reject) => {
            const parser = new PDFParser(null, true); // true = raw text mode
            parser.on('pdfParser_dataReady', () => {
              resolve(parser.getRawTextContent());
            });
            parser.on('pdfParser_dataError', (err) => {
              reject(new Error(`PDF parsing failed: ${err.parserError || err.message || 'Could not read PDF'}`));
            });
            parser.loadPDF(file.path);
          });
        } catch (fallbackErr) {
          // Both parsers failed — clean up and return a user-friendly 400
          fs.unlink(file.path, () => {});
          return res.status(400).json({
            error: 'Could not extract text from this PDF. It may be scanned/image-based, password-protected, or in an unsupported format. Try a text-based PDF, DOC, or TXT file.'
          });
        }
      }
    } else if (ext === '.doc' || ext === '.docx') {
      const docData = await mammoth.extractRawText({ path: file.path });
      extractedText = docData.value;
    } else if (ext === '.txt') {
      extractedText = await fs.promises.readFile(file.path, 'utf8');
    } else {
      fs.unlink(file.path, () => {});
      return res.status(400).json({ error: 'Unsupported file format. Please upload PDF, DOC, DOCX, or TXT.' });
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
      res.set('Content-Type', 'audio/mpeg');
      return res.sendFile(path.resolve(ttsAudioPath));
    } else {
      return res.json({ summary });
    }
  } catch (error) {
    console.error('[Process Document Error]', error);
    res.status(500).json({ error: error.message || 'Failed to process document' });
  }
});

export default router;
