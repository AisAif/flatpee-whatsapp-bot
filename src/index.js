import { AI_CONFIG, LOG_LEVELS } from "./config/index.js";
import logMessage from "./utils/logger.js";
import { WhatsAppClientManager, MessageHandler } from "./services/whatsapp/index.js";
import AIClientFactory from "./services/ai/index.js";
import mongoDB from "./config/mongodb.js";
import { createIndexes } from "./config/mongodb-indexes.js";

// Initialize application
logMessage("🚀 Starting WhatsApp Bot Application", LOG_LEVELS.START);
logMessage(`📱 Using AI Client: ${AI_CONFIG.defaultClient}`, LOG_LEVELS.CONFIG);

// Initialize MongoDB connection and create indexes
async function initializeApp() {
  try {
    // Connect to MongoDB
    await mongoDB.connect();
    logMessage("✅ MongoDB connected successfully", LOG_LEVELS.SUCCESS);

    // Create database indexes
    await createIndexes();
    logMessage("✅ MongoDB indexes created", LOG_LEVELS.SUCCESS);

    // Create and configure WhatsApp client
    WhatsAppClientManager.createClient();

    // Create and set AI client
    const aiClient = AIClientFactory.create(AI_CONFIG.defaultClient);
    WhatsAppClientManager.setAIClient(aiClient);

    // Setup message handlers with MongoDB instance
    const messageHandler = new MessageHandler(
      WhatsAppClientManager.getClient(),
      WhatsAppClientManager.getAIClient(),
      AI_CONFIG.currentUserId,
      mongoDB // Pass MongoDB instance to handler
    );

    messageHandler.setupEventListeners();

    logMessage("✅ Configuration completed, starting bot...", LOG_LEVELS.SUCCESS);

    // Start the bot
    messageHandler.initialize();

  } catch (error) {
    logMessage(`❌ Failed to initialize application: ${error.message}`, LOG_LEVELS.ERROR);
    process.exit(1);
  }
}

// Start initialization
initializeApp();

