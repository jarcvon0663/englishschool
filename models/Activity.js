import { Schema, model, models } from "mongoose";

const ActivitySchema = new Schema({
  title: String,
  description: String,
  fileUrl: String,
  dueDate: Date,
  teacherId: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default models.Activity || model("Activity", ActivitySchema);