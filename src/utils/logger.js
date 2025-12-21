import { LOG_LEVELS } from "../config/constants.js";

const logMessage = (message, level = "INFO") => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;

  const coloredMessage = getColoredMessage(`${prefix} ${message}`, level);
  console.log(coloredMessage);
};

const getColoredMessage = (message, level) => {
  const colors = {
    [LOG_LEVELS.START]: "\x1b[36m",     // Cyan
    [LOG_LEVELS.CONFIG]: "\x1b[35m",    // Magenta
    [LOG_LEVELS.SUCCESS]: "\x1b[32m",   // Green
    [LOG_LEVELS.ERROR]: "\x1b[31m",     // Red
    [LOG_LEVELS.INFO]: "\x1b[34m",      // Blue
    [LOG_LEVELS.MESSAGE]: "\x1b[33m",   // Yellow
    [LOG_LEVELS.QR]: "\x1b[33m",        // Yellow
    [LOG_LEVELS.AI]: "\x1b[35m",        // Magenta
    [LOG_LEVELS.SEND]: "\x1b[36m",      // Cyan
    [LOG_LEVELS.INIT]: "\x1b[34m",      // Blue
    [LOG_LEVELS.SEPARATOR]: "\x1b[90m", // Gray
  };

  const color = colors[level] || "\x1b[0m";
  const reset = "\x1b[0m";

  return `${color}${message}${reset}`;
};

export { logMessage };
export default logMessage;