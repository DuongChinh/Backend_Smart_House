import jwt from "jsonwebtoken";
import { User } from "../models/UserSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./errorMiddleware.js";

// 1. XÁC THỰC NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP (user hoặc admin đều được)
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.userToken; // tên cookie thống nhất: userToken

  if (!token) {
    return next(new ErrorHandler("Vui lòng đăng nhập để tiếp tục!", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorHandler("Tài khoản không tồn tại!", 401));
    }

    next();
  } catch (error) {
    return next(new ErrorHandler("Token không hợp lệ hoặc đã hết hạn!", 401));
  }
});

// 2. XÁC THỰC LÀ ADMIN (chỉ admin mới vào được)
export const isAdmin = catchAsyncErrors(async (req, res, next) => {
  // Dùng lại isAuthenticated trước để lấy req.user
  if (!req.user) {
    return next(new ErrorHandler("Vui lòng đăng nhập!", 401));
  }

  if (req.user.role !== "admin") {
    return next(
      new ErrorHandler("Bạn không có quyền truy cập tài nguyên này!", 403)
    );
  }

  next();
});

// Bonus: Middleware kết hợp (nếu bạn thích dùng 1 lần)
export const authenticateAndAuthorize = (roles = ["user"]) =>
  catchAsyncErrors(async (req, res, next) => {
    const token = req.cookies.userToken;
    if (!token) {
      return next(new ErrorHandler("Vui lòng đăng nhập!", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user || !roles.includes(user.role)) {
      return next(new ErrorHandler("Không có quyền truy cập!", 403));
    }

    req.user = user;
    next();
  });
