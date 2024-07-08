const express = require("express");
const router = express.Router();
const {signup, paystackInit, paystackVerify, login, dashboard, updateProfilePic,  fetchResources} = require("../Controller/user.controller");

router.post("/signup", signup);
router.post("/paystackinit", paystackInit);
router.get("/paystackverify", paystackVerify);
router.post("/login", login);
router.post("/dashboard", dashboard);
router.get("/resources", fetchResources);



module.exports = router;