const express = require('express');
const router = express.Router();

// @route   GET api/posts
// @route   Test route
// @route   Public
router.get('/', (req, res) => res.send('Posts Routes'));

module.exports = router;