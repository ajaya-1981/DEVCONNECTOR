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
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
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

// @route   PUT api/posts/unlikes/:id
// @route   like a posts
// @route   private
router.put('/likes/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: ' Post already liked' });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/posts/unlike/:id
// @route   unlike a posts
// @route   private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if the post is already liked by the user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: ' Post has not yet been liked' });
    }
    // get remove index
    const deleteIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(deleteIndex, 1);
    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/posts/comment/:id
// @route   Create a post comments
// @route   private
router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is Required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ error: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newcomment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newcomment);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/posts/comment/:id/: comment_id
// @route   delete a comments from post
// @route   private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    if (!comment) {
      return res.status(400).json({ msg: 'comment does not exists' });
    }
    //check user
    if (comment.user.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ msg: 'user is not authorized to delete the comment' });
    }

    // get remove index
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;
