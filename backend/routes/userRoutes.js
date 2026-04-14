const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUserProfile, getAlumniDirectory } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateUserProfile);
router.get('/alumni', protect, getAlumniDirectory);

module.exports = router;