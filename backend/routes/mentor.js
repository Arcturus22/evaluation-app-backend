const express = require("express");
const router = express.Router();

const Mentor = require("../models/Mentor");

// create a new mentor in DB
router.post("/createMentor", async (req, res) => {
  try {
    const { name, email } = req.body;
    const mentor = await Mentor.findOne({ email: email });
    if (mentor)
      return res.status(200).json({ error: "A mentor with same email already exists" });
    const newMentor = await Mentor.create({ name, email });
    return res.status(200).json(newMentor.toJSON());
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
