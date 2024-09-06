const bcrypt = require("bcryptjs");
const mongoose = require("mongoose")
const User = require("../model/user.model");
const ObjectId = mongoose.Types.ObjectId;
const nodemailer = require("nodemailer");
const cloudinary = require("../CloudinaryConfig");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const {
  Admin,
  Resource,
  Read,
  Course,
  readCourse,
  ExamQuestion,
} = require("../model/Admin.model");
const Counter = require("../model/Counter.model");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASS;

// Function to get the next sequence value for admin ID
const getNextAdminId = () => {
  return Counter.findOneAndUpdate(
    { model: "Admin" },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  ).then((counter) => `admin${counter.sequence_value}`);
};

const signupAdmin = (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  Admin.findOne({ email })
    .then((existingAdmin) => {
      if (existingAdmin) {
        return res.status(409).json({ message: "Email already used" });
      }

      return bcrypt.hash(password, 10);
    })
    .then((hashedPassword) => {
      if (!hashedPassword) return;

      return getNextAdminId().then((adminId) => {
        return Admin.create({
          admin_id: adminId,
          first_name,
          last_name,
          email,
          password: hashedPassword,
        });
      });
    })
    .then((newAdmin) => {
      const adminId = newAdmin.admin_id;
      sendAdminIdToEmail(req.body.email, adminId);
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

  Admin.findOne({ admin_id: adminId })
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

        return res.status(200).json({ message: "Login successful", admin });
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
};

const getAllStudents = (req, res) => {
  User.find({})
    .select("user_id firstName lastName email tel courseName")
    .then((students) => {
      const totalStudents = students.length;
      res.status(200).json({ totalStudents, students });
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
  // Handle file upload with multer
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err });
    }

    const {
      course_name,
      title,
      description,
      time_taken,
      note,
    } = req.body;

    const image = req.file ? req.file.path : null;

    const resourceData = {
      course : course_name,
      title,
      description,
      time_taken,
      note,
    };

    if (image) {
      cloudinary.uploader
        .upload(image, { folder: "/resources/first_aid" })
        .then((uploadedImage) => {
          resourceData.image = uploadedImage.secure_url;
          const newResource = new Resource(resourceData);
          return newResource.save();
        })
        .then(() => {
          res.status(201).json({ message: "Resource uploaded successfully" });
        })
        .catch((error) => {
          console.error("Error uploading resource:", error);
          res.status(500).json({ error: "Failed to upload resource" });
        });
    } else {
      const newResource = new Resource(resourceData);
      newResource
        .save()
        .then(() => {
          res.status(201).json({ message: "Resource uploaded successfully" });
        })
        .catch((error) => {
          console.error("Error saving resource:", error);
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

    const {
      title,
      description,
      time_taken,
      note,
      course_name
    } = req.body;

    

    const image = req.file ? req.file.path : null;

    const readData = {
      read_title: title,
      read_description: description,
      read_duration: time_taken,
      read_note: note,
      read_course: course_name

    };

    if (image) {
      cloudinary.uploader
        .upload(image, { folder: "/resources/readNote" })
        .then((uploadedImage) => {
          readData.read_image = uploadedImage.secure_url;
          const newRead = new Read(readData);
          return newRead.save();
        })
        .then(() => {
          res.status(201).json({ message: "Resource uploaded successfully" });
        })
        .catch((error) => {
          console.error("Error uploading resource:", error);
          res
            .status(500)
            .json({ error: error.message || "Failed to upload resource" });
        });
    } else {
      const newRead = new Read(readData);
      newRead
        .save()
        .then(() => {
          res.status(201).json({ message: "Resource uploaded successfully" });
        })
        .catch((error) => {
          console.error("Error saving resource:", error);
          res
            .status(500)
            .json({ error: error.message || "Failed to upload resource" });
        });
    }
  });
};


const courseAdd = (req, res) => {
  const { name, admin_id } = req.body;
  // const userId = Array.isArray(user_id) ? user_id[0] : user_id;

  const newCourse = new Course({
    name,
    admin_id: admin_id,
  });

  newCourse
    .save()
    .then((course) => {
      res.status(201).json({
        message: "Course added successfully",
        id: course._id,
        name: course.name,
      });
    })
    .catch((error) => {
      console.error("Error adding read course:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};


const readCourseAdd = (req, res) => {
  const { name, admin_id } = req.body;



  const newReadCourse = new readCourse({
    name,
    admin_id: admin_id,
  });

  newReadCourse
    .save()
    .then((course) => {
      res.status(201).json({
        message: "Read course added successfully",
        id: course._id,
        name: course.name,
      });
    })
    .catch((error) => {
      console.error("Error adding read course:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};



const fetchCourse = (req, res) => {
Course.find({})
  .then((courses) => {
    res.status(200).json(courses);
  })
  .catch((error) => {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Internal Server Error" });
  });
};

const fetchRead = (req, res) => {
 readCourse.find({})
   .then((courses) => {    
     res.status(200).json(courses);
   })
   .catch((error) => {
     console.error("Error fetching courses:", error);
     res.status(500).json({ message: "Internal Server Error" });
   });
};



const fetchAllResources = (req, res) => {
  Promise.all([
    Read.find({}).lean(),         
    Resource.find({}).lean()      
  ])
    .then(([readResources, generalResources]) => {
      const allResources = [...readResources, ...generalResources];

      // Check if resources exist
      if (allResources.length === 0) {
        return res.status(404).json({ message: "No resources found" });
      }

      // Send combined resources as a response
      res.status(200).json(allResources);
    })
    .catch((error) => {
      console.error("Error fetching resources:", error);

      // Handle potential server errors properly
      res.status(500).json({ message: "Internal Server Error" });
    });
};


const deleteCourse = (req, res) => {
   const { id } = req.params;

   Course
     .deleteOne({ name: id })
     .then((deletedResource) => {
       if (!deletedResource) {
         return res.status(404).json({ message: "Resource not found" });
       }
       res.json({ message: "Course deleted successfully" });
     })
     .catch((error) => {
       console.error("Error deleting resource:", error);
       res.status(500).json({ message: "Error deleting resource" });
     });
};

const deleteRead = (req, res) => {
  const { courseTopic } = req.params;
  

   readCourse
     .deleteOne({ name: courseTopic })
     .then((deletedResource) => {
       if (!deletedResource) {
         return res.status(404).json({ message: "Resource not found" });
       }
       res.json({ message: "Read course deleted successfully" });
     })
     .catch((error) => {
       console.error("Error deleting resource:", error);
       res.status(500).json({ message: "Error deleting resource" });
     });
};

const deleteResource = (req, res) => {
    const { title } = req.params;
    if (!title) {
      return res.status(400).json({ message: "Resource title is required" });
    }

    // Delete resource by title from both Read and Resource models
    Promise.all([
      Read.deleteOne({ read_title: title }),
      Resource.deleteOne({ title: title }),
    ])
      .then(([readResult, resourceResult]) => {
        const totalDeleted =
          readResult.deletedCount + resourceResult.deletedCount;

        // Check if any resource was deleted
        if (totalDeleted === 0) {
          return res.status(404).json({ message: "Resource not found" });
        }

        res.status(200).json({ message: "Resource(s) deleted successfully" });
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
  // getAdminInfo,
getAllStudents,
  uploadResource,
  courseAdd,
  deleteCourse,
  fetchRead,
  readCourseAdd,
  fetchCourse,
  deleteRead,
  uploadRead,
  fetchAllResources,
  deleteResource,
  saveExamQuestion,
};
