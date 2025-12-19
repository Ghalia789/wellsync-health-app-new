import mongoose from "mongoose";

const IALogSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.IALog ||
  mongoose.model("IALog", IALogSchema);
