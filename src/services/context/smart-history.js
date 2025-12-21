import mongoDB from "../../config/mongodb.js";
import logMessage from "../../utils/logger.js";
import { LOG_LEVELS } from "../../config/constants.js";

export class SmartHistory {
  constructor() {
    this.db = null;
    this.collectionName = "chat_history";
  }

  async initialize() {
    if (!this.db) {
      this.db = mongoDB.getDatabase();
    }
  }

  getChatInfo(message) {
    const chatId = message.from;
    const isGroup = chatId.includes("@g.us");
    return { chatId, isGroup };
  }

  /**
   * Save message to database
   */
  async saveMessage(chatId, text, direction) {
    await this.initialize();

    try {
      const message = {
        chatId,
        text: text.trim(),
        direction, // 'inbound' or 'outbound'
        timestamp: new Date(),
      };

      await this.db.collection(this.collectionName).insertOne(message);
    } catch (error) {
      logMessage(
        `❌ Failed to save message: ${error.message}`,
        LOG_LEVELS.ERROR
      );
    }
  }

  /**
   * Get recent messages for AI context
   */
  async getContextForAI(chatId, maxMessages = 10) {
    await this.initialize();

    try {
      const messages = await this.db
        .collection(this.collectionName)
        .find({ chatId })
        .sort({ timestamp: -1 })
        .limit(maxMessages)
        .toArray();

      // Reverse to show oldest first for conversation flow
      const recentMessages = messages.reverse().map((msg) => ({
        text: msg.text,
        direction: msg.direction,
        timestamp: msg.timestamp,
      }));

      return {
        recentMessages,
        totalMessages: recentMessages.length,
      };
    } catch (error) {
      logMessage(
        `❌ Failed to get context: ${error.message}`,
        LOG_LEVELS.ERROR
      );
      return {
        recentMessages: [],
        totalMessages: 0,
      };
    }
  }
}

export default SmartHistory;
