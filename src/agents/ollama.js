import { Ollama } from "ollama";
import dotenv from "dotenv";
import {
  getSystemInstructions,
  loadKnowledgeBase,
} from "../utils/system-context.js";
dotenv.config();

export default class OllamaClient {
  client;
  knowledgeBase = new Map();

  constructor() {
    const host = process.env.OLLAMA_HOST || "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL || "tinyllama";
    const hasApiKey = process.env.OLLAMA_API_KEY ? "Yes" : "No";

    console.log(`[OLLAMA] Initializing client...`);
    console.log(`[OLLAMA] Host: ${host}`);
    console.log(`[OLLAMA] Model: ${model}`);
    console.log(`[OLLAMA] API Key: ${hasApiKey}`);

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

    console.log(`[OLLAMA] 🚀 Sending prompt to ${model}`);
    console.log(
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

      console.log(`[OLLAMA] ✅ Response received in ${processingTime}ms`);
      console.log(
        `[OLLAMA] Output: "${responseContent.substring(0, 100)}${
          responseContent.length > 100 ? "..." : ""
        }"`
      );

      return responseContent;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.log(
        `[OLLAMA] ❌ Error after ${processingTime}ms: ${error.message}`
      );

      // Log detailed error information
      if (error.response) {
        console.log(`[OLLAMA] Response status: ${error.response.status}`);
        console.log(`[OLLAMA] Response data:`, error.response.data);
      }
      if (error.request) {
        console.log(`[OLLAMA] Request failed:`, error.request);
      }

      return "Maaf, terjadi kesalahan saat menghubungi server Ollama. Pastikan server Ollama sedang berjalan.";
    }
  }
}

