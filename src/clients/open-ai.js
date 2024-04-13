const { default: OpenAI } = require("openai");
require("dotenv").config();

class OpenAI {
  client;
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async sendPrompt(prompt) {
    try {
      response = await this.client.chat.completions.create({
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

module.exports = OpenAI;
