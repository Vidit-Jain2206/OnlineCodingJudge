import { Server } from "socket.io";
import { ChatMessage } from "../server";

export class SocketService {
  private io: Server;
  constructor(io: Server) {
    this.io = io;
  }

  async joinRoom(socketId: string, roomId: string) {
    this.io.sockets.sockets.get(socketId)?.join(roomId);
  }

  async sendMessage(roomId: string, message: ChatMessage) {
    console.log("sending back to ", roomId, message);
    this.io.to(roomId).emit("chat:response", message);
  }

  async generateResponse(
    chatMessagesHistory: ChatMessage[],
    userMessage: string
  ): Promise<ChatMessage> {
    // generate response from chat messages and return the message
    return {} as ChatMessage;
  }
}
