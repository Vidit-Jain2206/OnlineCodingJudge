import { Server } from "socket.io";
import { sub } from "../config/redis.config";

export class SocketService {
  private io: Server;
  constructor(io: Server) {
    this.io = io;
  }

  async joinRoom(socketId: string, roomId: string) {
    this.io.sockets.sockets.get(socketId)?.join(roomId);
  }

  async sendMessage(roomId: string, message: string) {
    this.io.to(roomId).emit("submission:completed", message);
  }
}
