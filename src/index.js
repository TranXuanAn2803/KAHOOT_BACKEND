// npm i && npm start

const dotenv = require('dotenv');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const config = require('../config/config').getConfig();
const authRouter = require('./auth/auth.route');
const userRouter = require('./user/user.route');
const groupRouter = require('./group/group.route');
const presentationRouter = require('./presentation/presentation.route');
const slideRouter = require('./slide/slide.route');
const { socketSetup } = require('./socket-server');
const passport = require('passport');
const session = require('express-session');
const logger = require('morgan');
const { User } = require('./user/user.model');
const http = require('http');
const httpServer = http.createServer(app);
const LocalStrategy = require('passport-local').Strategy;

//config cors
const corsOptions = {
  origin: '*',
};

//intialize port
const PORT = config.PORT;

//config dotenv
dotenv.config({ path: '../.env' });
//config db
require('../config/database');

// app use library
app.use(cors(corsOptions));
app.use(cookieParser());
// only send 1 bracket
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// passport.use(User.createStrategy());
app.use(
  session({
    secret: 'secret',
    cookie: { maxAge: 60000000 },
    resave: false,
    saveUninitialized: true,
    expires: { maxAge: 60000000 },
  })
);
app.use(passport.initialize());
app.use(passport.session());
// Only necessary when using sessions.
// This tells Passport how to turn the user ID we serialize in the session cookie
// back into the actual User record from our Mongo database.
// Here, we simply find the user with the matching ID and return that.
// This will cause the User record to be available on each authenticated request via the req.user property.
passport.deserializeUser(function (userId, done) {
  db.User.findById(userId)
    .then(function (user) {
      done(null, user);
    })
    .catch(function (err) {
      done(err);
    });
});
app.use(logger('common'));

app.get('/', (req, res) => {
  res.send('This is service of our project . Today is ' + new Date());
});

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/group', groupRouter);
app.use('/presentation', presentationRouter);
app.use('/slide', slideRouter);

app.use('/', (req, res) => {
  res.status(404).send({ url: req.originalUrl + ' not found' });
});

// app
//   .listen(PORT)
//   .on("error", (err) => {
//     socketSetup();

//     console.log("✘ Application failed to start");
//     console.error("✘", err.message);
//     process.exit(0);
//   })
//   .on("listening", () => {
//     console.log(`Server start listening port: http://localhost:${PORT}`);
//   });
socketSetup(httpServer);
httpServer
  .listen(PORT)
  .on('error', (err) => {
    console.log('✘ Application failed to start');
    console.error('✘', err.message);
    process.exit(0);
  })
  .on('listening', () => {
    console.log(`Server start listening port: http://localhost:${PORT}`);
  });
