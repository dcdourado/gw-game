interface Packet {
  key: string;
}

export interface PlayerPacket extends Packet {
  value: number;
}

export interface BroadcastPacket extends Packet {
  data: {
    pid: number;
    value: Object;
  }
}