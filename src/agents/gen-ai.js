import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import {
  getSystemInstructions,
  loadKnowledgeBase,
} from "../utils/system-context.js";
dotenv.config();

export default class GenAIClient {
  client;

  constructor() {
    const apiKey = process.env.GEN_API_KEY;
    if (!apiKey) {
      console.log(`[GENAI] ⚠️ GEN_API_KEY not found in environment variables`);
    } else {
      console.log(`[GENAI] ✅ API Key found`);
    }

    this.client = new GoogleGenerativeAI(apiKey);

    // Load knowledge base
    loadKnowledgeBase();
  }

  async sendPrompt(prompt) {
    const startTime = Date.now();

    console.log(`[GENAI] 🚀 Sending prompt to Gemini Pro`);
    console.log(
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

      console.log(`[GENAI] ✅ Response received in ${processingTime}ms`);
      console.log(
        `[GENAI] Output: "${responseContent.substring(0, 100)}${
          responseContent.length > 100 ? "..." : ""
        }"`
      );

      return responseContent;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.log(
        `[GENAI] ❌ Error after ${processingTime}ms: ${error.message}`
      );

      // Log detailed error information
      if (error.status) {
        console.log(`[GENAI] Status: ${error.status}`);
      }
      if (error.response) {
        console.log(`[GENAI] Response:`, error.response);
      }

      return "Maaf, terjadi kesalahan saat menghubungi Google Gemini. Pastikan API key valid dan koneksi internet stabil.";
    }
  }
}

