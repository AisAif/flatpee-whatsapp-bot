import dotenv from "dotenv";
dotenv.config();

export { WHATSAPP_CONFIG, AI_CONFIG, MESSAGE_RESPONSES, LOG_LEVELS } from "./constants.js";

export const getAppConfig = () => ({
  aiClient: process.env.CLIENT || "ollama",
  webVersionUrl: process.env.WEB_VERSION_CACHE_URL || "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2410.1.html",
  authDataPath: "./auth-data",
  currentUserId: process.env.CURRENT_USER_ID,
});

export default getAppConfig;