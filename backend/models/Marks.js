const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  assignedMarks: [
    {
      parameter: {
        type: String,
        enum: ["ideation", "execution", "viva-pitch", "presentation"],
        required: true,
      },
      marksVal: {
        type: Number,
        min: 0,
        max: 10,
        required: true,
      },
    },
  ],
  totalMarks: {
    type: Number,
    default: 0,
  },
  maximumMarks: {
    type: Number,
    default: 40,
  },
  assignedByMentor: {
    type: mongoose.Types.ObjectId,
    ref: "Mentor",
    required: true,
  },
  assignedToStudent: {
    type: mongoose.Types.ObjectId,
    ref: "Student",
    required: true,
  },
}, {
  versionKey: false,
});

// calculate totalMarks before saving
marksSchema.pre("save", function (next) {
  let totalMarks = 0;
  for (const i of this.assignedMarks) {
    totalMarks += i.marksVal;
  }
  this.totalMarks = totalMarks;
  next();
});

const marksModel = mongoose.model("Marks", marksSchema);
module.exports = marksModel;
