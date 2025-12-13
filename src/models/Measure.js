import mongoose from "mongoose";

const MeasureSchema = new mongoose.Schema({
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: { type: String, required: true }, // e.g. weight, height, bp
  value: { type: Number, required: true },
  unit: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
  metadata: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  }, // Store detailed questionnaire answers
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

MeasureSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Measure = mongoose.models.Measure || mongoose.model("Measure", MeasureSchema);

export default Measure;
