import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import { useWAClient, useAIClient, run } from "./client-listener.js";
import getClient from "./utils/get-client.js";
import dotenv from "dotenv";
import logMessage from "./utils/log.js";
dotenv.config();

logMessage("🚀 Starting WhatsApp Bot Application", "START");
logMessage(`📱 Using AI Client: ${process.env.CLIENT || "ollama"}`, "CONFIG");
const webVersionUrl = process.env.WEB_VERSION_CACHE_URL || "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2410.1.html";
logMessage(
  `🌐 Web Version Cache URL: ${webVersionUrl}`,
  "CONFIG"
);
logMessage(`📁 Auth Data Path: ./auth-data`, "CONFIG");

useWAClient(
  new Client({
    authStrategy: new LocalAuth({
      dataPath: "./auth-data",
      clientId: "flatpee-bot",
    }),
    webVersionCache: {
      type: "remote",
      remotePath: webVersionUrl,
    },
    restartOnAuthFail: true,
    qrMaxRetries: 3,
    puppeteer: {
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-features=TranslateUI",
        "--disable-extensions",
        "--disable-default-apps",
        "--memory-pressure-off",
      ],
    },
  })
);

const aiClient = getClient(process.env.CLIENT || "ollama");
useAIClient(aiClient);

logMessage("✅ Configuration completed, starting bot...", "SUCCESS");
run();

