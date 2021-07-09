const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// get the data model of user

const User = require('../../models/User');
// @route   POST api/users
// @desc    Test route
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is Required').not().isEmpty(),
    check('email', 'Please include a valid email ').isEmail(),
    check(
      'password',
      'Please a enter a password with 6 or more digits'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { name, email, password } = req.body;
    try {
      // see if user exists
      let user = await User.findOne({ email: email });
      if (user) {
        return res.status(400).json({ error: [{ message: 'User already exists' }] });
      }

      // get users gravatars
      const avatar = await gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });
      // encrypt the passwords

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      // return json web token
      res.send('User registered');
    } catch (err) {
      console.error(err.message);
      res.status(500, send('Server Error'));
    }
  }
);

module.exports = router;
