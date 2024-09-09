const mongoose = require("mongoose");

const ExamResultSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "User",
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  totalCorrect: {
    type: Number,
    required: true,
  },
  totalWrong: {
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the ExamResult model
const ExamResult = mongoose.model("ExamResult", ExamResultSchema);

module.exports = ExamResult;
