const express = require("express");
const routerAdmin = express.Router();
const {signupAdmin, loginAdmin, getAdminInfo, getStudentsByAdmin} = require("../Controller/admin.controller");

routerAdmin.post("/signup", signupAdmin);
routerAdmin.post("/login", loginAdmin);
routerAdmin.get("/info/:id", getAdminInfo);
routerAdmin.get("/:id/students", getStudentsByAdmin);


module.exports = routerAdmin;