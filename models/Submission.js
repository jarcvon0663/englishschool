import { Schema, model, models } from "mongoose";

const SubmissionSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "User" },
  activityId: { type: Schema.Types.ObjectId, ref: "Activity" },
  fileUrl: String,
  feedback: String,
}, { timestamps: true });

export default models.Submission || model("Submission", SubmissionSchema);