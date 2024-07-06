const express = require("express");
const routerAdmin = express.Router();
const {signupAdmin} = require("../Controller/admin.controller");

routerAdmin.post("/signup", signupAdmin);


module.exports = routerAdmin;