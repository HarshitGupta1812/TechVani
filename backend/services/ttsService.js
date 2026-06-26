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
 * Writes text to a temp file to avoid Windows CLI argument length limits.
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
    
    const timestamp = Date.now();
    const outputPath = path.join(tempDir, `tts_${timestamp}.mp3`);
    const textFilePath = path.join(tempDir, `tts_input_${timestamp}.txt`);

    // Write text to a temp file to avoid Windows CLI argument length limits (8191 chars)
    try {
      fs.writeFileSync(textFilePath, text, 'utf8');
    } catch (writeErr) {
      return reject(new Error(`Failed to write TTS input file: ${writeErr.message}`));
    }
    
    console.log(`[TTS] Generating speech with voice: ${voice}, text length: ${text.length} chars`);

    // Use --file instead of --text to bypass command-line length limits
    const edge = spawn('edge-tts', [
      '--voice', voice,
      '--file', textFilePath,
      '--write-media', outputPath
    ]);

    let errorOutput = '';

    edge.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    edge.on('close', (code) => {
      // Always clean up the temp text file
      fs.unlink(textFilePath, () => {});

      if (code !== 0) {
        console.error('[edge-tts Error]', errorOutput);
        reject(new Error(`TTS generation failed (exit code ${code}): ${errorOutput || 'Unknown error'}`));
        return;
      }

      // Validate the output file exists and has content
      try {
        const stats = fs.statSync(outputPath);
        if (stats.size === 0) {
          fs.unlink(outputPath, () => {});
          reject(new Error('TTS generated an empty audio file. The text may not be supported by the selected voice.'));
          return;
        }
        console.log(`[TTS] Audio generated: ${(stats.size / 1024).toFixed(0)} KB`);
        resolve(outputPath);
      } catch (e) {
        reject(new Error('TTS audio file was not created. Check edge-tts installation.'));
      }
    });
    
    // If edge-tts is not installed, it will emit an error
    edge.on('error', (err) => {
      fs.unlink(textFilePath, () => {});
      console.error('[edge-tts Error] Command failed to spawn. Is edge-tts installed? (`pip install edge-tts`)', err);
      reject(new Error('TTS Engine not available. Please install edge-tts: pip install edge-tts'));
    });
  });
}

