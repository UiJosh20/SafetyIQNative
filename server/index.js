const express = require("express")
const app = express()
const cors = require("cors");
const userRouter = require("./routes/user.route");
require('dotenv').config()
const PORT = process.env.PORT 

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", userRouter);

app.listen(PORT,()=>{
console.log("server running on port", PORT)
})