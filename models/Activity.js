import { Schema, model, models } from "mongoose";

const ActivitySchema = new Schema({
  title: String,
  description: String,
  fileUrl: String,
  dueDate: Date,
  course: { type: String, required: true }, // Nuevo campo
  teacherId: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default models.Activity || model("Activity", ActivitySchema);