const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Links the project to a specific Alumni member
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: { type: [String], default: [] },
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'completed'], 
    default: 'open' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);