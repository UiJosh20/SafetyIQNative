const db = require("../model/user.model");
const bcrypt = require("bcryptjs");
const signup = (req, res) => {
  
   const {
     callUpNo,
     firstName,
     lastName,
     middleName,
     telephoneNo,
     email,
     password,
   } = req.body;


   bcrypt.hash(password, 10)
   .then((hashedPassword) => {      
       const query = "INSERT INTO safetyiq_table (callUp_num, firstName, lastName, middleName, tel, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)";
       const values = [
         callUpNo,
         firstName,
         lastName,
         middleName,
         telephoneNo,
         email,
         hashedPassword,
       ];
     
       db.query(query, values, (err, results) => {
         if (err) {
           console.error("Error inserting user:", err);
           res.status(500).send("Internal Server Error");
           return;
         }
         res.send("User registered successfully");
       });
   })
 
};

module.exports = {
  signup,
};
