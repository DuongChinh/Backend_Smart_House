// models/Schedule.js
import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  onTime: { type: String, required: true }, // Ví dụ: "19:00" (HH:mm)
  offTime: { type: String, required: true }, // Ví dụ: "22:00"
  temperature: { type: Number, default: 25 },
  repeatDaily: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
});

export default mongoose.model("Schedule", scheduleSchema);
