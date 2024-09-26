const User = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const https = require("https");
const {
  Admin,
  Resource,
  Read,
  Course,
  readCourse,
  ExamQuestion,
} = require("../model/Admin.model");
const CurrentTopic = require("../model/CurrentTopic.model");
const UserTopic = require("../model/UserTopic.model");
const CompletedCourse = require("../model/CompletedCourse.model");
const ExamResult = require("../model/ExamResult.model");

const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASS;

// Helper function for error handling
const handleError = (res, error, message = "Internal Server Error") => {
  console.error(error);
  res.status(500).json({ message });
};

// Signup user with memory and performance optimization
const signup = async (req, res) => {
  const {
    callUpNo,
    firstName,
    lastName,
    middleName,
    telephoneNo,
    email,
    password,
    courseName,
  } = req.body;
  try {
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser)
      return res.status(400).json({ message: "Email already used" });

    const newUser = new User({
      callupNum: callUpNo,
      firstName,
      lastName,
      middleName,
      tel: telephoneNo,
      email,
      password,
      courseName,
    });

    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    handleError(res, error);
  }
};

// Initialize Paystack payment
const paystackInit = (req, res) => {
  const { amount, email } = req.body;
  const params = JSON.stringify({ email, amount });
  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  };

  const reqpaystack = https.request(options, (respaystack) => {
    let data = "";
    respaystack.on("data", (chunk) => {
      data += chunk;
    });
    respaystack.on("end", () => {
      res.json(JSON.parse(data));
    });
  });

  reqpaystack.on("error", (error) =>
    handleError(res, error, "Error initializing payment")
  );
  reqpaystack.write(params);
  reqpaystack.end();
};

// Verify Paystack payment
const paystackVerify = async (req, res) => {
  const { reference } = req.query;
  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: "GET",
    headers: { Authorization: `Bearer ${SECRET_KEY}` },
  };

  const verifyTransaction = () => {
    return new Promise((resolve, reject) => {
      const reqVerify = https.request(options, (resVerify) => {
        let data = "";
        resVerify.on("data", (chunk) => {
          data += chunk;
        });
        resVerify.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error("Error parsing JSON"));
          }
        });
      });
      reqVerify.on("error", (error) => reject(error));
      reqVerify.end();
    });
  };

  try {
    const parsedData = await verifyTransaction();
    const { email } = parsedData.data.customer;
    const randomNumber = generateRandomNumber();

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { frpnum: randomNumber },
      { new: true }
    ).lean();

    if (!updatedUser) return res.status(404).send("User not found");

    await sendUniqueNumberToEmail(email, randomNumber);
    res.json({ message: "Payment successful", frpnum: randomNumber });
  } catch (error) {
    handleError(res, error, "Error verifying payment");
  }
};

// Login user
const login = async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ callupNum: identifier }, { frpNum: identifier }],
    })
      .select("+password")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Fetch resources with memory optimization
const fetchResources = async (req, res) => {
  const { course } = req.query;
  if (!course) return res.status(400).json({ message: "Course is required" });

  try {
    const resources = await Resource.find({ course }).lean();
    if (!resources.length)
      return res
        .status(404)
        .json({ message: "No resources found for this topic" });
    res.json(resources);
  } catch (error) {
    handleError(res, error, "Error fetching resources");
  }
};

// Fetch courses
const courseFetch = async (req, res) => {
  try {
    const result = await Course.find({}).lean();
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// Read courses
const readCourses = async (req, res) => {
  const { currentTopic } = req.query;
  if (!currentTopic)
    return res.status(400).json({ message: "Current topic is required" });

  try {
    const resources = await Read.find({ read_course: currentTopic }).lean();
    if (!resources.length)
      return res
        .status(404)
        .json({ message: "No resources found for this topic" });
    res.json(resources);
  } catch (error) {
    handleError(res, error, "Error fetching resources");
  }
};

// Fetch current topic and assign it to user
const fetchCurrentTopic = async (req, res) => {
  const { user } = req.params;
  try {
    const topics = await readCourse.find({}).lean();
    if (!topics.length)
      return res.status(404).json({ message: "No topics available" });

    const assignedTopics = await UserTopic.find({ user }).lean();
    const assignedTopicIds = assignedTopics.map((ut) => ut.topic_id.toString());
    const availableTopics = topics.filter(
      (topic) => !assignedTopicIds.includes(topic._id.toString())
    );

    if (!availableTopics.length)
      return res.status(404).json({ message: "All topics have been assigned" });

    const newCurrentTopic =
      availableTopics[Math.floor(Math.random() * availableTopics.length)];

    await CurrentTopic.findOneAndUpdate(
      {},
      { topic: newCurrentTopic._id, date: new Date() },
      { upsert: true, new: true }
    );

    const userTopic = new UserTopic({
      userId: user,
      topic_id: newCurrentTopic._id,
      topic_assigned: newCurrentTopic.name,
      dateAssigned: new Date(),
    });

    await userTopic.save();
    res.json({ currentTopic: newCurrentTopic.name });
  } catch (error) {
    handleError(res, error, "Error updating current topic");
  }
};

// Fetch exam questions
const fetchExamQuestions = async (req, res) => {
  const { course_name } = req.query;
  if (!course_name)
    return res.status(400).json({ error: "course_name is required" });

  try {
    const questions = await ExamQuestion.find({ course_name }).lean();
    if (!questions.length)
      return res
        .status(404)
        .json({ message: "No questions found for this course." });
    res.json(questions);
  } catch (error) {
    handleError(res, error, "Error fetching exam questions");
  }
};

// Submit exam
const submitExam = async (req, res) => {
  const { selectedAnswers, ids, course_name } = req.body;
  if (!selectedAnswers || !ids || !course_name)
    return res.status(400).json({ message: "Missing exam details" });

  try {
    const examResults = await ExamQuestion.find({
      _id: { $in: ids },
      course_name,
    }).lean();

    if (!examResults.length)
      return res.status(404).json({ message: "No exam questions found" });

    let score = 0;
    examResults.forEach((question, index) => {
      if (selectedAnswers[index] === question.answer) score++;
    });

    res.json({ message: "Exam submitted successfully", score });
  } catch (error) {
    handleError(res, error, "Error submitting exam");
  }
};

const completedCourse = async (req, res) => {
  const { userId, courseName } = req.body; // Assuming these are passed from the frontend

  try {
    // Check if the course is already marked as completed for this user
    let existingCourse = await CompletedCourse.findOne({ userId, courseName });

    if (existingCourse) {
      return res
        .status(400)
        .json({ message: "Course already marked as completed" });
    }

    // Create a new completed course record
    const newCompletedCourse = new CompletedCourse({
      userId,
      courseName,
      examAttempts: 0, // Default to 0, exam not taken yet
      highestScore: null, // No score yet
      latestScore: null, // No score yet
      scoreHistory: [], // Empty score history
    });

    // Save the new completed course record
    await newCompletedCourse.save();

    res
      .status(201)
      .json({ message: "Course marked as completed successfully" });
  } catch (error) {
    console.error("Error saving completed course:", error);
    res.status(500).json({
      message: "An error occurred while saving the completed course",
      error: error.message,
    });
  }
};

const getCompletedTopic = (req, res) => {
  const { user } = req.params;

  CompletedCourse.find({ userId: user })
    .then((completedCourses) => {
      if (!completedCourses.length) {
        return res
          .status(404)
          .json({ message: "No completed topics found for this user" });
      }
      res.status(200).json({
        message: "Completed topics fetched successfully",
        completedCourses: completedCourses,
      });
    })
    .catch((error) => {
      console.error("Error fetching completed topics:", error);
      res.status(500).json({ message: "Server error" });
    });
};

const fetchUserResult = (req, res) => {
  const { user } = req.params;
  const { course } = req.query;

  ExamResult.find({ user: user, topic: course })

    .then((result) => {
      if (!result) {
        return res
          .status(404)
          .json({ message: "No result found for the current topic" });
      }
      // Step 3: Send the result back to the client
      res.status(200).json({
        message: "Current topic result fetched successfully",
        result,
      });
    })
    .catch((error) => {
      console.error("Error fetching current topic result:", error);
      res.status(500).json({ error: "Server error" });
    });
};

module.exports = {
  signup,
  paystackInit,
  paystackVerify,
  login,
  fetchResources,
  courseFetch,
  readCourses,
  fetchCurrentTopic,
  fetchExamQuestions,
  submitExam,
  fetchUserResult,
  completedCourse,
  getCompletedTopic,
};
