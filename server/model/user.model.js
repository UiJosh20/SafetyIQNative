const mongoose = require("mongoose")
require("dotenv").config()
const bcrypt = require("bcryptjs")
const URI = process.env.DATABASE_URL


mongoose
  .connect(URI)
  .then((response) => {
    console.log("user database has connected successfully!");
  })
  .catch((err) => {
    console.log(err);
    console.log("There is an error in the database");
  });


const userSchema = new mongoose.Schema({
  callupNum: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  middleName: {
    type: String,
    required: false,
  },
  tel: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, "Invalid email address"],
  },
  password: {
    type: String,
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  frpNum: {
    type: String,
    default: null, // Setting frpNum to null by default
  },
});


userSchema.pre("save", function (next) {
  bcrypt.hash(this.password, 10, (err, hash) => {
    this.password = hash;
    next();
  });
});


let userModel = mongoose.model("User", userSchema);

module.exports = userModel;
