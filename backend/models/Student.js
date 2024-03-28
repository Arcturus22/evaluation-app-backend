const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rollNo: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  assignedMentor: {
    type: mongoose.Types.ObjectId,
    ref: "Mentor",
    default: null,
  }
}, {
  versionKey: false,
});

const studentModel = mongoose.model("Student", studentSchema);
module.exports = studentModel;
