const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var { User } = require('../user/user.model');
const bcrypt = require('bcrypt');
const jwtVariable = require('../../variables/jwt');
const authMethod = require('./auth.method');
const randToken = require('rand-token');
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
passport.use(
  new LocalStrategy(function verify(username, password, done) {
    User.findOne({
      $or: [{ username: username }, { email: username }],
    })
      .then((user) => {
        if (!user || user == null) {
          return done(null, { status: 401, data: 'Account not found' });
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
          return done(null, { status: 401, data: 'Password is not valid' });
        }
        const accessTokenLife =
          process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;
        const accessTokenSecret =
          process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;
        const dataForAccessToken = {
          username: user.username,
          email: user.email,
        };
        authMethod
          .generateToken(dataForAccessToken, accessTokenSecret, accessTokenLife)
          .then((accessToken) => {
            if (!accessToken) {
              return res.status(401).send('Login failed');
            }
            // create refresh token
            let refreshToken = randToken.generate(jwtVariable.refreshTokenSize);

            if (!user.refreshToken) {
              // create user regfresh token
              User.updateOne(
                { username: user.username },
                { refreshToken: refreshToken }
              );
            } else {
              refreshToken = user.refreshToken;
            }
            // return res.json({
            //   msg: 'Login successful',
            //   accessToken,
            //   refreshToken,
            //   username: user.username,
            // })
            return done(null, {
              status: 200,
              data: {
                msg: 'Login successful',
                accessToken,
                refreshToken,
                username: user.username,
              },
            });
          });
      })
      .catch((err) => {
        console.log('err ', err);
        return done(null, {
          status: 200,
          data: {
            msg: 'Login Fail. Has Exception: ' + error.message,
            username: null,
            accessToken: null,
            refreshToken: null,
          },
        });
      });
  })
);

// declare route
router.post('/register', authController.register);
router.post('/login', function (req, res) {
  passport.authenticate('local', function (err, responsePwd, info) {
    console.log('responsePwd ', responsePwd);
    const { status, data } = responsePwd;
    return res.status(status).json(data);
  })(req, res);
});
router.post('/refresh', authController.refreshToken);
router.post('/google', authController.googleLogin);
router.get('/confirm/:confirmationCode', authController.verifyEmail);
module.exports = router;
