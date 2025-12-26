// controllers/deviceController.js
import Device from "../models/Device.js";

export const registerDevice = async (req, res) => {
  const { name, mac } = req.body;

  try {
    // Kiểm tra MAC đã tồn tại chưa
    const existingDevice = await Device.findOne({ mac });
    if (existingDevice) {
      return res.status(400).json({
        success: false,
        message: "Thiết bị đã được đăng ký trước đó!",
      });
    }

    // Tạo thiết bị mới
    const device = new Device({
      name,
      mac,
      user: req.user.id, // từ middleware isAuthenticated
    });

    await device.save();

    res.status(201).json({
      success: true,
      message: "Đăng ký thiết bị thành công!",
      data: device,
    });
  } catch (error) {
    console.error("Lỗi đăng ký thiết bị:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại!",
    });
  }
};
