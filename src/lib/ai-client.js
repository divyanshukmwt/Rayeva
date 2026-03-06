/**
 * lib/ai-client.js
 * Singleton Google Gemini client with structured prompt/response logging.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "\n⚠️  WARNING: GEMINI_API_KEY is not set.\n" +
    "   Copy .env.example to .env.local and add your key.\n" +
    "   Get one free at https://aistudio.google.com/app/apikey\n"
  );
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "missing-key");

export const AI_MODEL = "gemini-2.5-flash";

const logs = [];

export function getLogs() {
  return [...logs];
}

export async function runAIModule(module, systemPrompt, userPrompt, parser) {
  const id = `${module}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const start = Date.now();

  let rawResponse = "";
  let parsedOutput = null;
  let success = false;
  let errorMsg;

  try {
    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userPrompt);
    rawResponse = result.response.text();

    parsedOutput = parser(rawResponse);
    success = true;
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
    throw err;
  } finally {
    const log = {
      id,
      module,
      prompt: userPrompt,
      rawResponse,
      parsedOutput,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      success,
      error: errorMsg,
    };
    logs.push(log);
  }

  return { result: parsedOutput, log: logs[logs.length - 1] };
}

export function extractJSON(raw) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenced ? fenced[1] : raw;
  return JSON.parse(jsonStr.trim());
}
