import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  image: String,
  role: { type: String, enum: ["teacher", "student"], default: "student" },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

export default models.User || model("User", UserSchema);