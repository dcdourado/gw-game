import { Socket } from "socket.io";

import { EventEnum, ActionEnum } from "../utils/enums";
import { PlayerPacket } from "../utils/interfaces";

class Player {
  socket: Socket;
  broadcastSockets: Socket[];

  username: string;
  pid: string;
  exhaustMove: number;
  private pos: [number, number];

  constructor(socket: Socket) {
    this.socket = socket;

    this.username = "Lucas8x";
    this.pid = socket.id;
    this.pos = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
    this.exhaustMove = -1;
    this.socketSetup();
  }

  private socketSetup() {
    this.socket.on(EventEnum.PLAYER, (packet: PlayerPacket) => {
      this.packetResolve(packet);
    });
  }

  private packetResolve(packet: PlayerPacket) {
    switch (packet.key) {
      case "move":
        this.move(packet.value);
        break;
      default:
        return;
    }
  }

  private packetSend(key: string, value: Object) {
    this.broadcastSockets.forEach((socket) =>
      socket.emit(EventEnum.PLAYER, {
        key,
        data: {
          pid: this.pid,
          value,
        },
      })
    );
  }

  private move(action: ActionEnum) {
    const timeMs = new Date().getTime();
    if (this.exhaustMove - timeMs > 0) {
      return;
    }
    this.exhaustMove = timeMs + 400;

    switch (action) {
      case ActionEnum.MOVE_UP:
        this.setPos(this.getX(), this.getY() + 1);
        break;
      case ActionEnum.MOVE_RIGHT:
        this.setPos(this.getX() + 1, this.getY());
        break;
      case ActionEnum.MOVE_DOWN:
        this.setPos(this.getX(), this.getY() - 1);
        break;
      case ActionEnum.MOVE_LEFT:
        this.setPos(this.getX() - 1, this.getY());
        break;
    }

    this.packetSend(EventEnum.PLAYER_MOVE, { x: this.getX(), y: this.getY() });
  }

  private setPos(x: number, y: number) {
    let nextX = x;
    let nextY = y;

    if (x < 0 || x > 9) {
      nextX = this.getX();
    }
    if (y < 0 || y > 9) {
      nextY = this.getY();
    }

    this.pos = [nextX, nextY];
  }

  getX() {
    return this.pos[0];
  }

  getY() {
    return this.pos[1];
  }
}

export default Player;
