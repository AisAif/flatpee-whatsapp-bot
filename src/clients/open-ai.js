import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

export default class OpenAIClient {
  client;
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async sendPrompt(prompt) {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.log(error);
      return "maaf, terjadi kesalahan";
    }
  }
}

