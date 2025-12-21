export const WHATSAPP_CONFIG = {
  webVersionUrl: process.env.WEB_VERSION_CACHE_URL || "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2410.1.html",
  authDataPath: "./auth-data",
  clientId: "flatpee-bot",
  qrMaxRetries: 3,
  restartOnAuthFail: true,
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
};

export const AI_CONFIG = {
  defaultClient: process.env.CLIENT || "ollama",
  currentUserId: process.env.CURRENT_USER_ID,
};

export const MESSAGE_RESPONSES = {
  mediaNotSupported: "Bot ini tidak support media. Silakan kirim pesan teks saja.",
  errorMessage: "Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi nanti.",
};

export const LOG_LEVELS = {
  START: "START",
  CONFIG: "CONFIG",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
  INFO: "INFO",
  MESSAGE: "MESSAGE",
  QR: "QR",
  AI: "AI",
  SEND: "SEND",
  INIT: "INIT",
  SEPARATOR: "SEPARATOR",
};