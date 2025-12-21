import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getSystemInstructions,
  loadKnowledgeBase,
  logMessage
} from "../../../utils/index.js";
import { LOG_LEVELS } from "../../../config/constants.js";

export default class GenAIClient {
  client;

  constructor() {
    const apiKey = process.env.GEN_API_KEY;
    if (!apiKey) {
      logMessage(`[AI] ⚠️ GEN_API_KEY not found in environment variables`);
    } else {
      logMessage(`[AI] ✅ API Key found`);
    }

    this.client = new GoogleGenerativeAI(apiKey);

    // Load knowledge base
    loadKnowledgeBase();
  }

  async sendPrompt(prompt) {
    const startTime = Date.now();

    logMessage(`[AI] 🚀 Sending prompt to Gemini Pro`);
    logMessage(
      `[GENAI] Input: "${prompt.substring(0, 100)}${
        prompt.length > 100 ? "..." : ""
      }"`
    );

    try {
      const model = this.client.getGenerativeModel({
        model: process.env.GEN_AI_MODEL || "gemini-2.5-flash",
      });

      const result = await model.generateContent({
        systemInstruction: getSystemInstructions(),
        contents: [{ parts: [{ text: prompt }] }],
      });
      const response = result.response;

      const processingTime = Date.now() - startTime;
      const responseContent = response.text();

      logMessage(`[AI] ✅ Response received in ${processingTime}ms`);
      logMessage(
        `[GENAI] Output: "${responseContent.substring(0, 100)}${
          responseContent.length > 100 ? "..." : ""
        }"`
      );

      return responseContent;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logMessage(
        `[GENAI] ❌ Error after ${processingTime}ms: ${error.message}`
      );

      // Log detailed error information
      if (error.status) {
        logMessage(`[AI] Status: ${error.status}`);
      }
      if (error.response) {
        logMessage(`[AI] Response:`, error.response);
      }

      return "Maaf, terjadi kesalahan saat menghubungi Google Gemini. Pastikan API key valid dan koneksi internet stabil.";
    }
  }
}

