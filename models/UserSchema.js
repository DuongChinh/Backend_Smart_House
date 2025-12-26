import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    // === THÔNG TIN CƠ BẢN ===
    username: {
      type: String,
      required: [true, "Tên đăng nhập là bắt buộc!"],
      unique: true,
      minLength: [6, "Tên đăng nhập phải có ít nhất 6 ký tự!"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc!"],
      minLength: [8, "Mật khẩu phải có ít nhất 8 ký tự!"],
      select: false, // Không trả về password khi query
    },

    // === THÔNG TIN CÁ NHÂN (đúng form React của bạn) ===
    name: {
      type: String,
      required: [true, "Họ và tên là bắt buộc!"],
      minLength: [2, "Họ tên phải có ít nhất 2 ký tự!"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email là bắt buộc!"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Email không hợp lệ!"],
    },
    phone: {
      type: String,
      required: [true, "Số điện thoại là bắt buộc!"],
      validate: {
        validator: function (v) {
          return /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(v);
        },
        message: "Số điện thoại không hợp lệ!",
      },
    },
    address: {
      type: String,
      default: "Chưa cập nhật địa chỉ",
    },
    bio: {
      type: String,
      default: "Yêu thích nhà thông minh",
      maxLength: [200, "Tiểu sử không được quá 200 ký tự!"],
    },

    // === AVATAR (upload bằng Cloudinary) ===
    avatar: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/demo/image/upload/v1312461204/default_avatar.png",
      },
    },

    // === PHÂN QUYỀN ===
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // === THIẾT BỊ ĐÃ ĐĂNG KÝ (sẽ dùng sau) ===
    devices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device",
      },
    ],
  },
  {
    timestamps: true, // tự động thêm createdAt & updatedAt
  }
);

// Hash mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// So sánh mật khẩu
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Tạo JWT Token
userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET_KEY || "your_jwt_secret_fallback",
    {
      expiresIn: process.env.JWT_EXPIRES || "7d",
    }
  );
};

// Trả về thông tin user (không có password)
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

export const User = mongoose.model("User", userSchema);
