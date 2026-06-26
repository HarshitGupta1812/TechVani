import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';

let _model = null;
function getModel() {
  if (!_model) {
    _model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'gemini-2.5-flash',
      temperature: 0.4,
    });
  }
  return _model;
}

const TUTOR_SYSTEM_PROMPT = `You are TechVani AI — a friendly assistant that helps users understand the TechVani platform.

TechVani has exactly TWO features:

1. YouTube Section: Users paste a YouTube link. TechVani transcribes the audio using Whisper AI, summarizes the content using Gemini AI, and translates the summary into any of 22 Indian languages. Users can receive the output as either an Audio Summary (neural text-to-speech) or a Text Summary.

2. Document Section: Users upload PDF, DOC, or TXT files. TechVani extracts the text, summarizes it, and translates it into any of 22 Indian languages. Same Audio/Text output options.

Supported languages: Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese, Maithili, Sanskrit, Urdu, Sindhi, Dogri, Konkani, Manipuri, Bodo, Santali, Kashmiri, Nepali.

Keep responses concise and helpful. If asked about features that don't exist (flashcards, real-time chat in workspace, equation guard, etc.), politely clarify what TechVani actually offers.`;

/**
 * Multi-turn chatbot powered by Gemini 2.5 Flash.
 * Accepts the current message + full conversation history for context.
 */
export const handleTutorChat = async (userMessage, history = []) => {
  const messages = [new SystemMessage(TUTOR_SYSTEM_PROMPT)];

  for (const msg of history) {
    if (msg.from === 'user') {
      messages.push(new HumanMessage(msg.text));
    } else if (msg.from === 'bot') {
      messages.push(new AIMessage(msg.text));
    }
  }

  messages.push(new HumanMessage(userMessage));

  const response = await getModel().invoke(messages);
  return response.content.toString();
};

/**
 * Generates a structured summary of the input text and translates it into the output language.
 * @param {string} text - The raw text (from transcript or document)
 * @param {string} subject - The subject domain of the text
 * @param {string} outputLang - The target language for the summary
 * @returns {Promise<string>} The translated summary
 */
export const summarizeAndTranslate = async (text, subject, outputLang) => {
  const prompt = `You are an expert academic tutor specializing in ${subject}. 
I will provide you with a raw transcript or document text.
Your task is to create a comprehensive, well-structured, and easy-to-understand summary of the content.
Translate the summary into ${outputLang}.

Format the output clearly using paragraphs. Ensure technical concepts are explained simply. 
Do not include any English text in the final output unless it's a standard technical term that is better left in English.

Input Text:
${text.substring(0, 50000)} // truncate to prevent massive context explosion
`;

  const messages = [new HumanMessage(prompt)];
  const response = await getModel().invoke(messages);
  return response.content.toString();
};