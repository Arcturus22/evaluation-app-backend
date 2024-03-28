const express = require("express");
const router = express.Router();

const Student = require("../models/Student");

// create a new student in DB
router.post("/createStudent", async (req, res) => {
  try {
    const { name, rollNo, email } = req.body;
    const student = await Student.findOne({ $or: [{ rollNo: rollNo }, { email: email }] });
    if (student)
      return res.status(200).json({ error: "A student with same roll no./email already exists" });
    const newStudent = await Student.create({ name, rollNo, email });
    return res.status(200).json(newStudent.toJSON());
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// fetch all unassigned students
router.get("/unassignedStudents", async (req, res) => {
  try {
    const unassignedStudents = await Student.find({ assignedMentor: { $in: [null, undefined] } });
    return res.status(200).json(unassignedStudents);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const Mentor = require("../models/Mentor");

// fetch all students assigned to a mentor
router.get("/:mentorId/assignedStudents", async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentor = await Mentor.findById(mentorId).populate("assignedStudents");
    if (!mentor)
      return res.status(404).json({ message: "Mentor not found" });
    const assignedStudents = mentor.assignedStudents;
    return res.json(assignedStudents);
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// assign a new student to this mentor
router.post("/:mentorId/assignStudent", async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { studentId } = req.body;
    const mentor = await Mentor.findById(mentorId);
    const student = await Student.findById(studentId);
    if (!mentor)
      return res.status(400).json({ message: "Mentor not found" });
    if (!student)
      return res.status(400).json({ message: "Student not found" });
    if (student.assignedMentor) {
      if (student.assignedMentor.equals(mentorId))
        return res.status(400).json({ message: "Student already assigned to this mentor" });
      return res.status(400).json({ message: "Student already assigned to another mentor" });
    }
    mentor.assignedStudents.push(studentId);
    await mentor.save();
    student.assignedMentor = mentorId;
    await student.save();
    return res.status(200).json({ mentor, student });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const axios = require("axios");

// edit a student assigned to this mentor
router.post("/:mentorId/editStudent", async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { oldStudentId, newStudentId } = req.body;
    const mentor = await Mentor.findById(mentorId);
    const oldStudent = await Student.findById(oldStudentId);
    const newStudent = await Student.findById(newStudentId);
    if (!mentor)
      return res.status(400).json({ error: "Mentor not found" });
    if (!oldStudent)
      return res.status(400).json({ error: "Old student not found" });
    if (!newStudent)
      return res.status(400).json({ error: "New student not found" });
    if (!(oldStudent.assignedMentor && oldStudent.assignedMentor.equals(mentorId)))
      return res.status(400).json({ error: "Old student not assigned to this mentor" });
    if (newStudent.assignedMentor) {
      if (newStudent.assignedMentor.equals(mentorId))
        return res.status(400).json({ message: "New student already assigned to this mentor" });
      return res.status(400).json({ message: "New student already assigned to another mentor" });
    }
    mentor.assignedStudents = mentor.assignedStudents.map((studentId) =>
      studentId.equals(oldStudentId) ? newStudentId : studentId
    );
    await mentor.save();
    oldStudent.assignedMentor = null;
    await oldStudent.save();
    newStudent.assignedMentor = mentorId;
    await newStudent.save();
    await axios.post(`~/marks/${mentorId}/removeMarks`, { oldStudentId }); // ---
    return res.status(200).json({ mentor, oldStudent, newStudent });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// remove a student assigned to this mentor
router.post("/:mentorId/removeStudent", async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { studentId } = req.body;
    const mentor = await Mentor.findById(mentorId);
    const student = await Student.findById(studentId);
    if (!mentor)
      return res.status(400).json({ error: "Mentor not found" });
    if (!student)
      return res.status(400).json({ error: "Student not found" });
    if (!(student.assignedMentor && student.assignedMentor.equals(mentorId)))
      return res.status(400).json({ error: "Student not assigned to this mentor" });
    mentor.assignedStudents = mentor.assignedStudents.filter((student) =>
      !student._id.equals(studentId)
    );
    await mentor.save();
    student.assignedMentor = null;
    await student.save();
    await axios.post(`~/marks/${mentorId}/removeMarks`, { studentId }); // ---
    return res.status(200).json({ mentor, student });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
