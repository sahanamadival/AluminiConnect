const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/projectController');
const { getRecommendedProjects } = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/recommendations', protect, getRecommendedProjects);
router.route('/')
  .get(getProjects)        
  .post(protect, createProject);

module.exports = router;