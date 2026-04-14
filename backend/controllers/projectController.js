const Project = require('../models/Project');

const createProject = async (req, res) => {
  const { title, description, requiredSkills } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Please add a title and description' });
  }

  const project = await Project.create({
    user: req.user._id, // Taken from the protect middleware
    title,
    description,
    requiredSkills,
  });

  res.status(201).json(project);
};


const getProjects = async (req, res) => {
  const projects = await Project.find({}).populate('user', 'name email');
  res.json(projects);
};

module.exports = { createProject, getProjects };