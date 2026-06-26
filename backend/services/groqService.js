import Groq from 'groq-sdk';
import fs from 'fs';

let _groq = null;

function getGroqClient() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

const MAX_AUDIO_SIZE_MB = 25; // Groq Whisper file size limit

/**
 * Transcribes audio using Groq's whisper-large-v3 model.
 * @param {string} audioFilePath - The absolute path to the audio file
 * @returns {Promise<string>} The transcribed text
 */
export async function transcribeAudio(audioFilePath) {
  try {
    // Validate file exists and check size
    const stats = fs.statSync(audioFilePath);
    const sizeMB = stats.size / (1024 * 1024);
    console.log(`[Groq Whisper] Audio file size: ${sizeMB.toFixed(2)} MB`);

    if (sizeMB > MAX_AUDIO_SIZE_MB) {
      throw new Error(
        `Audio file is ${sizeMB.toFixed(1)}MB, which exceeds Groq's ${MAX_AUDIO_SIZE_MB}MB limit. Try a shorter video.`
      );
    }

    const groq = getGroqClient();
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: 'whisper-large-v3',
      response_format: 'json',
      language: 'en', // Forcing English as default for YouTube lectures/content
    });
    return transcription.text;
  } catch (error) {
    console.error('[Groq Whisper Error]', error);
    throw new Error(error.message || 'Failed to transcribe audio. Please verify your Groq API key.');
  }
}

