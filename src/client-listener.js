const qrcode = require("qrcode-terminal");
let WAClient;
let AIClient;

function useWAClient(client) {
  WAClient = client;
}

function useAIClient(client) {
  AIClient = client;
}

function run() {
  WAClient.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  WAClient.on("ready", () => {
    console.log("Client is ready!");
  });

  WAClient.on("message", async (message) => {
      let response;
    if (!message.hasMedia) {
      response = await AIClient.sendPrompt(message.body);
    } else {
      response = "Bot ini tidak support media";
    }

    WAClient.sendMessage(message.from, response);
  });

  WAClient.initialize();
}

module.exports = { useWAClient, useAIClient, run };
