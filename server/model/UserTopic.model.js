const mongoose = require("mongoose");

const userTopicSchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true },
  topic_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReadCourse",
    required: true,
  },
  topic_assigned:{
    type:String,
    required: true,
  },
  dateAssigned: { type: Date, default: Date.now },
});

const UserTopic = mongoose.model("UserTopic", userTopicSchema);

module.exports = UserTopic;
