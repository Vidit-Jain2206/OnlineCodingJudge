import { Server } from "socket.io";
import { SocketService } from "./service/SocketService";
import "dotenv/config";

import { createServer } from "http";
const app = createServer();

const io = new Server(app, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const socketService = new SocketService(io);

io.on("connection", (socket) => {
  console.log("a user connected");

  // Error handling for the socket
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  socket.on("join:room", async (roomId: string) => {
    await socketService.joinRoom(socket.id, roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on(
    "chat:message",
    async (
      context: { problemStatement: string; programmingLanguage: string },
      extractedCode: string,
      chatMessagesHistory: ChatMessage[],
      userMessage: string,
      roomId: string
    ) => {
      // now get the response from the openai server and send it to the client
      // const message: ChatMessage = await socketService.generateResponse(
      //   context,
      //   extractedCode,
      //   chatMessagesHistory,
      //   userMessage
      // );
      const message: ChatMessage = {
        message: "helli i am vidifonfrnfgjkrenjk",
        role: "assistant",
        type: "markdown",
      };
      await socketService.sendMessage(roomId, message);
    }
  );
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

export interface ChatMessage {
  role: "user" | "assistant";
  message: string;
  type: "text" | "markdown";
}
