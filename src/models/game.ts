import Player from "./player";

import connection from "../services/connection";
import { EventEnum } from "../utils/enums";

class Game {
  started = false;
  players: Player[];
  observers: Player[];

  constructor() {
    this.players = [];
    this.observers = [];
  }

  start() {
    this.started = true;
  }

  end() {
    this.started = false;

    this.players.forEach((player) => {
      if (player.hp <= 0) {
        return;
      }

      connection.query('UPDATE `user` SET `mmr` = `mmr` + 10 WHERE `id` = ?', [player.id]);
    })

    this.players = [];
    this.observers = [];
  }

  broadcastPacket(type: EventEnum, packet: Object) {
    this.players.forEach((player) => {
      player.socket.emit(type, packet);
    })
  }

  addPlayer(player: Player) {
    const packetNewPlayer = {
      id: player.id,
      username: player.username,
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
      id: player.id,
      hp: player.hp,
      pos: {
        x: player.getX(),
        y: player.getY(),
      },
    }));
    player.socket.emit(EventEnum.INIT_PLAYERS, packetPlayers);
  }

  removePlayer(removePlayerId: number) {
    this.players.forEach((player) => {
      player.socket.emit(EventEnum.PLAYER_LEFT, { id: removePlayerId });
    });

    this.players = this.players.filter(
      (player) => player.id !== removePlayerId
    );
  }

  getPlayerOnPos(x: number, y: number): Player | undefined {
    let selectedPlayer: Player | undefined;

    this.players.forEach((player) => {
      if (player.getX() === x && player.getY() === y) {
        selectedPlayer = player;
      }
    });

    return selectedPlayer;
  }
}

export default Game;
