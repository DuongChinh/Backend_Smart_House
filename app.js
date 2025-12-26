// app.js
import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

import userRouter from "./routes/userRoute.js";
import iotRouter from "./routes/iotRoute.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

config({ path: ".env" });

const app = express();

// CORS – cho phép frontend React gọi API
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Middleware cơ bản
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Upload avatar (Cloudinary)
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  })
);

// ====================== ROUTES ======================
app.use("/api/auth", userRouter);
app.use("/api/auth", iotRouter);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Đăng ký & Đăng nhập sẵn sàng!",
    time: new Date().toLocaleString("vi-VN"),
  });
});

// 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy route: ${req.originalUrl}`,
  });
});
// Error middleware (phải để cuối cùng)
app.use(errorMiddleware);

export default app;
