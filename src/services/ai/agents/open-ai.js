import OpenAI from "openai";
import {
  getSystemInstructions,
  loadKnowledgeBase,
  logMessage,
} from "../../../utils/index.js";
import { LOG_LEVELS } from "../../../config/constants.js";

export default class OpenAIClient {
  client;
  knowledgeBase = new Map();

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL;
    if (!apiKey) {
      logMessage(
        `[OPENAI] ⚠️ OPENAI_API_KEY not found in environment variables`
      );
    } else {
      logMessage(`[AI] ✅ API Key found`);
    }

    this.client = new OpenAI({
      baseURL: baseUrl ?? undefined,
      apiKey: apiKey,
    });

    // Load knowledge base
    loadKnowledgeBase();
  }

  async sendPrompt(prompt, context = null) {
    const startTime = Date.now();

    logMessage(
      `[OPENAI] 🚀 Sending prompt to ${
        process.env.OPENAI_MODEL || "gpt-3.5-turbo"
      } ${context ? "(with context)" : ""}`
    );
    logMessage(
      `[OPENAI] Input: "${prompt.substring(0, 100)}${
        prompt.length > 100 ? "..." : ""
      }"`
    );

    if (context) {
      logMessage(
        `[OPENAI] Context: ${context.totalMessages} messages`,
        LOG_LEVELS.INFO
      );
    }

    try {
      // Build messages array with context
      const messages = [
        {
          role: "system",
          content: getSystemInstructions(),
        },
      ];

      // Add conversation context if available
      if (context && context.recentMessages.length > 0) {
        // Add recent conversation history
        context.recentMessages.forEach((msg) => {
          messages.push({
            role: msg.direction === "inbound" ? "user" : "assistant",
            content: msg.text,
          });
        });
      }

      // Add current user message
      messages.push({
        role: "user",
        content: prompt,
      });

      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: messages,
      });

      const processingTime = Date.now() - startTime;
      const responseContent = response.choices[0].message.content;

      logMessage(`[AI] ✅ Response received in ${processingTime}ms`);
      logMessage(
        `[OPENAI] Output: "${responseContent.substring(0, 100)}${
          responseContent.length > 100 ? "..." : ""
        }"`
      );

      return responseContent;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logMessage(
        `[OPENAI] ❌ Error after ${processingTime}ms: ${error.message}`
      );

      // Log detailed error information
      if (error.response) {
        logMessage(`[AI] Response status: ${error.response.status}`);
        logMessage(`[AI] Response data:`, error.response.data);
      }
      if (error.request) {
        logMessage(`[AI] Request failed:`, error.request);
      }

      return "Maaf, terjadi kesalahan saat menghubungi OpenAI. Pastikan API key valid dan koneksi internet stabil.";
    }
  }
}

