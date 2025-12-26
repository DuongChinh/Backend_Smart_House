import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/UserSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

// ĐĂNG KÝ NGƯỜI DÙNG SMART HOME (chính là form React bạn đang có)
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const {
    username,
    password,
    name,
    email,
    phone,
    address = "Chưa cập nhật địa chỉ",
    bio = "Thành viên SmartHome",
    avatar, // nếu có upload ảnh đại diện
  } = req.body;

  // Kiểm tra đầy đủ thông tin
  if (!username || !password || !name || !email || !phone) {
    return next(
      new ErrorHandler("Vui lòng điền đầy đủ thông tin bắt buộc!", 400)
    );
  }

  // Kiểm tra username hoặc email đã tồn tại chưa
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    return next(
      new ErrorHandler("Tên đăng nhập hoặc email đã được sử dụng!", 400)
    );
  }

  // Upload avatar nếu có (tùy chọn)
  let avatarData = {};
  if (req.files && req.files.avatar) {
    const { avatar } = req.files;
    const allowedFormats = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/jpg",
    ];
    if (!allowedFormats.includes(avatar.mimetype)) {
      return next(
        new ErrorHandler("Chỉ hỗ trợ định dạng PNG, JPG, WEBP!", 400)
      );
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(
      avatar.tempFilePath || avatar.path,
      { folder: "smarthome_users" }
    );

    avatarData = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  // Tạo user mới
  const user = await User.create({
    username,
    password,
    name,
    email,
    phone,
    address,
    bio,
    role: "user", // mặc định là user, admin tạo riêng
    avatar: avatarData.url ? avatarData : undefined,
  });

  generateToken(user, "Đăng ký thành công! Chào mừng đến SmartHome", 201, res);
});

// ĐĂNG NHẬP
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body; // username ở đây thực chất là email

  if (!email || !password) {
    return next(new ErrorHandler("Vui lòng nhập email và mật khẩu!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new ErrorHandler("Email hoặc mật khẩu không đúng!", 400));
  }

  generateToken(user, "Đăng nhập thành công!", 200, res);
});

// LẤY THÔNG TIN USER ĐANG ĐĂNG NHẬP
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// ĐĂNG XUẤT
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("userToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      sameSite: "strict",
    })
    .json({
      success: true,
      message: "Đăng xuất thành công!",
    });
});

// TẠO ADMIN (chỉ admin mới gọi được)
export const createAdmin = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Chỉ Admin mới có quyền này!", 403));
  }

  const { username, password, name, email, phone } = req.body;
  if (!username || !password || !name || !email || !phone) {
    return next(new ErrorHandler("Thiếu thông tin bắt buộc!", 400));
  }

  const admin = await User.create({
    username,
    password,
    name,
    email,
    phone,
    role: "admin",
  });

  res.status(201).json({
    success: true,
    message: "Tạo Admin thành công!",
    admin,
  });
});
