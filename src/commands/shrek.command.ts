import Command from "./command";

export default class ShrekCommand extends Command {
  async run() {
    await this.socketManager.sendAndWait("shrek");

    await this.socketManager.forEachAsync((socket, i) => {
      if (i === 0) {
        socket.send("full");
      } else {
        socket.send("short");
      }
    });

    await this.socketManager.allReady();

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

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
