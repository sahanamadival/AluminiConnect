const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

router.get('/:projectId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ project: req.params.projectId })
      .populate('sender', 'name role')
      .sort('createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

module.exports = router;
