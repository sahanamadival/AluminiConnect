const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to create a Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// --- KEEP YOUR EXISTING REGISTER LOGIC ---
const registerUser = async (req, res) => {
  // ... (your existing registration code)
};

// --- ADD THE LOGIN LOGIC HERE ---
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // bcrypt.compare checks the plain text password against the hashed one in DB
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    user.skills = req.body.skills || user.skills; // Expecting an array like ["React", "Node.js"]

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      skills: updatedUser.skills,
      bio: updatedUser.bio
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};


module.exports = { registerUser, loginUser, updateUserProfile };

