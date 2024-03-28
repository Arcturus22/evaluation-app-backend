const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  assignedStudents: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Student",
    },
  ],
}, {
  versionKey: false,
});

const mentorModel = mongoose.model("Mentor", mentorSchema);
module.exports = mentorModel;
