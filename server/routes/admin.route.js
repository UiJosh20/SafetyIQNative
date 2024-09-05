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
  deleteResource,
  saveExamQuestion,
  getAllStudents,
  fetchAllResources,
} = require("../Controller/admin.controller");

const parser = require("../MulterConfig");

routerAdmin.post("/signup", signupAdmin);
routerAdmin.post("/login", loginAdmin);
// routerAdmin.get("/info/:id", getAdminInfo);
routerAdmin.get("/students", getAllStudents);
routerAdmin.post("/upload", uploadResource);
routerAdmin.post("/uploadRead", uploadRead);
routerAdmin.post("/course", courseAdd);
routerAdmin.get("/fetchCourse", fetchCourse);
routerAdmin.post("/readCourseAdd", readCourseAdd);
routerAdmin.delete("/course/:id", deleteCourse);
routerAdmin.delete("/readDelete/:id", deleteRead);
routerAdmin.delete("/resources/:resourceId", deleteResource);
routerAdmin.get("/fetchRead", fetchRead);
routerAdmin.get("/fetchResources", fetchAllResources);
routerAdmin.post("/examQuestion", saveExamQuestion);

module.exports = routerAdmin;
