import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import { WHATSAPP_CONFIG } from "../../config/constants.js";
import logMessage from "../../utils/logger.js";

class WhatsAppClientManager {
  constructor() {
    this.client = null;
    this.aiClient = null;
  }

  createClient() {
    if (this.client) {
      logMessage("WhatsApp client already exists", "INFO");
      return this.client;
    }

    logMessage("🚀 Creating WhatsApp client...", "INIT");

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: WHATSAPP_CONFIG.authDataPath,
        clientId: WHATSAPP_CONFIG.clientId,
      }),
      webVersionCache: {
        type: "remote",
        remotePath: WHATSAPP_CONFIG.webVersionUrl,
      },
      restartOnAuthFail: WHATSAPP_CONFIG.restartOnAuthFail,
      qrMaxRetries: WHATSAPP_CONFIG.qrMaxRetries,
      puppeteer: WHATSAPP_CONFIG.puppeteer,
    });

    logMessage("✅ WhatsApp client created successfully", "SUCCESS");
    return this.client;
  }

  setAIClient(aiClient) {
    this.aiClient = aiClient;
    logMessage("🤖 AI client set successfully", "SUCCESS");
  }

  getClient() {
    return this.client;
  }

  getAIClient() {
    return this.aiClient;
  }
}

export default new WhatsAppClientManager();