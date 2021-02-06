import Command from "./command";

export default class CameraCommand extends Command {
  async run() {
    await this.socketManager.sendAndWait("camera");
    await this.socketManager.send("capture");
  }
}
