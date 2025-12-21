import { AI_CONFIG, LOG_LEVELS } from "./config/index.js";
import logMessage from "./utils/logger.js";
import { WhatsAppClientManager, MessageHandler } from "./services/whatsapp/index.js";
import AIClientFactory from "./services/ai/index.js";

// Initialize application
logMessage("🚀 Starting WhatsApp Bot Application", LOG_LEVELS.START);
logMessage(`📱 Using AI Client: ${AI_CONFIG.defaultClient}`, LOG_LEVELS.CONFIG);

// Create and configure WhatsApp client
WhatsAppClientManager.createClient();

// Create and set AI client
const aiClient = AIClientFactory.create(AI_CONFIG.defaultClient);
WhatsAppClientManager.setAIClient(aiClient);

// Setup message handlers
const messageHandler = new MessageHandler(
  WhatsAppClientManager.getClient(),
  WhatsAppClientManager.getAIClient(),
  AI_CONFIG.currentUserId
);

messageHandler.setupEventListeners();

logMessage("✅ Configuration completed, starting bot...", LOG_LEVELS.SUCCESS);

// Start the bot
messageHandler.initialize();

