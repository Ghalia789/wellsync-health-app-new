import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "WEIGHT_LOSS",
        "MUSCLE_GAIN",
        "MAINTENANCE",
        "HEART_HEALTH",
        "SLEEP_IMPROVEMENT",
        "STRESS_REDUCTION",
        "DIABETES_CONTROL",
      ],
    },

    description: { type: String, required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "failed"],
      default: "pending",
    },
    archived: {
      type: Boolean,
      default: false,
    },


    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Goal = mongoose.models.Goal || mongoose.model("Goal", GoalSchema);

export default Goal;
