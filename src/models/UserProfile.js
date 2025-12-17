import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema({
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  birthDate: {
    type: Date,
    default: null,
  },
  sexe: {
    type: String,
    enum: ["male", "female"],
    default: "male",
    required: true,
  },
  height: {
    type: Number, // in cm
    default: null,
    min: 50,
    max: 300,
  },
  weight: {
    type: Number, // in kg
    default: null,
    min: 20,
    max: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
UserProfileSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Prevent re-declaring the model if it already exists (HMR in Next.js)
const UserProfile =
  mongoose.models.UserProfile ||
  mongoose.model("UserProfile", UserProfileSchema);

export default UserProfile;
