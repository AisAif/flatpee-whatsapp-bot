import logMessage from "./logger.js";
import {
  isGroupMessage,
  isBotMentioned,
  createSeparator,
  truncateText,
  formatProcessingTime
} from "./helpers.js";
import {
  getSystemInstructions,
  loadKnowledgeBase,
} from "./system-context.js";

export {
  logMessage,
  isGroupMessage,
  isBotMentioned,
  createSeparator,
  truncateText,
  formatProcessingTime,
  getSystemInstructions,
  loadKnowledgeBase
};

export default {
  logMessage,
  isGroupMessage,
  isBotMentioned,
  createSeparator,
  truncateText,
  formatProcessingTime,
  getSystemInstructions,
  loadKnowledgeBase
};