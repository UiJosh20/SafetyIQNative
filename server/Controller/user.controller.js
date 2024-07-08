const db = require("../model/user.model");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();
const https = require("https");
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

  // Check if the email already exists in the safetyiq_table
  db("safetyiq_table")
    .where({ email })
    .first()
    .then((existingUser) => {
      if (existingUser) {
        return res.status(409).json({ message: "Email already used" });
      }

      // Hash the password
      return bcrypt.hash(password, 10);
    })
    .then((hashedPassword) => {
      if (!hashedPassword) return;

      // Find the available admin with the fewest users
      return db("admin_table")
        .select("admin_table.admin_id")
        .leftJoin(
          "safetyiq_table",
          "admin_table.admin_id",
          "safetyiq_table.admin_id"
        )
        .groupBy("admin_table.admin_id")
        .orderByRaw("COUNT(safetyiq_table.user_id) ASC")
        .first()
        .then((availableAdmin) => {
          if (!availableAdmin) {
            throw new Error("No available admin found");
          }

          const admin_id = availableAdmin.admin_id;

          // Insert the new user into the safetyiq_table with the found admin_id
          return db("safetyiq_table").insert({
            callUp_num: callUpNo,
            firstName,
            lastName,
            middleName,
            tel: telephoneNo,
            email,
            password: hashedPassword,
            course_name: courseName,
            admin_id,
          });
        });
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

        return db("safetyiq_table")
          .where({ email })
          .update({ frpnum: randomNumber })
          .then((results) => {
            if (results > 0) {
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

  // Check if identifier and password are provided
  if (!identifier || !password) {
    return res.status(400).send("Identifier and password are required.");
  }

  // Query the database for the user
  db("safetyiq_table")
    .where({ callup_num: identifier })
    .orWhere({ frpnum: identifier })
    .first()
    .then((user) => {
      // Check if user was found
      if (!user) {
        return res.status(404).send("User not found.");
      }

      // Compare the password
      return bcrypt.compare(password, user.password).then((match) => {
        // Check if password matches
        if (!match) {
          return res.status(401).send("Incorrect password.");
        }

        // Send success response
         res.send({ message: "Login successful", status: 200, user });
      });
    })
    .catch((error) => {
      // Log the error and send a 500 response
      console.error("Error logging in:", error);
      return res.status(500).send("An error occurred while logging in.");
    });
};

const dashboard = (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).send("User ID is required.");
  }

  db("safetyiq_table")
    .where({ user_id: id })
    .first()
    .then((user) => {
      if (!user) {
        return res.status(404).send("User not found.");
      }

      res.send({ user });
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
      res.status(500).send("An error occurred while fetching user data.");
    });
};


const fetchResources = (req, res) => {
  db("resources_table")
    .select("*")
    .then((resources) => {
      res.status(200).json(resources);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};

const courseFetch = (req, res) =>{
    db("courses")
      .then((courses) => {
        res.status(200).json(courses);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Internal Server Error");
      });
}

module.exports = {
  signup,
  paystackInit,
  paystackVerify,
  login,
  dashboard,
  fetchResources,
  courseFetch,
};
