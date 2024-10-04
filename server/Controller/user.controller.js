const User = require("../model/user.model");
const cron = require("node-cron");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const twilio = require("twilio")
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
   html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333; text-align: center;">FRP Number Notification</h2>
        <p style="font-size: 16px; color: #333;">
          Dear user,
        </p>
        <p style="font-size: 16px; color: #333;">
          We have generated an FRP number for you. Please find your FRP Number below:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <p style="font-size: 24px; font-weight: bold; color: #c30000;">${randomNumber}</p>
        </div>
        <p style="font-size: 16px; color: #333;">
          Please keep this number secure for future reference.
        </p>
        <p style="font-size: 16px; color: #333;">
          Best regards,<br />
          The Team
        </p>
      </div>
    </div>
  `,
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
    let existingCourse = await CompletedCourse.findOne({ userId, courseName});

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


const checkExam = (req, res) => {
  const { course_name } = req.params;
  

  // Check if course_name is provided
  if (!course_name) {
    return res.status(400).json({ error: "course_name is required" });
  }

  // Query the database to check if there are exam questions for the given course
  ExamQuestion.find({ course_name })
    .then((questions) => {
      if (questions.length === 0) {
        return res
          .status(404)
          .json({ message: "No exam available for this course." });
      }
      // If exam questions are found
      res.status(200).json({
        message: "Exam is available for this course.",
        questions,
      });
    })
    .catch((error) => {
      console.error("Error checking exam availability:", error);
      res
        .status(500)
        .json({ error: "Server error while checking exam availability." });
    });
};



const examOTP = (req, res) => {
  const { phoneNumber } = req.body;

  // Phone number validation (simple example, adjust as needed)
  const phoneRegex = /^[0-9]{11}$/;

  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({ message: "Invalid phone number format" });
  }

  // Check if the user exists in the database
  User.findOne({ tel: phoneNumber })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate a random 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      // Set OTP expiration time (10 minutes from now)
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Set up Nodemailer transporter with Gmail
      const transporter = nodemailer.createTransport({
        service: "gmail", // Use Gmail as the email service
        auth: {
          user: process.env.EMAIL_USER, // Your Gmail address
          pass: process.env.EMAIL_PASS, // Your Gmail app-specific password
        },
      });

      // Prepare a sophisticated HTML email template
      const mailOptions = {
        from: `"SafetyIQ" <${process.env.EMAIL_USER}>`, // Sender address
        to: user.email, // Recipient email
        subject: "Your OTP Code for SafetyIQ",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #c30000;">SafetyIQ Exam OTP</h2>
            <p>Dear ${user.firstName},</p>
            <p>You requested a One-Time Password (OTP) to access your exam. Please use the code below to continue:</p>
            <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #000;">
              ${otp}
            </div>
            <p>This OTP is valid for the next 10 minutes. Do not share this code with anyone.</p>
            <p>If you did not request this OTP, please ignore this email or contact our support team.</p>
            <p>Thank you for using SafetyIQ!</p>
            <footer style="margin-top: 20px; font-size: 12px; color: #888;">
              <p>SafetyIQ Support Team</p>
              <p>Contact us: support@safetyiq.com</p>
            </footer>
          </div>
        `,
      };

      // Send the OTP via email
      return transporter
        .sendMail(mailOptions)
        .then((info) => {
          console.log("Email sent:", info.response);

          // Save the OTP and expiration time to the user
          user.otp = otp;
          user.otpExpiresAt = otpExpiresAt;

          return user.save();
        })
        .then(() => {
          return res.status(200).json({ message: "OTP sent successfully!" });
        })
        .catch((error) => {
          console.error("Error sending OTP:", error);
          if (!res.headersSent) {
            return res
              .status(500)
              .json({ message: "Error sending OTP, please try again." });
          }
        });
    })
    .catch((error) => {
      console.error("Error checking user:", error);
      if (!res.headersSent) {
        return res.status(500).json({ message: "Internal server error." });
      }
    });
};


const verifyOtp = (req, res) => {
  const {otp, phoneNumber } = req.body;
  console.log(req.body);
  
  // Check if both fields are provided
  if (!phoneNumber || !otp) {
    return res
      .status(400)
      .json({ message: "Phone number and OTP are required." });
  }

  // Find the user by phone number
  User.findOne({ tel: phoneNumber })
    .then((user) => {
      // If user not found
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Compare the OTP
      if (user.otp === otp) {
        // If OTP matches, verify success
        return res.status(200).json({ message: "OTP verified successfully!" });
      } else {
        // If OTP doesn't match
        return res.status(400).json({ message: "Invalid OTP." });
      }
    })
    .catch((error) => {
      // In case of any server error
      console.error("Error verifying OTP:", error);
      return res
        .status(500)
        .json({ message: "Server error. Please try again later." });
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
  checkExam,
  examOTP,
  verifyOtp,
};
