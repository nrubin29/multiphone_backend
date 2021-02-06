import Command from "./command";

const videos: { [videoName: string]: { width: number; height: number } } = {
  noahytp: {
    width: 1280,
    height: 720,
  },
};

// Dimensions of landscape iPhone 4(s) in pts
const PHONE_WIDTH_PTS = 733.5;
const PHONE_HEIGHT_PTS = 376.53;

// Bezels of an iPhone 4(s) in pts
const TOP_BEZEL_PTS = 126.75;
const SIDE_BEZEL_PTS = 28.265;

export default class VideoCommand extends Command {
  async run(args: string[]) {
    if (args.length < 2 || !(args[0] in videos)) {
      console.log("Usage: video <video name> <grid width in # devices>");
      return;
    }

    await this.socketManager.sendAndWait("video");

    const video = videos[args[0]];
    const gridWidth = parseInt(args[1]);

    const virtualCanvasWidth = PHONE_WIDTH_PTS * gridWidth;

    // Scale the video such that the width is equal to virtualCanvasWidth and
    // the height preserves the aspect ratio.
    const scaledVideoHeight = video.height * (virtualCanvasWidth / video.width);

    await this.socketManager.forEachAsync((socket, i) => {
      const row = Math.floor(i / gridWidth);
      const col = i % gridWidth;

      const screenTopLeftX = PHONE_WIDTH_PTS * row + TOP_BEZEL_PTS;
      const screenTopLeftY = PHONE_HEIGHT_PTS * col + SIDE_BEZEL_PTS;

      socket.send(
        [
          args[0],
          virtualCanvasWidth,
          scaledVideoHeight,
          screenTopLeftX,
          screenTopLeftY,
        ].join(" ")
      );
    });

    await this.socketManager.allReady();
    await this.socketManager.send("play");
  }
}
