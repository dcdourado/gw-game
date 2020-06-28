import express from "express";
import socketServer from "socket.io";
import path from "path";

import Game from "./models/game";
import Player from "./models/player";
import { EventEnum } from "./utils/enums";

const PORT = process.env.PORT || 4000;

const app = express();
const server = app.listen(PORT, () =>
  console.log(`Server is listening on port ${PORT}.`)
);
const io = socketServer(server);
const game = new Game();

// app.use("/", express.static(__dirname + "public"));
app.get("/", (req, res) => {
  const { username, password } = req.body;

  res.sendFile(path.join(__dirname, "../public", "index.html"));
})


io.on(EventEnum.CONNECTION, (socket) => {
  const initialPos: [number, number] = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
  const player = new Player(socket, game, initialPos);
  game.addPlayer(player);

  socket.on(EventEnum.DISCONNECT, () => {
    game.removePlayer(player);
  });
});
