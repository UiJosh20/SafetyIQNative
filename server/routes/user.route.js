const express = require("express");
const router = express.Router();
const {signup, paystackInit, paystackVerify, login, fetchResources, courseFetch, readCourses, readfetch, fetchCurrentTopic} = require("../Controller/user.controller");

router.post("/signup", signup);
router.post("/paystackinit", paystackInit);
router.get("/paystackverify", paystackVerify);
router.post("/login", login);
// router.post("/dashboard", dashboard);
router.get("/resources", fetchResources);
router.get("/read", readCourses);
router.get("/courseFetch", courseFetch);
router.get("/readFetch", readfetch);
router.get("/currentTopic", fetchCurrentTopic);



module.exports = router;