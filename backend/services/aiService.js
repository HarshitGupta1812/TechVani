import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-pro',
  temperature: 0.3,
});

const techVaniSystemPrompt = `You are TechVani AI, an intelligent assistant built into an educational platform designed to localize learning for Indian students. 
Your primary role is to help users understand how to use TechVani, explain its features (like equation guarding, diagram translation, and smart glossaries), 
and guide them through their localized learning journey. Keep responses concise, helpful, and strictly relevant to the TechVani application and general study tips.`;

export const handleGeneralChat = async (userMessage) => {
  const messages = [
    new SystemMessage(techVaniSystemPrompt),
    new HumanMessage(userMessage)
  ];
  const response = await model.invoke(messages);
  return response.content.toString();
};

export const contextualTranslationPipeline = async (rawText, metadata) => {
  const { subjectDomain, targetLanguage, scriptStyle } = metadata;

  // 1. Equation & Layout Guard: Isolate LaTeX/Markdown formulas
  const equations = [];
  const equationRegex = /(\$\$[\s\S]*?\$\$|\$[^\$]+\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\))/g;
  
  let guardedText = rawText.replace(equationRegex, (match) => {
    equations.push(match);
    return `__TECHVANI_MATH_TOKEN_${equations.length - 1}__`;
  });

  // 2. Smart Glossary Context Injection
  const glossaryInstruction = scriptStyle === 'Phonetic (Hinglish/Telugu-English)' 
    ? `Translate technical terms into phonetic hybrids (e.g., 'Velocity' becomes 'Velositi', 'Gravity' becomes 'Grawiti').`
    : `Translate technical terms into standard ${targetLanguage} nomenclature using the ${scriptStyle} script.`;

  const translationPrompt = `You are an expert academic translator specializing in the ${subjectDomain} domain.
Translate the following educational text into ${targetLanguage}.
Instructions:
- Apply the ${scriptStyle} script style.
- ${glossaryInstruction}
- DO NOT translate, alter, or modify any text that looks like this: __TECHVANI_MATH_TOKEN_X__. Leave them exactly as they are.
- Maintain the original structural formatting (like line breaks and bullet points).

Text to translate:
 ${guardedText}`;

  const messages = [new HumanMessage(translationPrompt)];
  const translatedRaw = await model.invoke(messages);
  let finalText = translatedRaw.content.toString();

  // 3. Restore original equations
  equations.forEach((eq, index) => {
    finalText = finalText.replace(`__TECHVANI_MATH_TOKEN_${index}__`, eq);
  });

  return finalText;
};

export const processDiagramOcrTranslation = async (ocrBboxes, metadata) => {
  const { targetLanguage, subjectDomain } = metadata;
  
  const bboxPrompt = `You are a precise OCR translation engine for ${subjectDomain} diagrams.
I will provide an array of text strings extracted from image bounding boxes.
Translate each string into ${targetLanguage}. 
Return ONLY a valid JSON array of strings in the exact same order. No markdown, no extra text.
Data: ${JSON.stringify(ocrBboxes)}`;

  const messages = [new HumanMessage(bboxPrompt)];
  const response = await model.invoke(messages);
  
  try {
    const cleanedResponse = response.content.toString().replace(/```json\n?|\n?```/g, '').trim();
    const translatedBboxes = JSON.parse(cleanedResponse);
    return ocrBboxes.map((original, index) => ({
      originalText: original,
      translatedText: translatedBboxes[index] || original,
      // These coordinates map directly to frontend overlay logic
      overlayLogic: 'position: absolute; transform: translate(Xpx, Ypx); font-size: calculatedSize;'
    }));
  } catch (e) {
    return ocrBboxes.map(original => ({ originalText: original, translatedText: original }));
  }
};