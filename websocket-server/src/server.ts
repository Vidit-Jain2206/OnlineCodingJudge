import { Server } from "socket.io";
import { SocketService } from "./service/SocketService";
import { sub } from "./config/redis.config";
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

  socket.on("join:room", (roomId: string) => {
    socketService.joinRoom(socket.id, roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });
});

sub.on("message", (channel, message) => {
  if (channel === "submission") {
    const data = JSON.parse(message);
    socketService.sendMessage(data.id, data);
  }
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
