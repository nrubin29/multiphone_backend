import Command from "./command";
import { sleep } from "../util";

export default class ShrekCommand extends Command {
  async run() {
    this.socketManager.emitToAll("shrek");
    await sleep(1500);

    await this.socketManager.forEachAsync((socket, i) => {
      if (i === 0) {
        socket.send("full");
      } else {
        socket.send("short");
      }
    });

    await sleep(1500);

    await this.socketManager.forEachAsync(async (socket, i) => {
      socket.send("play");

      if (i === 0) {
        await sleep(3100);
      } else {
        await sleep(1500);
      }
    });
  }
}
