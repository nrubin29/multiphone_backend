import Command from "./command";
import { sleep } from "../util";

const videos: { [videoName: string]: { width: number; height: number } } = {
  noahytp: {
    width: 1280,
    height: 720,
  },
};

export default class VideoCommand extends Command {
  async run(args: string[]) {
    if (args.length === 0 || !(args[0] in videos)) {
      console.log("Unknown video");
      return;
    }

    await this.socketManager.emitToAll("video");
    await sleep(1500);

    const video = videos[args[0]];

    // Hardcoding a 2x2 grid
    const gridWidth = 2;
    const gridHeight = 2;

    // Dimensions of landscape iPhone 4(s) in pts
    const phoneWidthPts = 733.5;
    const phoneHeightPts = 376.53;

    const virtualCanvasWidth = phoneWidthPts * gridWidth;
    const virtualCanvasHeight = phoneHeightPts * gridHeight;

    // Scale the video such that the width is equal to virtualCanvasWidth and
    // the height preserves the aspect ratio.
    const scaledVideoHeight = video.height * (virtualCanvasWidth / video.width);

    let i = 0;
    for (let col = 0; col < gridWidth; col++) {
      for (let row = 0; row < gridHeight; row++) {
        const socket = this.socketManager.getSocket(i++);

        // TEMP
        if (!socket) {
          continue;
        }

        socket.send(
          `${args[0]} ${virtualCanvasWidth} ${scaledVideoHeight} ${
            phoneWidthPts * row
          } ${phoneHeightPts * col}`
        );
      }
    }

    await sleep(3000);
    await this.socketManager.emitToAll("play");
  }
}
