import GenAIClient from "./../clients/gen-ai.js";
import OpenAIClient from "./../clients/open-ai.js";
import OllamaClient from "./../clients/ollama.js";

function getClient(client) {
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

export default getClient;
