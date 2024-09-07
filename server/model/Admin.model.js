const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
require("dotenv").config()
const URI = process.env.DATABASE_URL

mongoose
  .connect(URI)
  .then((response) => {
    console.log("admin database has connected successfully!");
  })
  .catch((err) => {
    console.log(err);
    console.log("There is an error in the database");
  });


const adminSchema = new Schema({
  admin_id: { type: String, unique: true },
  first_name: String,
  last_name: String,
  email: { type: String, unique: true },
  password: String,
});

// Define Resource schema
const resourceSchema = new Schema({
  course: String,
  title: String,
  description: String,
  time_taken: String,
  image: String,
  note: String,
});

// Define Read schema
const readSchema = new Schema({
  read_course: String,
  read_title: String,
  read_description: String,
  read_duration: String,
  read_image: String,
  read_note: String,
});

// Define Course schema
const courseSchema = new Schema({
  name: String,
  admin_id: String,
});

const readCourseSchema = new Schema({
  name: String,
  admin_id: String,
});

// Define Exam Question schema
const examQuestionSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (v) => v.length === 4, // Ensuring exactly 4 options
      message: "There must be exactly 4 options.",
    },
  },
  correct_answer: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return this.options.includes(v); // Ensuring correct answer is one of the options
      },
      message: "The correct answer must be one of the provided options.",
    },
  },
  course_name: {
    type: String,
    required: true,
  },
});




const Admin = mongoose.model("Admin", adminSchema);
const Resource = mongoose.model("Resource", resourceSchema);
const Read = mongoose.model("Read", readSchema);
const Course = mongoose.model("Course", courseSchema);
const readCourse = mongoose.model("readCourse", readCourseSchema);
const ExamQuestion = mongoose.model("ExamQuestion", examQuestionSchema);




module.exports = {
  Admin,
  Resource,
  Read,
  Course,
  ExamQuestion,
  readCourse
};
