// jwt
const jwt = require("jsonwebtoken");
//promisify use to convert from callback to promise
const promisify = require("util").promisify;

const sign = promisify(jwt.sign).bind(jwt);
const verify = promisify(jwt.verify).bind(jwt);

exports.generateToken = async (payload, secretSignature, tokenLife) => {
  try {
    return await sign(
      {
        payload,
      },
      secretSignature,
      {
        algorithm: "HS256",
        expiresIn: tokenLife,
      }
    );
  } catch (err) {
    console.log("err in generating token", err);
    return null;
  }
};
//veritfy token with secretKey
exports.verifyToken = async (token, secretKey) => {
  try {
    return await verify(token, secretKey, {});
  } catch (err) {
    console.log("err in verifying access token", err);
    return null;
  }
};

//decode token
exports.decodeToken = async (token, secretKey) => {
  try {
    return await verify(token, secretKey, {
      ignoreExpiration: true,
    });
  } catch (err) {
    console.log("Err in decode token", err);
    return null;
  }
};
