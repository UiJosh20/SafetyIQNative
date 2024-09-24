const User = require("../model/user.model");
const cron = require("node-cron");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
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


const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASS;

const signup = (req, res) => {
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

  // Check if the email already exists
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        throw new Error("Email already used");
      }

      // Insert the new user into the users collection
      const newUser = new User({
        callupNum: callUpNo,
        firstName,
        lastName,
        middleName,
        tel: telephoneNo,
        email,
        password, // This will be hashed in the pre-save middleware
        courseName,
      });

      return newUser.save();
    })
    .then(() => {
      res.status(201).send("User registered successfully");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
};

const paystackInit = (req, res) => {
  const { amount, email } = req.body;

  const params = JSON.stringify({
    email,
    amount,
  });

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
      res.send(JSON.parse(data));
    });
  });

  reqpaystack.on("error", (error) => {
    console.error(error);
    res.status(500).send("Error initializing payment");
  });

  reqpaystack.write(params);
  reqpaystack.end();
};

const generateRandomNumber = () => {
  return Math.floor(100000000000 + Math.random() * 700000000000).toString();
};

const sendUniqueNumberToEmail = (email, randomNumber) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "FRP NUMBER",
      text: `Your FRP Number is: ${randomNumber}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};

const paystackVerify = (req, res) => {
  const { reference } = req.query;

  console.log(req.query);

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
    },
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
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (error) {
            reject(new Error("Error parsing JSON"));
          }
        });
      });

      reqVerify.on("error", (error) => {
        reject(error);
      });

      reqVerify.end();
    });
  };

  verifyTransaction()
    .then((parsedData) => {
      if (parsedData) {
        const randomNumber = generateRandomNumber();
        const email = parsedData.data.customer.email;

        return User.findOneAndUpdate(
          { email: email },
          { frpnum: randomNumber },
          { new: true }
        ).then((updatedDocument) => {
          if (updatedDocument) {
            return sendUniqueNumberToEmail(email, randomNumber).then(() => {
              res.send({
                message: "Payment successful",
                frpnum: randomNumber,
              });
            });
          } else {
            res.status(404).send("User not found");
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error verifying payment");
    });
};

const login = (req, res) => {
  const { identifier, password } = req.body;

  // Find the user by callupNum or frpNum (identifier)
  User.findOne({
    $or: [{ callupNum: identifier }, { frpNum: identifier }],
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send("User not found");
      }

      // Compare the provided password with the stored hashed password
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          return res.status(401).send("Incorrect password");
        }

        // Generate a JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        // On successful login, return the token and user data
        res.status(200).send({
          message: "Login successful",
          token,
          user: {
            user_id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        });
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
};



const fetchResources = (req, res) => {
  const { course } = req.query;


   if (!course) {
     return res.status(400).json({ message: "Course is required" });
   }

   Resource.find({ course: course })
     .then((resources) => {
       if (!resources.length) {
         return res
           .status(404)
           .json({ message: "No resources found for this topic" });
       }
       res.status(200).json(resources);
     })
     .catch((error) => {
       console.error("Error fetching resources:", error);
       res.status(500).json({ message: "Internal Server Error" });
     });

};

const courseFetch = (req, res) => {
  Course.find({})
  .then((result) => {
    res.send(result)
    
  });
};

const readCourses = (req, res) => {
  const { currentTopic } = req.query;

  if (!currentTopic) {
    return res.status(400).json({ message: "Current topic is required" });
  }

  Read.find({ read_course: currentTopic })
    .then((resources) => {
      if (!resources.length) {
        return res
          .status(404)
          .json({ message: "No resources found for this topic" });
      }
      res.status(200).json(resources);
    })
    .catch((error) => {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};

cron.schedule("0 2 * * *", () => {
  console.log("Running cron job to update the current topic...");
  fetchCurrentTopic();
});

const fetchCurrentTopic = (req, res) => {
  const { user } = req.params;

  readCourse
    .find({})
    .then((topics) => {
      if (topics.length === 0) {
        return res.status(404).send({ message: "No topics available" });
      }

      UserTopic.find({ user })
        .then((assignedTopics) => {
          const assignedTopicIds = assignedTopics.map((ut) =>
            ut.topic_id.toString()
          );

          const availableTopics = topics.filter(
            (topic) => !assignedTopicIds.includes(topic._id.toString())
          );

          if (availableTopics.length === 0) {
            console.log("All topics have been assigned");
            return res
              .status(404)
              .send({ message: "All topics have been assigned" });
          }

          const newCurrentTopic =
            availableTopics[Math.floor(Math.random() * availableTopics.length)];

          CurrentTopic.findOneAndUpdate(
            {},
            { topic: newCurrentTopic._id, date: new Date() },
            { upsert: true, new: true }
          )
            .then(() => {
              const userTopic = new UserTopic({
                userId: user,
                topic_id: newCurrentTopic._id,
                topic_assigned: newCurrentTopic.name,
                dateAssigned: new Date(),
              });

              return userTopic.save();
            })
            .then(() => {
              res.status(200).send({ currentTopic: newCurrentTopic.name });
            })
            .catch((error) => {
              res.status(500).send({ message: "Error updating current topic" });
            });
        })
        .catch((error) => {
          console.error("Error fetching assigned topics:", error);
          res.status(500).send({ message: "Error fetching assigned topics" });
        });
    })
    .catch((error) => {
      console.error("Error fetching topics:", error);
      res.status(500).send({ message: "Error fetching topics" });
    });
};


const fetchExamQuestions = (req, res) =>{
  const {course_name} = req.query


  if (!course_name) {
    return res.status(400).json({ error: "course_name is required" });
  }

  ExamQuestion.find({ course_name })
    .then((questions) => {
      if (questions.length === 0) {
        return res
          .status(404)
          .json({ message: "No questions found for this course." });
      }
      res.status(200).json(questions);
    })
    .catch((error) => {
      console.error("Error fetching exam questions:", error);
      res.status(500).json({ error: "Server error while fetching questions." });
    });
  

}

const submitExam = (req, res) => {
  const { selectedAnswers, ids, course_name } = req.body; // selectedAnswers from the frontend

  const result = [];
  const questionIds = Object.keys(selectedAnswers);

  ExamQuestion.find({ _id: { $in: questionIds } })
    .then((questions) => {
      questions.forEach((question) => {
        const userAnswer = selectedAnswers[question._id];
        const correctAnswer = question.correct_answer;

        if (userAnswer === correctAnswer) {
          result.push({ questionId: question._id, correct: true });
        } else {
          result.push({ questionId: question._id, correct: false });
        }
      });

      const totalQuestions = result.length;
      const totalCorrect = result.filter((r) => r.correct).length;
      const totalWrong = totalQuestions - totalCorrect;

      // Save the result to the database
      const newExamResult = new ExamResult({
        user: ids, // Assuming the user ID is passed in the request
        topic: course_name, // Assuming topic is passed in the request
        totalQuestions,
        totalCorrect,
        totalWrong,
      });

      newExamResult
        .save()
        .then((response) => {
        console.log(response);
        
          res.status(200).json({
            message: "Exam submitted successfully",
            totalQuestions,
            totalCorrect,
            totalWrong,
          });
        })
        .catch((error) => {
          console.error("Error saving exam result:", error);
          res.status(500).json({
            message: "An error occurred while saving the exam result.",
          });
        });
    })
    .catch((error) => {
      console.error("Error fetching questions for comparison:", error);
      res
        .status(500)
        .json({ error: "An error occurred while processing the exam." });
    });
};

const completedCourse = async (req, res) => {
  const { userId, courseName } = req.body; // Assuming these are passed from the frontend

  try {
    // Check if the course is already marked as completed for this user
    let existingCourse = await CompletedCourse.findOne({ userId, courseId });

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
    res
      .status(500)
      .json({
        message: "An error occurred while saving the completed course",
        error: error.message,
      });
  }
};




const fetchUserResult = (req, res) => {
  const { user } = req.params;
  const {course} = req.query
  

  ExamResult.find({user:user, topic:course})

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
};
