//for generate radnom token
const randToken = require("rand-token");
// hash pwd
const bcrypt = require("bcrypt");
const { User } = require("../user/user.model");
const { v4: uuidv4 } = require("uuid");
//variables
const jwtVariable = require("../../variables/jwt");
const { SALT_ROUNDS } = require("../../variables/auth");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);
const authMethod = require("./auth.method");
const { sendConfirmationEmail } = require("../../config/nodemailer");
const { confirmationCode } = require("../../utils/confirmationCode");
//register account
exports.register = async (req, res) => {
  try {
    if (!req.body.username && !req.body.password && !req.body.email) {
      return res.status(400).send("Not enough information");
    }
    // console.log("req body ", req.body);
    const username = req.body.username.toLowerCase();
    const email = req.body.email.toLowerCase();
    const user = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });
    // console.log("user", user);
    if (user) {
      res.status(409).send("Username or email is already in use");
    } else {
      // console.log("Start create account");
      const code = confirmationCode();
      const hashPassword = bcrypt.hashSync(req.body.password, SALT_ROUNDS);
      const newUser = {
        id: uuidv4(),
        username: username,
        email: email,
        password: hashPassword,
        // role_id: req.body.role_id,
        is_activate: false,
        confirmationCode: code,
      };
      const createUser = await User.create(newUser);
      if (!createUser) {
        res
          .status(400)
          .send(
            "There was an error in creating an account. Please try again after few minutes"
          );
      }

      sendConfirmationEmail(createUser.username, createUser.email, code);
      return res.send({
        username,
      });
    }
  } catch (err) {
    console.log("err ", err);
  }
};

//login account
exports.login = async (req, res) => {
  try {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    // console.log("req body ", req.body);
    const user = await User.findOne({
      $or: [{ username: username }, { email: username }],
    });
    // console.log("user login ", user);
    if (!user || user == null) {
      return res.status(401).send("Account not found");
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Password is not valid");
    }
    const accessTokenLife =
      process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;
    const accessTokenSecret =
      process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;
    const dataForAccessToken = {
      username: user.username,
      email: user.email,
    };
    const accessToken = await authMethod.generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    );
    if (!accessToken) {
      return res.status(401).send("Login failed");
    }
    // create refresh token
    let refreshToken = randToken.generate(jwtVariable.refreshTokenSize);

    if (!user.refreshToken) {
      // create user regfresh token
      await User.updateOne(
        { username: user.username },
        { refreshToken: refreshToken }
      );
    } else {
      refreshToken = user.refreshToken;
    }
    return res.json({
      msg: "Login successful",
      accessToken,
      refreshToken,
      username: user.username,
    });
  } catch (error) {
    return res.json({
      msg: "Login Fail. Has Exception: " + error.message,
      username: null,
      accessToken: null,
      refreshToken: null,
    });
  }
};

exports.refreshToken = async (req, res) => {
  const accessTokenFromHeader = req.headers.x_authorization;
  if (!accessTokenFromHeader) {
    return res.status(400).send("Sorry we couldn't find access token");
  }

  //get refresh token from body
  const refreshTokenFromBody = req.body.refreshToken;
  if (!refreshTokenFromBody) {
    return res.status(400).send("Sorry we couldn't find refresh token");
  }

  const accessTokenSecret =
    process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;
  const accessTokenLife =
    process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;

  //decode access token
  const decoded = await authMethod.decodeToken(
    accessTokenFromHeader,
    accessTokenSecret
  );
  if (!decoded) {
    return res.status(400).send("Access token is not valid");
  }

  const username = decoded.payload.username;

  const user = await userModel.getUser(username);
  if (!user) {
    return res.status(401).send("User does not exist");
  }
  if (refreshTokenFromBody !== user.refreshToken) {
    return res.status(400).send("Refresh token does not exist");
  }

  const dataForAccessToken = {
    username,
  };

  // create new access token
  const accessToken = await authMethod.generateToken(
    dataForAccessToken,
    accessTokenSecret,
    accessTokenLife
  );
  if (!accessToken) {
    return res.status(400).send("Fail to create access token");
  }
  return res.json({
    accessToken,
  });
};
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    // console.log("token ", token);
    // console.log("client id ", process.env.CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();
    // console.log("payload ", ticket.getPayload());

    let user = await User.findOne({ email: email });
    // console.log("user find first", user);
    if (!user) {
      //create user
      const code = confirmationCode();
      const newUser = {
        id: uuidv4(),
        username: email,
        email: email,
        password: "",
        is_activate: false,
        confirmationCode: code,
      };
      const createUser = await User.create(newUser);
      if (!createUser) {
        res
          .status(400)
          .send(
            "There was an error in creating an account. Please try again after few minutes"
          );
      }
      sendConfirmationEmail(createUser.username, createUser.email, code);
    }
    //update user
    user = await User.findOne({ email: email });

    // console.log("user find second ", user);
    const accessTokenLife =
      process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;
    const accessTokenSecret =
      process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;
    const dataForAccessToken = {
      username: user.username,
      email: user.email,
    };
    const accessToken = await authMethod.generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    );
    if (!accessToken) {
      return res.status(401).send("Login failed");
    }
    // create refresh token
    let refreshToken = randToken.generate(jwtVariable.refreshTokenSize);

    if (!user.refreshToken) {
      // create user regfresh token
      await User.updateOne(
        { username: user.username },
        { refreshToken: refreshToken }
      );
    } else {
      refreshToken = user.refreshToken;
    }
    return res.json({
      msg: "Login successful",
      accessToken,
      refreshToken,
      username: user.username,
    });
  } catch (err) {
    console.log("err ", err);
    return res.status(401).send("Login failed");
  }
};
exports.verifyEmail = async (req, res) => {
  User.findOne({ confirmationCode: req.params.confirmationCode })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      user.is_activated = true;
      user.save((err) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
      });
      res.status(200).send({ message: "Verify email successful!!!" });
    })
    .catch((e) => console.log("error", e));
};
