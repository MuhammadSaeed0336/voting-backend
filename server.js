const mongoose = require("mongoose");
const express = require("express");
const Candidate = require("./Candidate");
const config = require("./config");
const cors = require("cors"); 

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

mongoose
  .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    // Start the server once MongoDB is connected
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Routes
app.get("/candidates", async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/candidates", async (req, res) => {
  try {
    const { name, party, age, education } = req.body;
    const candidate = new Candidate({ name, party, age, education });
    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/vote/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    candidate.score += 1;
    await candidate.save();
    res.json({ message: "Vote submitted successfully", candidate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
