const mongoose = require("mongoose");

const CompletedCourseSchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true },
  courseName: { type: String, required: true }, // Save the course name
  dateCompleted: { type: Date, default: Date.now },
  examAttempts: { type: Number, default: 0, null: true }, // Exam-related fields initialized as null
  highestScore: { type: Number, default: null },
  latestScore: { type: Number, default: null },
  scoreHistory: [
    {
      score: { type: Number, default: null }, // Exam score for this attempt, initially null
      correctAnswers: { type: Number, default: null }, // Initially null
      wrongAnswers: { type: Number, default: null }, // Initially null
      totalQuestions: { type: Number, default: null }, // Initially null
      date: { type: Date, default: Date.now }, // Date for each attempt
    },
  ],
});

module.exports = mongoose.model("CompletedCourse", CompletedCourseSchema);
