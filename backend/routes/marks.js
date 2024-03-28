const express = require("express");
const router = express.Router();

const Marks = require("../models/Marks");
const Mentor = require("../models/Mentor");
const Student = require("../models/Student");

/*
// helper func
const isValidAassignedMarks = (assignedMarks) => {
  let isValid = true;

  if (!Array.isArray(assignedMarks)) {
    isValid = false;
  }

  for (const item of assignedMarks) {
    if (!(typeof item === 'object' &&
      Object.keys(item).length === 2 &&
      item.hasOwnProperty('parameter') &&
      typeof item.parameter === 'string' &&
      item.hasOwnProperty('marks') &&
      typeof item.marks === 'number')) {

      isValid = false;
      break;
    }
  }

  if (assignedMarks.length !== 4) {
    isValid = false;
  }

  const parameterValues = ["ideation", "execution", "viva-pitch", "presentation"];

  for (const item of assignedMarks) {
    const { parameter, marks } = item;

    if(!(parameterValues.includes(parameter) && 0 <= marks && marks <= 10)) {
      isValid = false;
      break;
    }
  }
  
  return isValid;
};
*/

// create a new marks entry in DB
router.post("/createMarks", async (req, res) => {
  try {
    const { assignedMarks, assignedByMentor, assignedToStudent } = req.body;
    const mentor = await Mentor.findById(assignedByMentor);
    const student = await Student.findById(assignedToStudent);
    if (!mentor)
      return res.status(400).json({ error: "Mentor not found" });
    if (!student)
      return res.status(400).json({ error: "Student not found" });
    if (!(student.assignedMentor && student.assignedMentor.equals(assignedByMentor)))
      return res.status(200).json({ error: "Student not assigned to this mentor" });
    const marks = await Marks.findOne({ $and: [{ assignedByMentor: assignedByMentor }, { assignedToStudent: assignedToStudent }] });
    if (marks)
      return res.status(400).json({ error: "Mentor already assigned marks to this student" });
    const newMarks = await Marks.create({ assignedMarks, assignedByMentor, assignedToStudent });
    return res.status(200).json({ newMarks });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// assign marks
router.post("/:mentorId/assignMarks", async (req, res) => {
  try {
    const { assignedByMentor } = req.params;
    const { assignedMarks, assignedToStudent } = req.body;
    const mentor = await Mentor.findById(assignedByMentor);
    const student = await Student.findById(assignedToStudent);
    if (!mentor)
      return res.status(400).json({ error: "Mentor not found" });
    if (!student)
      return res.status(400).json({ error: "Student not found" });
    if (!(student.assignedMentor && student.assignedMentor.equals(assignedByMentor)))
      return res.status(200).json({ error: "Student not assigned to this mentor" });
    const marks = await Marks.findOne({ $and: [{ assignedByMentor: assignedByMentor }, { assignedToStudent: assignedToStudent }] });
    if (marks)
      return res.status(400).json({ error: "Mentor already assigned marks to this student" });
    const newMarks = await Marks.create({ assignedMarks, assignedByMentor, assignedToStudent });
    return res.status(200).json({ newMarks });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// update marks
router.post("/:mentorId/updateMarks", async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { assignedMarks, studentId } = req.body;
    const mentor = await Mentor.findById(mentorId);
    if (!mentor)
      return res.status(404).json({ error: "Mentor not found" });
    const student = await Student.findById(studentId);
    if (!student)
      return res.status(404).json({ error: "Student not found" });
    if (!(student.assignedMentor && student.assignedMentor.equals(mentorId)))
      return res.status(400).json({ error: "Student not assigned to this mentor" });
    const marks = await Marks.findOne({ $and: [{ assignedByMentor: mentorId }, { assignedToStudent: studentId }] });
    if (!marks)
      return res.status(400).json({ error: "Mentor hasn't assigned marks to this student" });
    const newMarks = await Marks.findOneAndUpdate(
      { assignedByMentor: mentorId, assignedToStudent: studentId },
      { assignedMarks },
      { new: true },
    );
    return res.status(200).json(newMarks.toJSON());
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// remove marks
router.post("/:mentorId/removeMarks", async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { studentId } = req.body;
    const mentor = await Mentor.findById(mentorId);
    if (!mentor)
      return res.status(404).json({ error: "Mentor not found" });
    const student = await Student.findById(studentId);
    if (!student)
      return res.status(404).json({ error: "Student not found" });
    if (!(student.assignedMentor && student.assignedMentor.equals(mentorId)))
      return res.status(400).json({ error: "Student not assigned to this mentor" });
    const marks = await Marks.findOne({ $and: [{ assignedByMentor: mentorId }, { assignedToStudent: studentId }] });
    if (!marks)
      return res.status(400).json({ error: "This mentor hasn't assigned marks to this student" });
    await Marks.findOneAndDelete({ $and: [{ assignedByMentor: mentorId }, { assignedToStudent: studentId }] });
    return res.status(200).json({ success: "Marks deleted successfully" });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// filter for students with assigned marks
router.get("/:mentorId/assignedMarksStudents", async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentor = await Mentor.findById(mentorId).populate("assignedStudents");
    if (!mentor)
      return res.status(404).json({ error: "Mentor not found" });
    const assignedStudents = mentor.assignedStudents;
    const assignedMarksStudents = [];
    for (const student of assignedStudents) {
      const marks = await Marks.findOne({ $and: [{ assignedByMentor: mentorId }, { assignedToStudent: student._id }] });
      if (marks)
        assignedMarksStudents.push(student);
    }
    return res.status(200).json({ assignedMarksStudents });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// filter for students with unassigned marks
router.get("/:mentorId/unassignedMarksStudents", async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentor = await Mentor.findById(mentorId).populate("assignedStudents");
    if (!mentor)
      return res.status(404).json({ error: "Mentor not found" });
    const assignedStudents = mentor.assignedStudents;
    const unassignedMarksStudents = [];
    for (const student of assignedStudents) {
      const marks = await Marks.findOne({ $and: [{ assignedByMentor: mentorId }, { assignedToStudent: student._id }] });
      if (!marks)
        unassignedMarksStudents.push(student);
    }
    return res.status(200).json({ unassignedMarksStudents });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
