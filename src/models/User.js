import mongoose from "mongoose";
 
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "user" },
  profileImage: { type: String, default: "" },
  firstLogin: { type: Boolean, default: true }, // ✅ important
});
 
// ✅ Empêche les erreurs de redéclaration avec Next.js (HMR)
const User = mongoose.models.User || mongoose.model("User", UserSchema);
 
export default User;