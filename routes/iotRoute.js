// routes/iotRoute.js
import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { sendCommand } from "../services/mqttService.js";
import Schedule from "../models/Schedule.js";

const router = express.Router();

// 1. Bật/tắt điều hòa
router.post("/control/air-conditioner/toggle", isAuthenticated, (req, res) => {
  const { status } = req.body; // 1 = bật, 0 = tắt
  const power = status === 1;

  const command = JSON.stringify({
    power,
    temp: 25, // mặc định
  });

  sendCommand(command);

  global.io?.emit(
    "ac_status",
    JSON.stringify({
      status: power ? "on" : "off",
      temperature: 25,
    })
  );

  res.json({
    success: true,
    message: power ? "Đã bật điều hòa" : "Đã tắt điều hòa",
  });
});

// 2. thay đổi nhiệt độ
router.post(
  "/control/air-conditioner/temperature",
  isAuthenticated,
  (req, res) => {
    const { temperature } = req.body;
    const temp = Math.max(16, Math.min(30, Number(temperature)));

    const command = JSON.stringify({
      power: true,
      temp,
    });

    sendCommand(command);

    global.io?.emit(
      "ac_status",
      JSON.stringify({
        status: "on",
        temperature: temp,
      })
    );

    res.json({
      success: true,
      message: `Đặt nhiệt độ ${temp}°C`,
    });
  }
);

router.post("/control", isAuthenticated, (req, res) => {
  const { status, temperature } = req.body;

  const power = status === 1;
  const temp = temperature
    ? Math.max(16, Math.min(30, Number(temperature)))
    : 25;

  const command = JSON.stringify({ power, temp });
  sendCommand(command);

  global.io?.emit(
    "ac_status",
    JSON.stringify({
      status: power ? "on" : "off",
      temperature: temp,
    })
  );

  res.json({ success: true, message: "Lệnh đã gửi!" });
});

// Route mới: Set lịch bật/tắt
router.post("/schedule", isAuthenticated, async (req, res) => {
  const { onTime, offTime, temperature = 25, repeatDaily = true } = req.body;

  try {
    // Lưu lịch vào DB
    const newSchedule = new Schedule({
      userId: req.user._id,
      onTime,
      offTime,
      temperature,
      repeatDaily,
    });
    await newSchedule.save();

    res.json({ success: true, message: "Lịch đã được set!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi set lịch" });
  }
});

export default router;
