const express = require("express");
const router = express.Router();
const {signup, paystackInit, paystackVerify} = require("../Controller/user.controller");

router.post("/signup", signup);
router.post("/paystackinit", paystackInit);
router.get("/paystackverify", paystackVerify);


module.exports = router;