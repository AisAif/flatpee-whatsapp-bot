import GenAIClient from "../agents/gen-ai.js";
import OpenAIClient from "../agents/open-ai.js";
import OllamaClient from "../agents/ollama.js";

function getAIAgent(client) {
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

export default getAIAgent;
