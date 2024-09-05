  const User = require("../model/user.model");
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken")
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
        const token = jwt.sign(
          { id: user._id }, 
          process.env.JWT_SECRET, 
          { expiresIn: "1h" } 
        );

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


  // const dashboard = (req, res) => {
  //   const { id } = req.body;

  //   if (!id) {
  //     return res.status(400).send("User ID is required.");
  //   }

  //   db("safetyiq_table")
  //     .where({ user_id: id })
  //     .first()
  //     .then((user) => {
  //       if (!user) {
  //         return res.status(404).send("User not found.");
  //       }

  //       res.send({ user });
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching user data:", error);
  //       res.status(500).send("An error occurred while fetching user data.");
  //     });
  // };

  const fetchResources = (req, res) => {
    const { courseId } = req.query;

  console.log(req.query);

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    db("resources_table")
      .where({ course_id: courseId })
      .select("*")
      .then((resources) => {
        res.status(200).json(resources);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      });
  };

  const courseFetch = (req, res) => {
    db("courses_table")
      .then((courses_table) => {
        res.status(200).json(courses_table);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Internal Server Error");
      });
  };


  const readfetch = (req, res) =>{
      db("readcourse_table")
        .then((courses_table) => {
          res.status(200).json(courses_table);
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send("Internal Server Error");
        });
  }
  const readCourses = (req, res) => {
      const { courseId, userId } = req.query;
      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }

      db("read_table")
        .where({ user_id: userId })
        .select("*")
        .then((resources) => {
          // console.log(resources);
          res.status(200).json(resources);
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ message: "Internal Server Error" });
        });
  };


  cron.schedule("0 2 * * *", () => {
    console.log("Running cron job to update the current topic...");
    fetchCurrentTopic();
  });


  const fetchCurrentTopic = (req, res) => {
  readCourse
    .find({})
    .then((topics) => {
      if (topics.length === 0) {
        console.error("No topics found");
        return;
      }


      const newCurrentTopic = topics[Math.floor(Math.random() * topics.length)];

      CurrentTopic.findOneAndUpdate(
        {},
        { topic: newCurrentTopic._id, date: new Date() },
        { upsert: true, new: true }
      )
        .then(() => {
          console.log(`Current topic changed to: ${newCurrentTopic.name}`);
        })
        .catch((error) => {
          console.error("Error updating current topic:", error);
        });
    })
    .catch((error) => {
      console.error("Error fetching topics:", error);
    });
  }

  module.exports = {
    signup,
    paystackInit,
    paystackVerify,
    login,
    // dashboard,
    fetchResources,
    courseFetch,
    readCourses,
    readfetch,
    fetchCurrentTopic,
  };
