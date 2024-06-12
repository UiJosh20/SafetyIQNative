const express = require("express")
const app = express()
const cors = require("cors");
const userRouter = require("./routes/user.route");
const bodyParser = require("body-parser");
const path = require("path");
require('dotenv').config()
const PORT = process.env.PORT 

app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use("/", userRouter);


app.listen(PORT,()=>{
console.log("The server running on port", PORT)
})