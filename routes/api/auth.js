const express = require('express');
const router = express.Router();

// @route   GET api/auth
// @route   Test route
// @route   Public
router.get('/', (req, res) => res.send('Auth Routes'));

module.exports = router;