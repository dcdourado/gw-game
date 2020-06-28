export enum EventEnum {
  CONNECTION = "connection",
  DISCONNECT = "disconnect",

  PLAYER = "player",
  PLAYER_JOINED = "player_joined",
  PLAYER_LEFT = "player_left",
  PLAYER_MOVE = "player_move",
  INIT_PLAYERS = "init_players",

  ARROW = "arrow",
  ARROW_MOVE = "arrow_move",
  ARROW_HIT = "arrow_hit",
  ARROW_DELETE = "arrow_delete",
}

export enum DirectionEnum {
  UP,
  RIGHT,
  DOWN,
  LEFT,
}
