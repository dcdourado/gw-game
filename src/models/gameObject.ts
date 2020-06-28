import Game from "./game";

abstract class GameObject {
  protected game: Game;
  private pos: [number, number];

  constructor(game: Game, pos: [number, number]) {
		this.game = game;
    this.pos = pos;
  }

  getX() {
    return this.pos[0];
  }

  getY() {
    return this.pos[1];
  }

  setPos(x: number, y: number) {
    let nextX = x;
    let nextY = y;

    if (x < 0 || x > 9) {
      nextX = this.getX();
      return false;
    }
    if (y < 0 || y > 9) {
      nextY = this.getY();
      return false;
    }

    this.pos = [nextX, nextY];
    return true;
  }
}

export default GameObject;
