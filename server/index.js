const express = require("express");
const app = express();
const cors = require("cors");
const userRouter = require("./routes/user.route");
const adminRouter = require("./routes/admin.route");
const bodyParser = require("body-parser");
require("node-cron")
require("dotenv").config();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use("/", userRouter);
app.use("/admin", adminRouter);

app.listen(PORT, () => {
  console.log("The server running on port", PORT);
});
