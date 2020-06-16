import express from "express";
import socketServer from "socket.io";

import Game from "./models/game";
import Player from "./models/player";
import { EventEnum } from "./utils/enums";

const PORT = process.env.PORT || 4000;

const app = express();
const server = app.listen(PORT, () =>
  console.log(`Server is listening on port ${PORT}.`)
);
const io = socketServer(server);

app.use("/", express.static("public"));

const game = new Game();

io.on(EventEnum.CONNECTION, (socket) => {
  const player = new Player(socket);
  game.addPlayer(player);

  socket.on(EventEnum.DISCONNECT, () => {
    game.removePlayer(player);
  });
});
