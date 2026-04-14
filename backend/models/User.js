// models/User.js
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // CRITICAL FOR NAVIGATION: Distinguishes between user types
  role: { 
    type: String, 
    enum: ['student', 'alumni'], 
    default: 'student',
    required: true 
  },

  // OBJECTIVE: Alumni Verification
  // Only verified alumni should be allowed to post projects
  isVerified: { type: Boolean, default: false },
  certificateUrl: { type: String }, // Link to their uploaded graduation certificate

  // OBJECTIVE: Skill-Gap Analysis
  // Students list their current skills here
  skills: { type: [String], default: [] }, 
  bio: { type: String },
  graduationYear: { type: Number },

  // Linked projects (Projects posted by Alumni or applied for by Students)
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);