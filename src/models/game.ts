import Player from "./player";
import { EventEnum } from "../utils/enums";

class Game {
  players: Player[];

  constructor() {
    this.players = [];
  }

  broadcastPacket(type: EventEnum, packet: Object) {
    this.players.forEach((player) => {
      player.socket.emit(type, packet);
    })
  }

  addPlayer(player: Player) {
    const packetNewPlayer = {
      pid: player.pid,
      hp: player.hp,
      pos: {
        x: player.getX(),
        y: player.getY(),
      },
    };
    this.broadcastPacket(EventEnum.PLAYER_JOINED, packetNewPlayer);

    this.players.push(player);
    
    const packetPlayers = this.players.map((player) => ({
      username: player.username,
      pid: player.pid,
      hp: player.hp,
      pos: {
        x: player.getX(),
        y: player.getY(),
      },
    }));
    player.socket.emit(EventEnum.INIT_PLAYERS, packetPlayers);

    console.log(`Player joined (pid ${player.pid})`);
  }

  removePlayer(removedPlayer: Player) {
    this.players.forEach((player) => {
      player.socket.emit(EventEnum.PLAYER_LEFT, { pid: removedPlayer.pid });
    });

    this.players = this.players.filter(
      (player) => player.pid !== removedPlayer.pid
    );
  }

  getPlayerOnPos(x: number, y: number): Player | undefined {
    let selectedPlayer: Player | undefined;

    this.players.forEach((player) => {
      if (player.getX() === x && player.getY() === y) {
        console.log("Achei um player aqui!!");
        selectedPlayer = player;
      }
    });

    return selectedPlayer;
  }
}

export default Game;
