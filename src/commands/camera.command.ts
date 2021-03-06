import * as fs from "fs";
import Command from "./command";

export default class CameraCommand extends Command {
  async run(args: string[]) {
    if (args.length < 1) {
      console.log("Usage: camera <picture name>");
      return;
    }

    const pictureName = args[0];
    fs.mkdirSync(pictureName);

    await this.socketManager.forEachAsync((socket, i) => {
      socket.packets$.subscribe((packet) => {
        if (packet[0] == "image") {
          const base64 = new Buffer(packet[1], "base64");
          fs.writeFileSync(`${pictureName}/${i}.jpg`, base64);
        }
      });
    });

    await this.socketManager.sendAndWait("camera");
    await this.socketManager.send("capture");
  }
}
