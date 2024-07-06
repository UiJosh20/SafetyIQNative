const db = require("../model/user.model");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASS;

const signupAdmin = (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  db("admin_table")
    .where({ email })
    .first()
    .then((existingAdmin) => {
      if (existingAdmin) {
        return res.status(409).json({ message: "Email already used" });
      }

      return bcrypt.hash(password, 10);
    })
    .then((hashedPassword) => {
      if (!hashedPassword) return;

      return db("admin_table").insert({
        first_name,
        last_name,
        email,
        password: hashedPassword,
      });
    })
    .then((insertResult) => {
      if (!insertResult) return;

      const [adminId] = insertResult;
      sendAdminIdToEmail(email, adminId);
      res.status(201).send("Admin registered successfully");
    })
    .catch((error) => {
      console.error(error);
      if (!res.headersSent) {
        res.status(500).send("Internal Server Error");
      }
    });
};

const sendAdminIdToEmail = (email, adminId) => {
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
    subject: "Your Admin ID",
    text: `Your Admin ID is: ${adminId}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = {
  signupAdmin,
};
