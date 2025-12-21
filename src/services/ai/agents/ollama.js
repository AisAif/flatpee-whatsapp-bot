import { Ollama } from "ollama";
import {
  getSystemInstructions,
  loadKnowledgeBase,
  logMessage
} from "../../../utils/index.js";
import { LOG_LEVELS } from "../../../config/constants.js";

export default class OllamaClient {
  client;
  knowledgeBase = new Map();

  constructor() {
    const host = process.env.OLLAMA_HOST || "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL || "tinyllama";
    const hasApiKey = process.env.OLLAMA_API_KEY ? "Yes" : "No";

    logMessage(`[AI] Initializing client...`, LOG_LEVELS.INFO);
    logMessage(`[AI] Host: ${host}`, LOG_LEVELS.INFO);
    logMessage(`[AI] Model: ${model}`, LOG_LEVELS.INFO);
    logMessage(`[AI] API Key: ${hasApiKey}`, LOG_LEVELS.INFO);

    this.client = new Ollama({
      host: host,
      headers: {
        "X-API-Key": process.env.OLLAMA_API_KEY,
      },
    });

    // Load knowledge base
    loadKnowledgeBase();
  }

  async sendPrompt(prompt) {
    const model = process.env.OLLAMA_MODEL || "tinyllama";
    const startTime = Date.now();

    logMessage(`[AI] 🚀 Sending prompt to ${model}`);
    logMessage(
      `[OLLAMA] Input: "${prompt.substring(0, 100)}${
        prompt.length > 100 ? "..." : ""
      }"`
    );

    try {
      const response = await this.client.chat({
        model: model,
        messages: [
          {
            role: "system",
            content: getSystemInstructions(),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const processingTime = Date.now() - startTime;
      const responseContent =
        response.message.content || response.response || "";

      logMessage(`[AI] ✅ Response received in ${processingTime}ms`);
      logMessage(
        `[OLLAMA] Output: "${responseContent.substring(0, 100)}${
          responseContent.length > 100 ? "..." : ""
        }"`
      );

      return responseContent;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logMessage(
        `[OLLAMA] ❌ Error after ${processingTime}ms: ${error.message}`
      );

      // Log detailed error information
      if (error.response) {
        logMessage(`[AI] Response status: ${error.response.status}`);
        logMessage(`[AI] Response data:`, error.response.data);
      }
      if (error.request) {
        logMessage(`[AI] Request failed:`, error.request);
      }

      return "Maaf, terjadi kesalahan saat menghubungi server Ollama. Pastikan server Ollama sedang berjalan.";
    }
  }
}

