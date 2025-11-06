import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Create express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize socket.io server
export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*", // ✅ safer: use env variable in prod
    methods: ["GET", "POST"],
  },
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

// Socket.io connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  console.log("✅ User connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  // Send updated online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", userId);

    if (userId) delete userSocketMap[userId];

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "4mb" }));

// Routes
app.get("/api/status", (req, res) => res.send("Server is live ✅"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Database connection
await connectDB();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server is running on port ${PORT}`)
);
