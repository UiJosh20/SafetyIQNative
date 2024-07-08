const express = require("express");
const routerAdmin = express.Router();
const {signupAdmin, loginAdmin, getAdminInfo, getStudentsByAdmin, uploadResource, courseAdd, courseFetch} = require("../Controller/admin.controller");

routerAdmin.post("/signup", signupAdmin);
routerAdmin.post("/login", loginAdmin);
routerAdmin.get("/info/:id", getAdminInfo);
routerAdmin.get("/:id/students", getStudentsByAdmin);
routerAdmin.post("/upload", uploadResource);
routerAdmin.post("/courses", courseAdd);
routerAdmin.get("/courseFetch", courseFetch);

module.exports = routerAdmin;