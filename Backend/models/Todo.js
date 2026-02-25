const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  userTask: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Todo", todoSchema);