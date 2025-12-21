import qrcode from "qrcode-terminal";
import { MESSAGE_RESPONSES, LOG_LEVELS } from "../../config/constants.js";
import logMessage from "../../utils/logger.js";
import {
  isGroupMessage,
  isBotMentioned,
  createSeparator,
  truncateText,
  formatProcessingTime
} from "../../utils/helpers.js";

export class MessageHandler {
  constructor(whatsappClient, aiClient, currentUserId) {
    this.whatsappClient = whatsappClient;
    this.aiClient = aiClient;
    this.currentUserId = currentUserId;
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
        `Client info: ${this.whatsappClient.info ? this.whatsappClient.info.pushname : "Unknown"}`,
        LOG_LEVELS.SUCCESS
      );
      logMessage(
        `Phone number: ${this.whatsappClient.info ? this.whatsappClient.info.wid.user : "Unknown"}`,
        LOG_LEVELS.SUCCESS
      );
    });
  }

  setupAuthHandlers() {
    this.whatsappClient.on("authenticated", () => {
      logMessage("WhatsApp client authenticated successfully!", LOG_LEVELS.SUCCESS);
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

    if (!this.shouldProcessMessage(message)) {
      return;
    }

    try {
      const response = await this.generateResponse(message);
      await this.sendResponse(message, response);
    } catch (error) {
      await this.handleError(message, error);
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
    logMessage(`  Type: ${isGroup ? "Group Message" : "Private Message"}`, LOG_LEVELS.MESSAGE);

    if (isGroup) {
      const botMentioned = isBotMentioned(message, this.currentUserId);
      logMessage(`  Bot mentioned: ${botMentioned}`, LOG_LEVELS.MESSAGE);
    }
  }

  shouldProcessMessage(message) {
    const isGroup = isGroupMessage(message);

    if (isGroup && !isBotMentioned(message, this.currentUserId)) {
      logMessage(`  ⏭️ Skipping group message (bot not mentioned)`, LOG_LEVELS.MESSAGE);
      logMessage(createSeparator(), LOG_LEVELS.SEPARATOR);
      return false;
    }

    return true;
  }

  async generateResponse(message) {
    if (message.hasMedia) {
      logMessage(`📎 Media message detected, sending preset response`, LOG_LEVELS.MESSAGE);
      return MESSAGE_RESPONSES.mediaNotSupported;
    }

    logMessage(`🤖 Processing message with AI...`, LOG_LEVELS.AI);

    const startTime = Date.now();
    const response = await this.aiClient.sendPrompt(message.body);
    const processingTime = formatProcessingTime(startTime);

    logMessage(`✅ AI Response generated in ${processingTime}ms`, LOG_LEVELS.AI);
    logMessage(`  Response: ${truncateText(response)}`, LOG_LEVELS.AI);

    return response;
  }

  async sendResponse(message, response) {
    logMessage(`📤 Sending response to ${message.from}`, LOG_LEVELS.SEND);
    await this.whatsappClient.sendMessage(message.from, response);
    logMessage(`✅ Response sent successfully`, LOG_LEVELS.SEND);
  }

  async handleError(message, error) {
    logMessage(`❌ Error processing message: ${error.message}`, LOG_LEVELS.ERROR);
    logMessage(`  Stack: ${error.stack}`, LOG_LEVELS.ERROR);

    try {
      await this.whatsappClient.sendMessage(message.from, MESSAGE_RESPONSES.errorMessage);
      logMessage(`📤 Error message sent to user`, LOG_LEVELS.SEND);
    } catch (sendError) {
      logMessage(`❌ Failed to send error message: ${sendError.message}`, LOG_LEVELS.ERROR);
    }
  }

  initialize() {
    logMessage("🚀 Initializing WhatsApp client...", LOG_LEVELS.INIT);
    this.whatsappClient.initialize();
  }
}