import Groq from 'groq-sdk';
import fs from 'fs';

let _groq = null;

function getGroqClient() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

/**
 * Transcribes audio using Groq's whisper-large-v3 model.
 * @param {string} audioFilePath - The absolute path to the audio file
 * @returns {Promise<string>} The transcribed text
 */
export async function transcribeAudio(audioFilePath) {
  try {
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
    throw new Error('Failed to transcribe audio. Please verify your Groq API key.');
  }
}
