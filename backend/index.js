+require("dotenv").config();

// mongo connection
const connectToMongo = require("./db");
connectToMongo();

const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const mentorRoutes = require("./routes/mentor");
const studentRoutes = require("./routes/student");
const marksRoutes = require("./routes/marks");

app.use("/mentor", mentorRoutes);
app.use("/student", studentRoutes);
app.use("/marks", marksRoutes);

// server
const port = process.env.PORT;
app.listen(port, () => {
    console.log("Node server running on port: " + port);
});
