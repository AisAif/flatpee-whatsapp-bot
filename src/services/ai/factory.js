import GenAIClient from "./agents/gen-ai.js";
import OpenAIClient from "./agents/open-ai.js";
import OllamaClient from "./agents/ollama.js";

class AIClientFactory {
  static create(client) {
    switch (client) {
      case "open-ai":
        return new OpenAIClient();
      case "gen-ai":
        return new GenAIClient();
      case "ollama":
        return new OllamaClient();
      default:
        return new OllamaClient();
    }
  }
}

export default AIClientFactory;