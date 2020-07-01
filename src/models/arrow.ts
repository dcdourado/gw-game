import { nanoid } from "nanoid";

import Game from "./game";
import Player from "./player";
import GameObject from "./gameObject";

import { EventEnum, DirectionEnum } from "../utils/enums";

class Arrow extends GameObject {
  private id = nanoid();
  private direction: DirectionEnum;
  private interval: NodeJS.Timeout;
  private readonly DAMAGE = 20;
  private readonly MOVE_SPEED = 100;

  constructor(game: Game, pos: [number, number], direction: DirectionEnum) {
    super(game, pos);

    this.direction = direction;
    this.interval = setInterval(() => {
      this.tick();
    }, this.MOVE_SPEED);
  }

  private packetSend(key: string, value?: Object) {
    this.game.broadcastPacket(EventEnum.ARROW, {
      key,
      data: {
        value,
        id: this.id,
      }
    });
  }

  private tick() {
    if (!this.move()) {
      this.deleteArrow();
      return;
    }
    this.packetSend(EventEnum.ARROW_MOVE, { x: this.getX(), y: this.getY() });

    const playerHit = this.game.getPlayerOnPos(this.getX(), this.getY());

    if (playerHit) {
      this.hitPlayer(playerHit);
      this.deleteArrow();
    }
  }

  private move() {
    switch (this.direction) {
      case DirectionEnum.UP:
        return this.setPos(this.getX(), this.getY() + 1);
      case DirectionEnum.RIGHT:
        return this.setPos(this.getX() + 1, this.getY());
      case DirectionEnum.DOWN:
        return this.setPos(this.getX(), this.getY() - 1);
      case DirectionEnum.LEFT:
        return this.setPos(this.getX() - 1, this.getY());
    }
  }

  private hitPlayer(player: Player) {
    player.hp -= this.DAMAGE;
    this.packetSend(EventEnum.ARROW_HIT, {
      target: player.id,
      hp: player.hp,
    });
  }

  private deleteArrow() {
    clearInterval(this.interval);
    this.packetSend(EventEnum.ARROW_DELETE);
  }
}

export default Arrow;