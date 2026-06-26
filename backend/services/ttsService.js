import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Map of our supported 22 Indian languages to Microsoft Edge neural voices
const edgeVoices = {
  'Hindi': 'hi-IN-MadhurNeural',
  'Bengali': 'bn-IN-BashkarNeural',
  'Telugu': 'te-IN-MohanNeural',
  'Tamil': 'ta-IN-ValluvarNeural',
  'Marathi': 'mr-IN-ManoharNeural',
  'Gujarati': 'gu-IN-NiranjanNeural',
  'Kannada': 'kn-IN-GaganNeural',
  'Malayalam': 'ml-IN-MidhunNeural',
  'Urdu': 'ur-IN-SalmanNeural',
  // Fallbacks to standard voices if specific neural voices don't exist in edge-tts
  'Odia': 'en-IN-PrabhatNeural',
  'Punjabi': 'en-IN-PrabhatNeural',
  'Assamese': 'en-IN-PrabhatNeural',
  'Maithili': 'en-IN-PrabhatNeural',
  'Sanskrit': 'en-IN-PrabhatNeural',
  'Sindhi': 'en-IN-PrabhatNeural',
  'Dogri': 'en-IN-PrabhatNeural',
  'Konkani': 'en-IN-PrabhatNeural',
  'Manipuri': 'en-IN-PrabhatNeural',
  'Bodo': 'en-IN-PrabhatNeural',
  'Santali': 'en-IN-PrabhatNeural',
  'Kashmiri': 'en-IN-PrabhatNeural',
  'Nepali': 'ne-NP-HemantNeural',
};

/**
 * Uses Python edge-tts to generate audio from text.
 * Requires edge-tts installed globally or in Python path (`pip install edge-tts`).
 *
 * @param {string} text - Text to synthesize
 * @param {string} language - Target language
 * @returns {Promise<string>} Path to the generated mp3 file
 */
export async function generateSpeech(text, language) {
  return new Promise((resolve, reject) => {
    const voice = edgeVoices[language] || 'en-IN-PrabhatNeural'; // Fallback voice
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const outputPath = path.join(tempDir, `tts_${Date.now()}.mp3`);
    
    // We spawn the edge-tts python package. Make sure it's installed on the system!
    const edge = spawn('edge-tts', [
      '--voice', voice,
      '--text', text,
      '--write-media', outputPath
    ]);

    let errorOutput = '';

    edge.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    edge.on('close', (code) => {
      if (code !== 0) {
        console.error('[edge-tts Error]', errorOutput);
        reject(new Error(`TTS generation failed: ${errorOutput || 'Unknown error'}`));
      } else {
        resolve(outputPath);
      }
    });
    
    // If edge-tts is not installed, it will emit an error
    edge.on('error', (err) => {
      console.error('[edge-tts Error] Command failed to spawn. Is edge-tts installed? (`pip install edge-tts`)', err);
      reject(new Error('TTS Engine not available. Please install edge-tts.'));
    });
  });
}
