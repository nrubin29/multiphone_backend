import WebSocket from "ws";

export default class SocketManager {
  private sockets = new Map<number, WebSocket>();

  addSocket(id: number, socket: WebSocket) {
    socket.on("close", () => {
      this.sockets.delete(id);
      console.log(`Device ${id} disconnected.`);
    });

    this.sockets.set(id, socket);
    socket.send("connected");
    console.log(`Device ${id} connected.`);
  }

  getSocket(index: number) {
    return Array.from(this.sockets.values())[index];
  }

  emitToAll(text: string) {
    for (const socket of this.sockets.values()) {
      socket.send(text);
    }
  }

  async forEachAsync(
    fn: (socket: WebSocket, i: number) => Promise<any> | void
  ): Promise<void> {
    let i = 0;
    for (const socket of this.sockets.values()) {
      await fn(socket, i++);
    }
  }
}
