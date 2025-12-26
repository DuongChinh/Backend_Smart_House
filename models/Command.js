// models/Command.js
import mongoose from "mongoose";

const commandSchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
    },
    command: {
      type: String,
      required: true,
    },
    executed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Command = mongoose.model("Command", commandSchema);

export default Command;
