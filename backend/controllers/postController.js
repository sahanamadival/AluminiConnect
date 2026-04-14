const Post = require('../models/Post');

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

const createPost = async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    // Uses a dynamic gorgeous placeholder if no valid image string was provided
    const dynamicImage = imageUrl && imageUrl.trim().length > 0 ? imageUrl : `https://picsum.photos/seed/${Date.now()}/800/800`;
    
    const post = await Post.create({
      author: req.user._id,
      authorName: req.user.name,
      content,
      imageUrl: dynamicImage
    });
    res.status(201).json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating post' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const isLiked = post.likes.includes(req.user._id);
    if (isLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
    }
    
    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling like' });
  }
};

const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const { text } = req.body;
    post.comments.push({ user: req.user._id, name: req.user.name, text });
    await post.save();
    res.json({ comments: post.comments });
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
};

module.exports = { getPosts, createPost, toggleLike, addComment };
