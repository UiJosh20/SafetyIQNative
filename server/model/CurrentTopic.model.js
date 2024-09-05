const mongoose = require("mongoose");

const currentTopicSchema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReadCourse",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CurrentTopic", currentTopicSchema);
