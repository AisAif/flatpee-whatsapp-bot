import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

export default class GenAIClient {
  client;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEN_API_KEY);
  }

  async sendPrompt(prompt) {
    try {
      const model = this.client.getGenerativeModel({ model: "gemini-pro" });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.log(error);
      return "maaf, terjadi kesalahan";
    }
  }
}

