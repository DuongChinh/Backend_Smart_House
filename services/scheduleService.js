// services/scheduleService.js
import cron from "node-cron";
import moment from "moment-timezone";
import Schedule from "../models/Schedule.js";
import { sendCommand } from "./mqttService.js";

// Khởi động cron job kiểm tra hàng phút
export const startScheduleCron = () => {
  cron.schedule("* * * * *", async () => {
    // Chạy hàng phút
    const now = moment.tz("Asia/Ho_Chi_Minh"); // Múi giờ Việt Nam
    const currentTime = now.format("HH:mm");

    try {
      const schedules = await Schedule.find({ active: true });

      for (const schedule of schedules) {
        // Kiểm tra giờ bật
        if (currentTime === schedule.onTime) {
          const command = JSON.stringify({
            power: true,
            temp: schedule.temperature,
          });
          sendCommand(command);
          global.io?.emit(
            "ac_status",
            JSON.stringify({ status: "on", temperature: schedule.temperature })
          );
        }

        // Kiểm tra giờ tắt
        if (currentTime === schedule.offTime) {
          const command = JSON.stringify({ power: false });
          sendCommand(command);
          global.io?.emit("ac_status", JSON.stringify({ status: "off" }));
        }
      }
    } catch (error) {
      console.error("Lỗi cron schedule:", error);
    }
  });

  console.log("Cron schedule started!");
};
