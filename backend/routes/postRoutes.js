const express = require('express');
const router = express.Router();
const { getPosts, createPost, toggleLike, addComment } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);

module.exports = router;
