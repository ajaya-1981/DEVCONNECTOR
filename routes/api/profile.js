const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authorize');
const { check, validationResult } = require('express-validator');
const config = require('config');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const request = require('request');
// @route   GET api/profile/me
// @desc    get current user profile
// @access  private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST  api/profile
// @desc    create or update user profile
// @access  private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is Required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin,
      } = req.body;

      // build profile object
      const profileFields = {};
      profileFields.user = req.user.id;
      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (location) profileFields.location = location;
      if (bio) profileFields.bio = bio;
      if (status) profileFields.status = status;
      if (githubusername) profileFields.githubusername = githubusername;
      if (skills)
        profileFields.skills = skills.split(',').map((skill) => skill.trim());

      // build social network
      profileFields.social = {};
      if (youtube) profileFields.social.youtube = youtube;
      if (facebook) profileFields.social.facebook = facebook;
      if (twitter) profileFields.social.twitter = twitter;
      if (instagram) profileFields.social.instagram = instagram;
      if (linkedin) profileFields.social.linkedin = linkedin;

      try {
        let profile = await Profile.findOne({ user: req.user.id });
        if (profile) {
          // update
          profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          );
          return res.json(profile);
        }
        // create
        profile = new Profile(profileFields);
        await profile.save();
        return res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
      //   console.log(profileFields);
      //   res.send('hello');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET  api/profile
// @desc    get all profile
// @access  public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.send(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET  api/profile/user/:user_id
// @desc    get profile by user id
// @access  public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      console.log(profile);
      return res.status(400).json({ msg: 'There is no profile for the user' });
    }
    res.send(profile);
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE  api/profile
// @desc    delete profile , user and posts
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // @to remove post

    // remove profile
    await Profile.findOneAndDelete({ user: req.user.id });

    // remove user
    await User.findOneAndDelete({ _id: req.user.id });

    res.json({ msg: ' User, Profile and Post(s) deleted' });
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT  api/profile/experience
// @desc    add profile experience
// @access  Private

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is Required').not().isEmpty(),
      check('company', 'Company is Required').not().isEmpty(),
      check('from', 'From Date is Required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    // await Profile.findOneAndUpdate()
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, company, location, from, to, current, description } =
      req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      res.status(500).send('Server Error');
      console.log(err.message);
    }
  }
);
// @route   DELETE  api/profile/experience/:exp_id
// @desc    delete experience from profile
// @access  Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    // get the remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).send('server Error');
    console.errro(err.message);
  }
});

// @route   PUT  api/profile/education
// @desc    add profile education
// @access  Private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is Required').not().isEmpty(),
      check('degree', 'Degree is Required').not().isEmpty(),
      check('fieldofstudy', 'Field of Study is Required').not().isEmpty(),
      check('from', 'From Date is Required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    // await Profile.findOneAndUpdate()
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      res.status(500).send('Server Error');
      console.log(err.message);
    }
  }
);
// @route   DELETE  api/profile/education/:edu_id
// @desc    delete education from profile
// @access  Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    // get the remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).send('server Error');
    console.errro(err.message);
  }
});
// @route   GET  api/profile/github/:username
// @desc    get user repors from Github
// @access  public

router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}$client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };
    console.log(options);
    await request(options, (error, response, body) => {
      if (error) {
        console.error(error);
      }
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No  git hub profile found ' });
      }
      
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server Error');
  }
});
module.exports = router;
