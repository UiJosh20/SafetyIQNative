const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const counterSchema = new Schema({
  model: String, // The name of the model using the counter
  sequence_value: Number,
});

const Counter = mongoose.model("Counter", counterSchema);

module.exports = Counter;
