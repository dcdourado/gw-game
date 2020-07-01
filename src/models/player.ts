import { Socket } from "socket.io";

import Game from "./game";
import GameObject from "./gameObject";
import Arrow from "./arrow";

import { EventEnum, DirectionEnum } from "../utils/enums";
import { PlayerPacket } from "../utils/interfaces";

class Player extends GameObject {
  socket: Socket;

  id: number;
  username: string;
  hp = 100;
  private exhaustMove: number;

  private readonly MOVE_SPEED = 400;

  constructor(pos: [number, number], game: Game, socket: Socket) {
    super(game, pos);

    this.socket = socket;

    this.exhaustMove = -1;
    this.socketSetup();
  }

  init(id: number, username: string) {
    this.id = id;
    this.username = username;
    this.game.addPlayer(this);
  }

  private socketSetup() {
    this.socket.on(EventEnum.PLAYER, (packet: PlayerPacket) => {
      if (this.game.started && this.hp > 0) {
        this.packetResolve(packet);
      }
    });
  }

  private packetResolve(packet: PlayerPacket) {
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
        id: this.id,
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
