import { Socket } from "socket.io";

import Game from "./game";
import GameObject from "./gameObject";

import { EventEnum, DirectionEnum } from "../utils/enums";
import { PlayerPacket } from "../utils/interfaces";
import Arrow from "./arrow";

class Player extends GameObject {
  socket: Socket;

  hp = 100;
  username: string;
  pid: string;
  private exhaustMove: number;

  private readonly MOVE_SPEED = 400;

  constructor(socket: Socket, game: Game, pos: [number, number]) {
    super(game, pos);

    this.socket = socket;

    this.username = "Lucas8x";
    this.pid = socket.id;
    this.exhaustMove = -1;
    this.socketSetup();
  }

  private socketSetup() {
    this.socket.on(EventEnum.PLAYER, (packet: PlayerPacket) => {
      this.packetResolve(packet);
    });
  }

  private packetResolve(packet: PlayerPacket) {
    console.log("Packet received");
    switch (packet.key) {
      case "move":
        this.move(packet.value);
        break;
      case "shoot":
        this.shoot(packet.value);
      default:
        return;
    }
  }

  private packetSend(key: string, value: Object) {
    this.game.broadcastPacket(EventEnum.PLAYER, {
      key,
      data: {
        value,
        pid: this.pid,
      },
    });
  }

  private move(direction: DirectionEnum) {
    const timeMs = new Date().getTime();
    if (this.exhaustMove - timeMs > 0) {
      return;
    }
    this.exhaustMove = timeMs + this.MOVE_SPEED;

    switch (direction) {
      case DirectionEnum.UP:
        this.setPos(this.getX(), this.getY() + 1);
        break;
      case DirectionEnum.RIGHT:
        this.setPos(this.getX() + 1, this.getY());
        break;
      case DirectionEnum.DOWN:
        this.setPos(this.getX(), this.getY() - 1);
        break;
      case DirectionEnum.LEFT:
        this.setPos(this.getX() - 1, this.getY());
        break;
    }

    this.packetSend(EventEnum.PLAYER_MOVE, { x: this.getX(), y: this.getY() });
  }

  private shoot(direction: DirectionEnum) {
    new Arrow(this.game, [this.getX(), this.getY()], direction);
  }
}

export default Player;
