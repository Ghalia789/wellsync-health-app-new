import mongoose from "mongoose";

const ClearHistoryTokenSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

// Eviter recompilation Next.js
export default mongoose.models.ClearHistoryToken ||
  mongoose.model("ClearHistoryToken", ClearHistoryTokenSchema);
