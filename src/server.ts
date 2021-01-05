import * as WebSocket from "ws";
import SocketManager from "./socket-manager";
import ShrekCommand from "./commands/shrek.command";
import Command from "./commands/command";

const socketManager = new SocketManager();

const commands: { [cmd: string]: () => Command } = {
  shrek: () => new ShrekCommand(socketManager),
};

process.stdin.on("data", async (buffer) => {
  const cmd = buffer.toString().trim();

  if (cmd in commands) {
    await commands[cmd]().run();
  } else {
    socketManager.emitToAll(cmd);
  }
});

const wss = new WebSocket.Server({
  port: 8080,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024, // Size (in bytes) below which messages
    // should not be compressed.
  },
});

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    const message = data as string;

    if (message.startsWith("phoneId")) {
      const phoneId = parseInt(message.split(" ")[1]);
      socketManager.addSocket(phoneId, ws);
    }
  });
});

console.log("Server ready!");