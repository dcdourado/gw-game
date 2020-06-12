import Player from "./player";
import { EventEnum } from "../utils/enums";

class Game {
  players: Player[];

  constructor() {
    this.players = [];
  }

  addPlayer(player: Player) {
    const packetNewPlayer = {
      pid: player.pid,
      pos: {
        x: player.getX(),
        y: player.getY(),
      },
    };
    this.players.forEach((existentPlayer) => {
      existentPlayer.socket.emit(EventEnum.PLAYER_JOINED, packetNewPlayer);
      existentPlayer.broadcastSockets.push(player.socket);
    });

    this.players.push(player);
    const packetPlayers = this.players.map((player) => ({
      username: player.username,
      pid: player.pid,
      pos: {
        x: player.getX(),
        y: player.getY(),
      },
    }));
    player.socket.emit(EventEnum.INIT_PLAYERS, packetPlayers);

    player.broadcastSockets = this.players.map((player) => player.socket);
    console.log(`Player joined (pid ${player.pid})`);
  }

  removePlayer(removedPlayer: Player) {
    this.players.forEach((player) => {
      player.broadcastSockets = player.broadcastSockets.filter(
        (playersSocket) => playersSocket.id !== removedPlayer.pid
      );
      player.socket.emit(EventEnum.PLAYER_LEFT, { pid: removedPlayer.pid });
    });
    this.players = this.players.filter(
      (player) => player.pid !== removedPlayer.pid
    );
  }
}

export default Game;
