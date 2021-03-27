import Command from "./command";

export default class OrientationCommand extends Command {
  async run(args: string[]) {
    if (args.length < 1 || !["left", "right", "up"].includes(args[0])) {
      console.log("Usage: orientation <left | right | up>");
      return;
    }

    await this.socketManager.sendAndWait(`orientation ${args[0]}`);
  }
}
