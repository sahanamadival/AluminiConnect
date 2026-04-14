const Project = require('../models/Project');
const User = require('../models/User');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getRecommendedProjects = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const projects = await Project.find({ status: 'open' });

    // 1. Basic Filtering (Match projects that have at least one common skill)
    const matchedProjects = projects.filter(project => 
      project.requiredSkills.some(skill => user.skills.includes(skill))
    );

    // 2. AI Ranking (Optional: Use Gemini to explain WHY they match)
    // For now, let's return the matched list sorted by the number of matching skills
    const rankedProjects = matchedProjects.sort((a, b) => {
      const matchA = a.requiredSkills.filter(s => user.skills.includes(s)).length;
      const matchB = b.requiredSkills.filter(s => user.skills.includes(s)).length;
      return matchB - matchA;
    });

    res.json(rankedProjects);
  } catch (error) {
    res.status(500).json({ message: "Matching failed" });
  }
};

module.exports = { getRecommendedProjects };