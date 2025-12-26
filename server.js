// server.js
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import mongoose from "mongoose";
import cloudinary from "cloudinary";
import http from "http";
import { Server } from "socket.io";
import connectMQTT from "./config/mqtt.js";
import { startScheduleCron } from "./services/scheduleService.js";

// ==================== CLOUDINARY ====================
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ==================== MONGODB ====================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected!");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};
connectDB();

// ==================== SOCKET.IO + HTTP SERVER ====================
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);
startScheduleCron();

// QUAN TRỌNG: Gán global.io TRƯỚC khi dùng ở mqtt.js
global.io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
  },
});

connectMQTT();

global.io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

// Khởi động server
httpServer.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});

// Xử lý lỗi toàn cục
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err);
  httpServer.close(() => process.exit(1));
});
