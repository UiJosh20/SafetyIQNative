const express = require("express");
const routerAdmin = express.Router();
const {
  signupAdmin,
  loginAdmin,
  // getAdminInfo,
  uploadResource,
  courseAdd,
  deleteCourse,
  readCourseAdd,
  fetchCourse,
  fetchRead,
  deleteRead,
  uploadRead,
  fetchReadResources,
  deleteResource,
  saveExamQuestion,
  getAllStudents,
} = require("../Controller/admin.controller");

const parser = require("../MulterConfig");

routerAdmin.post("/signup", signupAdmin);
routerAdmin.post("/login", loginAdmin);
// routerAdmin.get("/info/:id", getAdminInfo);
routerAdmin.get("/students", getAllStudents);
routerAdmin.post("/upload", uploadResource);
routerAdmin.post("/uploadRead", uploadRead);
routerAdmin.post("/course", courseAdd);
routerAdmin.get("/fetchCourse/:id", fetchCourse);
routerAdmin.post("/readCourseAdd", readCourseAdd);
routerAdmin.delete("/course/:id", deleteCourse);
routerAdmin.delete("/readDelete/:id", deleteRead);
routerAdmin.delete("/resources/:resourceId", deleteResource);
routerAdmin.get("/fetchRead/:id/:user_id", fetchRead);
routerAdmin.get("/fetchResources", fetchReadResources);
routerAdmin.post("/examQuestion", saveExamQuestion);

module.exports = routerAdmin;
