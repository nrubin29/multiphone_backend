import SocketManager from "../socket-manager";

export default abstract class Command {
  constructor(protected socketManager: SocketManager) {}

  abstract run(): Promise<void>;
}
