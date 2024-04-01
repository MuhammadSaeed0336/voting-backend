require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const Candidate = require("./Candidate");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// Middleware to enable CORS
app.use(cors());
app.use(express.json());

const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("A client connected");

  // Example: Broadcasting to all clients
  // socket.on("example_event", (data) => {
  //   io.emit("example_event", data);
  // });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

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

// app.get("/vote/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const candidate = await Candidate.findById(id);
//     if (!candidate) {
//       return res.status(404).json({ message: "Candidate not found" });
//     }
//     candidate.score += 1;
//     await candidate.save();

//     io.emit("vote_updated", {
//       candidateId: candidate._id,
//       newScore: candidate.score,
//     });

//     res.json({ message: "Vote submitted successfully", candidate });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

app.put("/voting/status", async (req, res) => {
  try {
    const { status } = req.body;
    await Candidate.updateMany({}, { $set: { status } });

    io.emit("voting_status_updated", { status });

    res.json({ message: "Voting status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get("/vote/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const candidate = await Candidate.findById(id);
    if (!candidate.status) {
      return res.status(400).json({ message: "Voting is disabled" });
    }

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }


    candidate.score += 1;
    candidate.status = false; 

    await candidate.save();

    io.emit("vote_updated", {
      candidateId: candidate._id,
      newScore: candidate.score,
    });

    res.json({ message: "Vote submitted successfully", candidate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
