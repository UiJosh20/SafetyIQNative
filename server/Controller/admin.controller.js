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

const loginAdmin = (req, res) => {
  const { adminId, password } = req.body;

  db("admin_table")
    .where({ admin_id: adminId }) 
    .first()
    .then((admin) => {
      if (!admin) {
        return res
          .status(401)
          .json({ message: "Invalid Admin ID or Password" });
      }

      return bcrypt.compare(password, admin.password).then((isMatch) => {
        if (!isMatch) {
          return res
            .status(401)
            .json({ message: "Invalid Admin ID or Password" });
        }


        return res
          .status(200)
          .json({ message: "Login successful", adminId: admin.admin_id });
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
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


const getAdminInfo = (req, res) => {
  const { id } = req.params;

  db("admin_table")
    .where({ admin_id: id })
    .first()
    .then((admin) => {
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      const { first_name, last_name, admin_id } = admin;
      res.status(200).json({ first_name, last_name, admin_id });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
};



const getStudentsByAdmin = (req, res) => {
  const { adminId } = req.params;

  // Fetch students assigned to the admin
  db("safetyiq_table")
    .where({ admin_id: adminId })
    .select("user_id", "firstName", "lastName", "email", "tel")
    .then((students) => {
      // Fetch total number of students
      db("safetyiq_table")
        .count("user_id as totalStudents")
        .first()
        .then((countResult) => {
          res.status(200).json({
            students,
            totalStudents: countResult.totalStudents,
          });
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
};

module.exports = {
  signupAdmin,
  loginAdmin,
  getAdminInfo,
  getStudentsByAdmin,
};
