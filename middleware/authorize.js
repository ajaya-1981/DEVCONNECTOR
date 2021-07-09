const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  //get token from header
  const token = req.header('x-auth-token');

  //check if token is present
  if (!token) {
    return res.status(401).json({ msg: 'No token , Authoriztion denied' });
  }

  // varify the token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecrets'));
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
