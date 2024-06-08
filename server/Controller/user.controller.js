const db = require("../model/user.model");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

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

  const https = require("https");
  const {amount, email} = req.body;

  const params = JSON.stringify({
    email: `${email}`,
    amount: `${amount}`,
  });

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: "Bearer SECRET_KEY",
      "Content-Type": "application/json",
    },
  };

  const reqpaystack = https
    .request(options, (respaystack) => {
      let data = "";

      respaystack.on("data", (chunk) => {
        data += chunk;
      });

      respaystack.on("end", () => {
        res.send(data);
        console.log(JSON.parse(data));
      });
    })
    .on("error", (error) => {
      console.error(error);
    });

  reqpaystack.write(params);
  reqpaystack.end();
};

const paystackVerify = (req, res) => {
  const https = require("https");
  const {reference} = req.params;

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: "GET",
    headers: {
      Authorization: "Bearer SECRET_KEY",
    },
  };

  https
    .request(options, (resVerify) => {
      let data = "";

      resVerify.on("data", (chunk) => {
        data += chunk;
      });

      resVerify.on("end", () => {
        res.send(data)
        console.log(JSON.parse(data));
      });
    })
    .on("error", (error) => {
      console.error(error);
    });
}

module.exports = {
  signup,
  paystackInit,
  paystackVerify
};
