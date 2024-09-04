const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

mongoose
  .connect(URI)
  .then((response) => {
    console.log("admin database has connected successfully!");
  })
  .catch((err) => {
    console.log(err);
    console.log("There is an error in the database");
  });


const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
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
});

adminSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);

    this.password = hash;
    next();
  });
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
