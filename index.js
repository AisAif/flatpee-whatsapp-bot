const { Client, LocalAuth } = require("whatsapp-web.js");
const listener = require("./src/client-listener");
const GenAI = require("./src/clients/gen-ai");
require('dotenv').config()

listener.useWAClient(
  new Client({
    authStrategy: new LocalAuth({
      dataPath: "./auth-data",
    }),
    webVersionCache: {
      type: "remote",
      remotePath: process.env.WEB_VERSION_CACHE_URL,
    },
  })
);
listener.useAIClient(new GenAI());
listener.run();
