const express = require("express");
const routerAdmin = express.Router();
const {
  signupAdmin,
  loginAdmin,
  getAdminInfo,
  getStudentsByAdmin,
  uploadResource,
  courseAdd,
  courseFetch,
  deleteCourse,
} = require("../Controller/admin.controller");

const parser = require("../MulterConfig");

routerAdmin.post("/signup", signupAdmin);
routerAdmin.post("/login", loginAdmin);
routerAdmin.get("/:id", getAdminInfo);
routerAdmin.get("/:id/students", getStudentsByAdmin);
routerAdmin.post("/upload", parser.single("file"), uploadResource); // Updated route to use multer for file uploads
routerAdmin.post("/course", courseAdd);
routerAdmin.get("/coursesFetch", courseFetch);
routerAdmin.delete("/course/:id", deleteCourse);

module.exports = routerAdmin;
