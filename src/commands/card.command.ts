import Command from "./command";
import { sleep } from "../util";
import arrayShuffle from "array-shuffle";

const DECK: string[] = [];

for (const suit of ["C", "D", "H", "S"]) {
  for (const value of [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ]) {
    DECK.push(value + suit);
  }
}

export default class CardCommand extends Command {
  async run() {
    this.socketManager.emitToAll("card");
    await sleep(1500);

    const deck = arrayShuffle([...DECK]);

    await this.socketManager.forEachAsync((socket) => {
      socket.send(deck.shift());
    });
  }
}
