import mongoose from "mongoose";

const GoalHistorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },

    goalType: String,
    description: String,

    aiResult: Object,      // résultat IA brut
    progress: Number,
    status: String,

    sourceGoalId: String, // optionnel (id du goal original)
    restored: {
        type: Boolean,
        default: false,
    },

  },
  { timestamps: true }
);

export default mongoose.models.GoalHistory ||
  mongoose.model("GoalHistory", GoalHistorySchema);
