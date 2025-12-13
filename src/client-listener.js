import qrcode from "qrcode-terminal";
import logMessage from "./utils/log.js";
let WAClient;
let AIClient;

export function useWAClient(client) {
  WAClient = client;
}

export function useAIClient(client) {
  AIClient = client;
}

export function run() {
  WAClient.on("qr", (qr) => {
    logMessage("QR Code received, please scan with WhatsApp", "QR");
    qrcode.generate(qr, { small: true });
  });

  WAClient.on("ready", () => {
    logMessage("WhatsApp client is ready and connected!", "SUCCESS");
    logMessage(`Client info: ${WAClient.info ? WAClient.info.pushname : 'Unknown'}`, "SUCCESS");
    logMessage(`Phone number: ${WAClient.info ? WAClient.info.wid.user : 'Unknown'}`, "SUCCESS");
  });

  WAClient.on("authenticated", () => {
    logMessage("WhatsApp client authenticated successfully!", "SUCCESS");
  });

  WAClient.on("auth_failure", (msg) => {
    logMessage(`Authentication failed: ${msg}`, "ERROR");
  });

  WAClient.on("loading_screen", (percent, message) => {
    logMessage(`Loading WhatsApp: ${percent}% - ${message}`, "INFO");
  });

  WAClient.on("message", async (message) => {
    // Log message details
    logMessage(`📩 New message received`, "MESSAGE");
    logMessage(`  From: ${message.from}`, "MESSAGE");
    logMessage(`  To: ${message.to}`, "MESSAGE");
    logMessage(`  Body: ${message.body}`, "MESSAGE");
    logMessage(`  Has Media: ${message.hasMedia}`, "MESSAGE");
    logMessage(`  Message ID: ${message.id._serialized}`, "MESSAGE");

    // Check if it's a group message
    if (message.from.includes("@g.us")) {
      logMessage(`  Type: Group Message`, "MESSAGE");
    } else {
      logMessage(`  Type: Private Message`, "MESSAGE");
    }

    try {
      let response;

      if (!message.hasMedia) {
        logMessage(`🤖 Processing message with AI...`, "AI");

        const startTime = Date.now();
        response = await AIClient.sendPrompt(message.body);
        const processingTime = Date.now() - startTime;

        logMessage(`✅ AI Response generated in ${processingTime}ms`, "AI");
        logMessage(
          `  Response: ${response.substring(0, 100)}${
            response.length > 100 ? "..." : ""
          }`,
          "AI"
        );
      } else {
        logMessage(
          `📎 Media message detected, sending preset response`,
          "MESSAGE"
        );
        response =
          "Bot ini tidak support media. Silakan kirim pesan teks saja.";
      }

      // Send response
      logMessage(`📤 Sending response to ${message.from}`, "SEND");
      await WAClient.sendMessage(message.from, response);
      logMessage(`✅ Response sent successfully`, "SEND");
    } catch (error) {
      logMessage(`❌ Error processing message: ${error.message}`, "ERROR");
      logMessage(`  Stack: ${error.stack}`, "ERROR");

      try {
        const errorMessage =
          "Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi nanti.";
        await WAClient.sendMessage(message.from, errorMessage);
        logMessage(`📤 Error message sent to user`, "SEND");
      } catch (sendError) {
        logMessage(
          `❌ Failed to send error message: ${sendError.message}`,
          "ERROR"
        );
      }
    }

    logMessage(`─`.repeat(80), "SEPARATOR");
  });

  logMessage("🚀 Initializing WhatsApp client...", "INIT");
  WAClient.initialize();
}

