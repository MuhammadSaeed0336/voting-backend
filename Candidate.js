// models/Candidate.js
const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: true
  },
  party: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  education: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  status: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Candidate', candidateSchema);
