import OpenAI from "openai";
import dotenv from "dotenv";
import {
  getSystemInstructions,
  loadKnowledgeBase,
} from "../utils/system-context.js";
dotenv.config();

export default class OpenAIClient {
  client;
  knowledgeBase = new Map();

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL;
    if (!apiKey) {
      console.log(
        `[OPENAI] ⚠️ OPENAI_API_KEY not found in environment variables`
      );
    } else {
      console.log(`[OPENAI] ✅ API Key found`);
    }

    this.client = new OpenAI({
      baseURL: baseUrl ?? undefined,
      apiKey: apiKey,
    });

    // Load knowledge base
    loadKnowledgeBase();
  }

  async sendPrompt(prompt) {
    const startTime = Date.now();

    console.log(
      `[OPENAI] 🚀 Sending prompt to ${
        process.env.OPENAI_MODEL || "gpt-3.5-turbo"
      }`
    );
    console.log(
      `[OPENAI] Input: "${prompt.substring(0, 100)}${
        prompt.length > 100 ? "..." : ""
      }"`
    );

    try {
      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
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
      const responseContent = response.choices[0].message.content;

      console.log(`[OPENAI] ✅ Response received in ${processingTime}ms`);
      console.log(
        `[OPENAI] Output: "${responseContent.substring(0, 100)}${
          responseContent.length > 100 ? "..." : ""
        }"`
      );

      return responseContent;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.log(
        `[OPENAI] ❌ Error after ${processingTime}ms: ${error.message}`
      );

      // Log detailed error information
      if (error.response) {
        console.log(`[OPENAI] Response status: ${error.response.status}`);
        console.log(`[OPENAI] Response data:`, error.response.data);
      }
      if (error.request) {
        console.log(`[OPENAI] Request failed:`, error.request);
      }

      return "Maaf, terjadi kesalahan saat menghubungi OpenAI. Pastikan API key valid dan koneksi internet stabil.";
    }
  }
}

