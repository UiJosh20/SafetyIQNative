const express = require("express");
const routerAdmin = express.Router();
const {
  signupAdmin,
  loginAdmin,
  getAdminInfo,
  getStudentsByAdmin,
  uploadResource,
  courseAdd,
  deleteCourse,
  addReadCourse,
  readCourseAdd,
  fetchCourse,
} = require("../Controller/admin.controller");

const parser = require("../MulterConfig");

routerAdmin.post("/signup", signupAdmin);
routerAdmin.post("/login", loginAdmin);
routerAdmin.get("/info/:id", getAdminInfo);
routerAdmin.get("/:id/students", getStudentsByAdmin);
routerAdmin.post("/upload", uploadResource);
routerAdmin.post("/course", courseAdd);
routerAdmin.get("/fetchCourse/:id", fetchCourse);
routerAdmin.post("/readCourseAdd", readCourseAdd);
routerAdmin.post("/readCourse", addReadCourse);
routerAdmin.delete("/course/:id", deleteCourse);

module.exports = routerAdmin;
