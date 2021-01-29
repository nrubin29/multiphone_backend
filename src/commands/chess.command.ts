import Command from "./command";
import { sleep } from "../util";

enum Piece {
  KING,
  QUEEN,
  ROOK,
  BISHOP,
  KNIGHT,
  PAWN,
}

enum Color {
  WHITE,
  BLACK,
}

class ChessPiece {
  static EMPTY = new ChessPiece(null, null);

  constructor(public piece: Piece | null, public color: Color | null) {}

  toString(): string {
    if (this.piece === null && this.color === null) {
      return "empty empty";
    }

    return `${this.piece} ${this.color}`;
  }
}

const BOARD_WIDTH = 3;

// const makeChessBoard = () => [
//   [
//     new ChessPiece(Piece.ROOK, Color.BLACK),
//     new ChessPiece(Piece.KNIGHT, Color.BLACK),
//     new ChessPiece(Piece.BISHOP, Color.BLACK),
//     new ChessPiece(Piece.QUEEN, Color.BLACK),
//     new ChessPiece(Piece.KING, Color.BLACK),
//     new ChessPiece(Piece.BISHOP, Color.BLACK),
//     new ChessPiece(Piece.KNIGHT, Color.BLACK),
//     new ChessPiece(Piece.ROOK, Color.BLACK),
//   ],
//   [
//     new ChessPiece(Piece.PAWN, Color.BLACK),
//     new ChessPiece(Piece.PAWN, Color.BLACK),
//     new ChessPiece(Piece.PAWN, Color.BLACK),
//     new ChessPiece(Piece.PAWN, Color.BLACK),
//     new ChessPiece(Piece.PAWN, Color.BLACK),
//     new ChessPiece(Piece.PAWN, Color.BLACK),
//     new ChessPiece(Piece.PAWN, Color.BLACK),
//     new ChessPiece(Piece.PAWN, Color.BLACK),
//   ],
//   [
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//   ],
//   [
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//   ],
//   [
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//   ],
//   [
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//     ChessPiece.EMPTY,
//   ],
//   [
//     new ChessPiece(Piece.PAWN, Color.WHITE),
//     new ChessPiece(Piece.PAWN, Color.WHITE),
//     new ChessPiece(Piece.PAWN, Color.WHITE),
//     new ChessPiece(Piece.PAWN, Color.WHITE),
//     new ChessPiece(Piece.PAWN, Color.WHITE),
//     new ChessPiece(Piece.PAWN, Color.WHITE),
//     new ChessPiece(Piece.PAWN, Color.WHITE),
//     new ChessPiece(Piece.PAWN, Color.WHITE),
//   ],
//   [
//     new ChessPiece(Piece.ROOK, Color.WHITE),
//     new ChessPiece(Piece.KNIGHT, Color.WHITE),
//     new ChessPiece(Piece.BISHOP, Color.WHITE),
//     new ChessPiece(Piece.QUEEN, Color.WHITE),
//     new ChessPiece(Piece.KING, Color.WHITE),
//     new ChessPiece(Piece.BISHOP, Color.WHITE),
//     new ChessPiece(Piece.KNIGHT, Color.WHITE),
//     new ChessPiece(Piece.ROOK, Color.WHITE),
//   ],
// ];

const makeChessBoard = () => [
  [
    new ChessPiece(Piece.PAWN, Color.BLACK),
    ChessPiece.EMPTY,
    new ChessPiece(Piece.QUEEN, Color.BLACK),
  ],
  [ChessPiece.EMPTY, ChessPiece.EMPTY, ChessPiece.EMPTY],
  [
    new ChessPiece(Piece.PAWN, Color.WHITE),
    ChessPiece.EMPTY,
    new ChessPiece(Piece.QUEEN, Color.WHITE),
  ],
];

export default class ChessCommand extends Command {
  async run() {
    this.socketManager.emitToAll("chess");
    await sleep(1500);

    const chessBoard = makeChessBoard();
    let selectedRow = -1;
    let selectedCol = -1;

    await this.socketManager.forEachAsync((socket, i) => {
      const row = Math.floor(i / BOARD_WIDTH);
      const col = i % BOARD_WIDTH;

      socket.packets$.subscribe(() => {
        if (selectedRow === -1 && selectedCol === -1) {
          if (chessBoard[row][col] !== ChessPiece.EMPTY) {
            selectedRow = row;
            selectedCol = col;
          }
        } else {
          if (row === selectedRow && col === selectedCol) {
            selectedRow = -1;
            selectedCol = -1;
            return;
          }

          chessBoard[row][col] = chessBoard[selectedRow][selectedCol];
          this.socketManager.sockets[row * BOARD_WIDTH + col].send(
            chessBoard[row][col].toString()
          );

          chessBoard[selectedRow][selectedCol] = ChessPiece.EMPTY;
          this.socketManager.sockets[
            selectedRow * BOARD_WIDTH + selectedCol
          ].send(chessBoard[selectedRow][selectedCol].toString());

          selectedRow = -1;
          selectedCol = -1;
        }
      });

      const chessPiece = chessBoard[row][col];
      socket.send(`${chessPiece} ${row} ${col}`);
    });
  }
}
