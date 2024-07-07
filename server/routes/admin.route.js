const express = require("express");
const routerAdmin = express.Router();
const {signupAdmin, loginAdmin, getAdminInfo} = require("../Controller/admin.controller");

routerAdmin.post("/signup", signupAdmin);
routerAdmin.post("/login", loginAdmin);
routerAdmin.get("/info/:id", getAdminInfo);


module.exports = routerAdmin;