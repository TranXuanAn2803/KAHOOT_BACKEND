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

passport.use(
  new LocalStrategy(function verify(username, password, done) {
    console.log('userpass ', username, password, done);
    User.findOne({
      $or: [{ username: username }, { email: username }],
    })
      .then((user) => {
        console.log('userfind ', user);
        if (!user || user == null) {
          return res.status(401).send('Account not found');
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).send('Password is not valid');
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
              msg: 'Login successful',
              accessToken,
              refreshToken,
              username: user.username,
            });
          });
      })
      .catch((err) => {
        console.log('err ', err);
        return res.json({
          msg: 'Login Fail. Has Exception: ' + error.message,
          username: null,
          accessToken: null,
          refreshToken: null,
        });
      });
  })
);

// declare route
router.post('/register', authController.register);
router.post(
  '/login',
  passport.authenticate('local', function (req, res) {
    // res.send({});
    console.log('req res authenticate', req, res);
    return res;
  })
  //   console.log('req res outside ', req, res);
);
router.post('/refresh', authController.refreshToken);
router.post('/google', authController.googleLogin);
router.get('/confirm/:confirmationCode', authController.verifyEmail);
module.exports = router;
