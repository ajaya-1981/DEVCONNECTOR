const express = require('express');
const router = express.Router();

// @route   GET api/profile
// @route   Test route
// @route   Public
router.get('/', (req, res) => res.send('Profile Routes'));

module.exports = router;