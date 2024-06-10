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
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hashedPassword) => {
      const query =
        "INSERT INTO safetyiq_table (callUp_num, firstName, lastName, middleName, tel, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)";
      const values = [
        callUpNo,
        firstName,
        lastName,
        middleName,
        telephoneNo,
        email,
        hashedPassword,
      ];

      db.query(query, values, (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send("Internal Server Error");
          return;
        }
        res.status(201).send("User registered successfully");
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error hashing password");
    });
};

const paystackInit = (req, res) => {
  const { amount, email } = req.body;

  const params = JSON.stringify({
    email: email,
    amount: amount,
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

        const updateQuery = `UPDATE safetyiq_table SET frpnum = ? WHERE email = ?`;

        db.query(updateQuery, [randomNumber, email], (err, results) => {
          if (results.affectedRows > 0) {
            sendUniqueNumberToEmail(email, randomNumber);
            res.send({
              message: "Payment successful",
              frpnum: randomNumber,
            });
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const login = (req, res) => {
  const { , password } = req.body;

  const query = `SELECT * FROM safetyiq_table WHERE email = ?`;

  db.query(query, [email], (err, results) => {

  });
};

module.exports = {
  signup,
  paystackInit,
  paystackVerify,
};
