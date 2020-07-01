import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import socketServer from "socket.io";
import path from "path";
import dotenv from "dotenv";

import Game from "./models/game";
import Player from "./models/player";

import connection from "./services/connection";
import { EventEnum } from "./utils/enums";

dotenv.config();
const PORT = process.env.PORT || 4000;

const app = express();
const server = app.listen(PORT, () =>
  console.log(`Server is listening on port ${PORT}.`)
);

const io = socketServer(server);
const game = new Game();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
})

app.post("/start", (_req, res) => {
  console.log("Match started.");
  game.start();
  res.send("Match started.");
})

app.post("/end", (_req, res) => {
  console.log("Match ended.");
  game.end();
  res.send("Match ended.");
})

app.post("/link/:id", async (req, res) => {
  const { id } = req.params;
  const { pid } = req.body;

  if (game.started) {
    return res.send("Match already started.");
  }

  const [userRows, userFields] = await connection.promise().query('SELECT * FROM `user` WHERE `id` = ?', [id]);
  const user = userRows[0];
  if (!user) {
    res.send("User not found.");
  }

  const linkingPlayer = game.observers.find((observer) => observer.socket.id === pid);
  if (linkingPlayer) {
    linkingPlayer.init(user.id, user.username);
    console.log(`Player ${user.username} joined the match.`);
  }
  game.observers = game.observers.filter((observer) => observer.socket.id !== pid);

  res.send("User successfully linked.");
});

app.delete("/:playerId", async (req, res) => {
  const { playerId } = req.params;

  game.observers = game.observers.filter((observer) => observer.id !== +playerId);
  if (!game.started) {
    game.removePlayer(+playerId);
  }
})

io.on(EventEnum.CONNECTION, (socket) => {
  console.log(`Observer with pid ${socket.id} connected.`)

  const initialPos: [number, number] = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
  const player = new Player(initialPos, game, socket);
  game.observers = [...game.observers, player];

  socket.emit("link", socket.id);

  socket.on(EventEnum.DISCONNECT, () => {
    game.observers = game.observers.filter((observer) => observer.socket.id !== socket.id);
  });
});