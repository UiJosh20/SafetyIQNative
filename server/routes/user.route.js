const express = require("express");
const router = express.Router();
const {signup, paystackInit, paystackVerify, login, fetchResources, courseFetch, readCourses, readfetch, fetchCurrentTopic, fetchExamQuestions, submitExam, fetchUserResult, completedCourse, getCompletedTopic} = require("../Controller/user.controller");

router.post("/signup", signup);
router.post("/paystackinit", paystackInit);
router.get("/paystackverify", paystackVerify);
router.post("/login", login);
router.get("/resources", fetchResources);
router.get("/read", readCourses);
router.get("/courseFetch", courseFetch);
router.get("/currentTopic/:user", fetchCurrentTopic);
router.get("/examQuestions", fetchExamQuestions);
router.post("/submitExam", submitExam);
router.get("/result/:user", fetchUserResult)
router.post("/completeCourse", completedCourse);
router.get("/getcomplete/:user", getCompletedTopic);




module.exports = router;