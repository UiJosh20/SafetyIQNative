const db = require("../model/user.model");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const cloudinary = require("../CloudinaryConfig");
const multer = require("multer");
const path = require("path");
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

      console.log("Hashed Password:", hashedPassword);

      return db("admin_table")
        .insert({
          first_name,
          last_name,
          email,
          password: hashedPassword,
        })
        .returning("admin_id");
    })
    .then((insertResult) => {
      if (!insertResult || insertResult.length === 0) return;

      const adminId = insertResult[0].admin_id;
      console.log("Admin ID:", adminId);
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

const getAdminInfo = (req, res) => {
  const { id } = Number(req.params.id);

  console.log(req.params.id);

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
  const { id } = req.params;

  // Fetch students assigned to the admin

  db("safetyiq_table")
    .where({ admin_id: id })
    .select("user_id", "firstName", "lastName", "email", "tel", "course_name")
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        "Error: File upload only supports the following filetypes - " +
          filetypes
      );
    }
  },
}).single("image");

const uploadResource = (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err });
    }

    const { title, description, time_taken, note, course_id, admin_id } =
      req.body;
    const image = req.file ? req.file.path : null;

    if (image) {
      cloudinary.uploader
        .upload(image, { folder: "/resources/first_aid" })
        .then((uploadedImage) => {
          return db("resources_table").insert({
            title,
            description,
            time_taken,
            image: uploadedImage.secure_url,
            note,
            course_id,
            admin_id,
          });
        })
        .then(() => {
          res.status(201).json({ message: "Resource uploaded successfully" });
        })
        .catch((error) => {
          console.error("Error uploading resource:", error);
          res.status(500).json({ error: "Failed to upload resource" });
        });
    } else {
      db("resources_table")
        .insert({
          title,
          description,
          time_taken,
          image: null,
          note,
          course_id,
          admin_id,
        })
        .then(() => {
          res.status(201).json({ message: "Resource uploaded successfully" });
        })
        .catch((error) => {
          console.error("Error uploading resource:", error);
          res.status(500).json({ error: "Failed to upload resource" });
        });
    }
  });
};




const libStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const libUpload = multer({
  storage: libStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        "Error: File upload only supports the following filetypes - " +
          filetypes
      );
    }
  },
}).single("image");


const uploadRead = (req, res) => {
  libUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err });
    }

    const { title, description, time_taken, note, course_name, admin_id, user_id } =
      req.body;

      
    const image = req.file ? req.file.path : null;

    db("readcourse_table")
      .select("readcourse_id")
      .where({ name: course_name, admin_id, user_id })
      .first()
      .then((course) => {
        if (!course) {
          throw new Error(`Course with name ${course_name} does not exist.`);
        }

        const course_id = course.readcourse_id;

        if (image) {
          return cloudinary.uploader
            .upload(image, { folder: "/resources/readNote" })
            .then((uploadedImage) => {
              return db("read_table").insert({
                read_course: course_name,
                read_title: title,
                read_description: description,
                read_duration: time_taken,
                read_image: uploadedImage.secure_url,
                read_note: note,
                admin_id,
                user_id,
                readcourse_id: course_id,

              });
            });
        } else {
          return db("read_table").insert({
            read_title: title,
            read_description: description,
            read_duration: time_taken,
            read_image: null,
            read_note: note,
            read_course: course_name,
            admin_id,
            user_id,
            readcourse_id: course_id,
          });
        }
      })
      .then((response) => {
        res.status(201).json({ message: "Resource uploaded successfully" });
      })
      .catch((error) => {
        console.error("Error uploading resource:", error);
        res
          .status(500)
          .json({ error: error.message || "Failed to upload resource" });
      });
  });
};



const courseAdd = (req, res) => {
const { name, admin_id } = req.body;
// const userId = Array.isArray(user_id) ? user_id[0] : user_id;

db("courses_table")
  .insert({ name, admin_id })
  .then((insertResult) => {
    res
      .status(201)
      .json({ message: "Course added successfully", id: insertResult[0] });
  })
  .catch((error) => {
    console.error("Error adding course:", error);
    res.status(500).json({ message: "Internal Server Error" });
  });

};

const readCourseAdd = (req, res) => {
  const { name, admin_id, user_id } = req.body;
  db("readcourse_table")
    .insert({ name, admin_id, user_id })
    .then((insertResult) => {
      res
        .status(201)
        .json({ message: "Course added successfully", id: insertResult[0] });
    })
    .catch((error) => {
      console.error("Error adding course:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};

const deleteCourse = (req, res) => {
  const { id } = req.params;
  db("courses_table")
    .where({ id })
    .del()
    .then((deleteResult) => {
      if (deleteResult) {
        res.status(200).json({ message: "Course deleted successfully" });
      } else {
        res.status(404).json({ message: "Course not found" });
      }
    })
    .catch((error) => {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};



const fetchCourse = (req, res) => {
  const id = Number(req.params.id);
  if (id) {
    db("courses_table")
      .where({ admin_id: id })
      .then((courses_table) => {
        res.status(200).json(courses_table);
      })
      .catch((error) => {
        console.error("Error fetching courses_table:", error);
        res.status(500).json({ message: "Internal Server Error" });
      });
  } else {
    return res.status(400).json({ message: "Admin ID is required" });
  }
};

const fetchRead = (req, res) => {
  const id = Number(req.params.id);
  if (id) {
    db("readcourse_table")
      .where({ admin_id: id })
      .then((course) => {
        res.status(200).json(course);
      })
      .catch((error) => {
        console.error("Error fetching courses_table:", error);
        res.status(500).json({ message: "Internal Server Error" });
      });
  } else {
    return res.status(400).json({ message: "Admin ID is required" });
  }
};

const deleteRead = (req, res) => {
  const { id } = req.params;
  db("readcourse_table")
    .where({ readcourse_id: id })
    .del()
    .then((deleteResult) => {
      if (deleteResult) {
        res.status(200).json({ message: "Course deleted successfully" });
      } else {
        res.status(404).json({ message: "Course not found" });
      }
    })
    .catch((error) => {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};


const fetchReadResources = (req, res) => {
  const adminId = Number(req.query.adminId);

  if (isNaN(adminId)) {
    return res.status(400).json({ message: "Invalid Admin ID" });
  }

  db("read_table")
    .where({ admin_id: adminId })
    .then((resources) => {
      if (resources.length === 0) {
        return res
          .status(404)
          .json({ message: "No resources found for this admin" });
      }
      res.status(200).json(resources);
    })
    .catch((error) => {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};

const deleteResource = (req, res) => {
  const resourceId = req.params.resourceId;
  

  db("read_table")
    .where({ read_id: resourceId })
    .del()
    .then((count) => {
      if (count === 0) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.status(200).json({ message: "Resource deleted successfully" });
    })
    .catch((error) => {
      console.error("Error deleting resource:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};

saveExamQuestion = (req, res) => {
  const { question, options, correct_answer, course_id, admin_id } = req.body;

  // Validate input data
  if (!question || !options || !correct_answer || !course_id || !admin_id) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Insert the exam question into the database
  db("exam_questions")
    .insert({
      question: question,
      options: JSON.stringify(options), // Convert options to JSON string
      correct_answer: correct_answer,
      course_id: course_id,
      admin_id: admin_id,
    })
    .returning("*")
    .then((insertedRows) => {
      res.status(201).json({
        message: "Exam question saved successfully",
        data: insertedRows[0], // Return the inserted record
      });
    })
    .catch((error) => {
      console.error("Error saving exam question:", error);
      res
        .status(500)
        .json({ error: "An error occurred while saving the exam question" });
    });
};


module.exports = {
  signupAdmin,
  loginAdmin,
  getAdminInfo,
  getStudentsByAdmin,
  uploadResource,
  courseAdd,
  deleteCourse,
  fetchRead,
  readCourseAdd,
  fetchCourse,
  deleteRead,
  uploadRead,
  fetchReadResources,
  deleteResource,
  saveExamQuestion,
};
