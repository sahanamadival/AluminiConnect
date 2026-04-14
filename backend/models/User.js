// models/User.js
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // ADD THESE FIELDS:
  skills: { type: [String], default: [] }, 
  bio: { type: String },
  graduationYear: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);