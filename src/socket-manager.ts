import WebSocket, { MessageEvent } from "ws";
import { fromEvent } from "rxjs";
import { filter, map, mapTo, take } from "rxjs/operators";

class Socket {
  packets$ = fromEvent<MessageEvent>(this.socket, "message").pipe(
    map((packet) => (packet.data as string).split(" "))
  );

  constructor(public id: number, private socket: WebSocket) {}

  send(data: any): void {
    this.socket.send(data);
  }

  ready(): Promise<void> {
    return this.packets$
      .pipe(
        filter((packet) => packet.length === 1 && packet[0] === "ready"),
        take(1),
        mapTo(undefined)
      )
      .toPromise();
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

  send(data: string) {
    for (const socket of this.sockets) {
      socket.send(data);
    }
  }

  async sendAndWait(data: string) {
    this.send(data);
    await this.allReady();
  }

  async forEachAsync(
    fn: (socket: Socket, i: number) => Promise<any> | void
  ): Promise<void> {
    let i = 0;
    for (const socket of this.sockets) {
      await fn(socket, i++);
    }
  }

  allReady(): Promise<void[]> {
    return (Promise as any).allSettled(
      this.sockets.map((socket) => socket.ready())
    );
  }
}
