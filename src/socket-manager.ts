import WebSocket, { MessageEvent } from "ws";
import { fromEvent } from "rxjs";
import { map } from "rxjs/operators";

class Socket {
  packets$ = fromEvent<MessageEvent>(this.socket, "message").pipe(
    map((packet) => (packet.data as string).split(" "))
  );

  constructor(public id: number, private socket: WebSocket) {}

  send(data: any): void {
    this.socket.send(data);
  }
}

export default class SocketManager {
  sockets: Socket[] = [];

  addSocket(id: number, socket: WebSocket) {
    socket.on("close", () => {
      this.sockets = this.sockets.filter((socket) => socket.id !== id);
      console.log(`Device ${id} disconnected.`);
    });

    this.sockets.push(new Socket(id, socket));
    socket.send("connected");
    console.log(`Device ${id} connected.`);
  }

  emitToAll(text: string) {
    for (const socket of this.sockets) {
      socket.send(text);
    }
  }

  async forEachAsync(
    fn: (socket: Socket, i: number) => Promise<any> | void
  ): Promise<void> {
    let i = 0;
    for (const socket of this.sockets) {
      await fn(socket, i++);
    }
  }
}
