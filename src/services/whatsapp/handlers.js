import qrcode from "qrcode-terminal";
import { MESSAGE_RESPONSES, LOG_LEVELS } from "../../config/constants.js";
import logMessage from "../../utils/logger.js";
import {
  isGroupMessage,
  isBotMentioned,
  createSeparator,
  truncateText,
  formatProcessingTime,
} from "../../utils/helpers.js";
import SmartHistory from "../context/smart-history.js";

export class MessageHandler {
  constructor(whatsappClient, aiClient, currentUserId, mongoDB = null) {
    this.whatsappClient = whatsappClient;
    this.aiClient = aiClient;
    this.currentUserId = currentUserId;
    this.mongoDB = mongoDB;
    this.smartHistory = new SmartHistory();
  }

  setupEventListeners() {
    this.setupQRHandler();
    this.setupReadyHandler();
    this.setupAuthHandlers();
    this.setupLoadingHandler();
    this.setupMessageHandler();
  }

  setupQRHandler() {
    this.whatsappClient.on("qr", (qr) => {
      logMessage("QR Code received, please scan with WhatsApp", LOG_LEVELS.QR);
      qrcode.generate(qr, { small: true });
    });
  }

  setupReadyHandler() {
    this.whatsappClient.on("ready", () => {
      logMessage("WhatsApp client is ready and connected!", LOG_LEVELS.SUCCESS);
      logMessage(
        `Client info: ${
          this.whatsappClient.info
            ? this.whatsappClient.info.pushname
            : "Unknown"
        }`,
        LOG_LEVELS.SUCCESS
      );
      logMessage(
        `Phone number: ${
          this.whatsappClient.info
            ? this.whatsappClient.info.wid.user
            : "Unknown"
        }`,
        LOG_LEVELS.SUCCESS
      );
    });
  }

  setupAuthHandlers() {
    this.whatsappClient.on("authenticated", () => {
      logMessage(
        "WhatsApp client authenticated successfully!",
        LOG_LEVELS.SUCCESS
      );
    });

    this.whatsappClient.on("auth_failure", (msg) => {
      logMessage(`Authentication failed: ${msg}`, LOG_LEVELS.ERROR);
    });
  }

  setupLoadingHandler() {
    this.whatsappClient.on("loading_screen", (percent, message) => {
      logMessage(`Loading WhatsApp: ${percent}% - ${message}`, LOG_LEVELS.INFO);
    });
  }

  setupMessageHandler() {
    this.whatsappClient.on("message", async (message) => {
      await this.handleMessage(message);
    });
  }

  async handleMessage(message) {
    this.logMessageDetails(message);

    // Always save user message to history
    if (this.mongoDB && message.body) {
      try {
        const chatInfo = this.smartHistory.getChatInfo(message);
        await this.smartHistory.saveMessage(
          chatInfo.chatId,
          message.body,
          "inbound"
        );
      } catch (error) {
        logMessage(
          `⚠️ Failed to save user message to history: ${error.message}`,
          LOG_LEVELS.WARNING
        );
      }
    }

    // Check if should reply
    const shouldReply = await this.shouldReplyMessage(message);
    if (!shouldReply) {
      logMessage(createSeparator(), LOG_LEVELS.SEPARATOR);
      return;
    }

    let response = null;
    try {
      response = await this.generateResponse(message);
      await this.sendResponse(message, response);
    } catch (error) {
      await this.handleError(message, error);
    }

    // Save AI response if available
    if (this.mongoDB && response) {
      try {
        const chatInfo = this.smartHistory.getChatInfo(message);
        await this.smartHistory.saveMessage(
          chatInfo.chatId,
          response,
          "outbound"
        );
      } catch (error) {
        logMessage(
          `⚠️ Failed to save AI response to history: ${error.message}`,
          LOG_LEVELS.WARNING
        );
      }
    }

    logMessage(createSeparator(), LOG_LEVELS.SEPARATOR);
  }

  logMessageDetails(message) {
    logMessage(`📩 New message received`, LOG_LEVELS.MESSAGE);
    logMessage(`  From: ${message.from}`, LOG_LEVELS.MESSAGE);
    logMessage(`  To: ${message.to}`, LOG_LEVELS.MESSAGE);
    logMessage(`  Body: ${message.body}`, LOG_LEVELS.MESSAGE);
    logMessage(`  Has Media: ${message.hasMedia}`, LOG_LEVELS.MESSAGE);
    logMessage(`  Message ID: ${message.id._serialized}`, LOG_LEVELS.MESSAGE);

    const isGroup = isGroupMessage(message);
    logMessage(
      `  Type: ${isGroup ? "Group Message" : "Private Message"}`,
      LOG_LEVELS.MESSAGE
    );

    if (isGroup) {
      const botMentioned = isBotMentioned(message, this.currentUserId);
      logMessage(`  Bot mentioned: ${botMentioned}`, LOG_LEVELS.MESSAGE);
    }
  }

  async shouldReplyMessage(message) {
    const isGroup = isGroupMessage(message);
    const messageText = message.body?.trim();

    // Always reply to private messages
    if (!isGroup) {
      return true;
    }

    // In groups, check if bot is mentioned
    if (isBotMentioned(message, this.currentUserId)) {
      logMessage(`  ✅ Bot mentioned - will reply`, LOG_LEVELS.MESSAGE);
      return true;
    }

    const quotedMsg = await message.getQuotedMessage();
    if (
      message.fromMe === false &&
      message.hasQuotedMsg === true &&
      quotedMsg.fromMe === true
    ) {
      logMessage(
        `  🤖 Quoted message detected - will reply`,
        LOG_LEVELS.MESSAGE
      );
      return true;
    }

    // In groups, use AI to determine if message is directed at bot
    const isDirectedAtBot = await this.checkIfMessageDirectedAtBotWithAI(
      messageText
    );

    if (isDirectedAtBot) {
      logMessage(
        `  🤖 AI detects message directed at bot - will reply`,
        LOG_LEVELS.MESSAGE
      );
      return true;
    }

    // Skip other group messages
    logMessage(
      `  ⏭️ Skipping group message (AI says not directed at bot)`,
      LOG_LEVELS.MESSAGE
    );

    return false;
  }

  /**
   * Check if message is directed at bot using AI
   */
  async checkIfMessageDirectedAtBotWithAI(messageText) {
    if (!messageText || messageText.length > 500) {
      return false; // Skip if no text or too long
    }

    try {
      const prompt = `Analyze this WhatsApp group message and determine if it's directed at a bot assistant.

Message: "${messageText}"

Return ONLY "YES" or "NO" based on these criteria:
- YES if it mentions bot names (bot, ai, assistant, ${
        process.env.BOT_NAME ?? "flatpee"
      })
- NO if it's clearly a conversation between humans
- NO if it's random chatter, greetings without questions, or general discussion

Respond with only "YES" or "NO":`;

      const response = await this.aiClient.sendPrompt(prompt);
      const answer = response?.trim().toUpperCase();

      logMessage(
        `  🧠 AI analysis: "${messageText}" → ${answer}`,
        LOG_LEVELS.DEBUG
      );

      return answer === "YES";
    } catch (error) {
      logMessage(
        `  ⚠️ AI detection failed: ${error.message}`,
        LOG_LEVELS.WARNING
      );
      // Fallback to simple pattern matching if AI fails
      return this.fallbackPatternCheck(messageText);
    }
  }

  /**
   * Fallback pattern matching if AI detection fails
   */
  fallbackPatternCheck(messageText) {
    const text = messageText.toLowerCase();
    const botNames = [
      process.env.BOT_NAME ?? "flatpee",
      "bot",
      "assistant",
      "ai",
    ];

    return botNames.some((name) => text.includes(name));
  }

  async generateResponse(message) {
    if (message.hasMedia) {
      logMessage(
        `📎 Media message detected, sending preset response`,
        LOG_LEVELS.MESSAGE
      );
      return MESSAGE_RESPONSES.mediaNotSupported;
    }

    // Get message history for AI context
    let context = null;
    if (this.mongoDB) {
      try {
        const chatInfo = this.smartHistory.getChatInfo(message);
        context = await this.smartHistory.getContextForAI(chatInfo.chatId);
        logMessage(
          `📊 Context: ${context.totalMessages} messages`,
          LOG_LEVELS.AI
        );
      } catch (error) {
        logMessage(
          `⚠️ Failed to get context: ${error.message}`,
          LOG_LEVELS.WARNING
        );
      }
    }

    logMessage(
      `🤖 Processing message with AI${context ? " (with context)" : ""}...`,
      LOG_LEVELS.AI
    );

    const startTime = Date.now();

    // Send prompt with context to AI
    const response = await this.aiClient.sendPrompt(message.body, context);
    const processingTime = formatProcessingTime(startTime);

    logMessage(
      `✅ AI Response generated in ${processingTime}ms`,
      LOG_LEVELS.AI
    );
    logMessage(`  Response: ${truncateText(response)}`, LOG_LEVELS.AI);

    return response;
  }

  async sendResponse(message, response) {
    logMessage(`📤 Sending response to ${message.from}`, LOG_LEVELS.SEND);
    // await this.whatsappClient.sendMessage(message.from, response);
    await message.reply(response);
    logMessage(`✅ Response sent successfully`, LOG_LEVELS.SEND);
  }

  async handleError(message, error) {
    logMessage(
      `❌ Error processing message: ${error.message}`,
      LOG_LEVELS.ERROR
    );
    logMessage(`  Stack: ${error.stack}`, LOG_LEVELS.ERROR);

    try {
      await this.whatsappClient.sendMessage(
        message.from,
        MESSAGE_RESPONSES.errorMessage
      );
      logMessage(`📤 Error message sent to user`, LOG_LEVELS.SEND);
    } catch (sendError) {
      logMessage(
        `❌ Failed to send error message: ${sendError.message}`,
        LOG_LEVELS.ERROR
      );
    }
  }

  initialize() {
    logMessage("🚀 Initializing WhatsApp client...", LOG_LEVELS.INIT);
    this.whatsappClient.initialize();
  }
}
