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

    // 2. AI Ranking
    const rankedProjects = matchedProjects.sort((a, b) => {
      const matchA = a.requiredSkills.filter(s => user.skills.includes(s)).length;
      const matchB = b.requiredSkills.filter(s => user.skills.includes(s)).length;
      return matchB - matchA;
    });

    // We can add Gemini's reasoning to the best matches
    const topProjectsWithReasoning = await Promise.all(
      rankedProjects.slice(0, 5).map(async (project) => {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const prompt = `As a career advisor AI, write a very short one-sentence explanation (max 20 words) of why a student with these skills [${user.skills.join(', ')}] is a great fit for a project requiring these skills [${project.requiredSkills.join(', ')}]. Project description is: ${project.description}. Keep it encouraging.`;
          const result = await model.generateContent(prompt);
          const response = await result.response;
          return { ...project._doc, aiReasoning: response.text() };
        } catch (e) {
             console.error("Gemini AI error:", e);
             return { ...project._doc, aiReasoning: "Matches your skill profile." };
        }
      })
    );

    res.json(topProjectsWithReasoning);
  } catch (error) {
    res.status(500).json({ message: "Matching failed" });
  }
};

module.exports = { getRecommendedProjects };