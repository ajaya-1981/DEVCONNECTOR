const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authorize');
const { check, validationResult } = require('express-validator');
// const config = require('config');
// const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
// @route   POST api/posts
// @route   Create a post
// @route   private
router.post(
  '/',
  [auth, [check('text', 'Text is Required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ error: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');
      console.log(user);
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      console.log(newPost);
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);
// @route   GET api/posts
// @route   get all posts
// @route   private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/posts/:id
// @route   get  posts by id
// @route   private

router.get('/:id', auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id).sort({ date: -1 });
    if (!posts) {
      return res.status(404).json({ msg: 'No post found for the user' });
    }
    res.json(posts);
  } catch (err) {
    if (!err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No post found for the user' });
    }
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/posts/:id
// @route   delete a posts
// @route   private

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    await post.remove();

    res.json({ msg: 'Post deleted successfully' });
  } catch (err) {
    if (!err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'No post found for the user' });
      }
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
module.exports = router;
