/* eslint-disable strict */
const bcrypt = require('bcryptjs');
const AuthService = require('./auth/auth-service')
function authenticateToken(req, res, next) {
  let authToken = req.get('Authorization') || '';
  let basicToken;

  if (!authToken.toLowerCase().startsWith('basic')) {
    return res.status(401).json({ error: 'Missing Basic token'});
  } else {
    basicToken = authToken.slice('basic '.length, authToken.length);
  }

  const [tokenUserName, tokenPassword] = Buffer
    .from(basicToken, 'base64')
    .toString()
    .split(':');

  if(!tokenUserName || !tokenPassword) {
    return res.status(401).json({ error: 'Unauthorized request'});
  }

  req.app.get('db')('thingful_users')
    .where({ user_name: tokenUserName})
    .first()
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized request'});
      }
      return AuthService.comparePasswords(tokenPassword, user.password)
        .then(passwordsMatch => {
          if (!passwordsMatch) {
            return res.status(401).json({ error: 'Unauthorized request: Wrong Password' })
          }
        
          req.user = user;
          next();
        });
    })
    .catch(next);

}

module.exports = authenticateToken;