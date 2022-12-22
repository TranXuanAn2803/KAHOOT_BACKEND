const nodemailer = require('nodemailer');
const configMail = require('../variables/mail');

const user = configMail.user;
const pass = configMail.pass;
const URL = process.env.BACKEND_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

// console.log("user email", user);
const transport = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: user,
    pass: pass,
  },
});

module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
  // console.log("Send mail");
  transport
    .sendMail({
      from: user,
      to: email,
      subject: 'Please confirm your account',
      html: `<h1>Email Confirmation</h1>
          <h2>Hello user : ${name}</h2>
          <p>Thank you for your cooperate. Please confirm your email by clicking on the following link</p>
          <a href=${URL}/auth/confirm/${confirmationCode}> Click here</a>
          </div>`,
    })
    .catch((err) => console.log(err));
};
module.exports.sendChangePasswordEmail = (userInfo, resetPasswordCode) => {
  console.log('user change password ', userInfo);
  transport
    .sendMail({
      from: user,
      to: userInfo.email,
      subject: 'Password reset',
      html: `
      <h1>Password reset</h1>
      <h3>Hello user: <a href="#" style="text-decoration: none" color: #000000">${userInfo.username}</a></h3>
      <h3>To reset your kahoot!, please go to the following page:</h3>
      <a href=${FRONTEND_URL}/auth/reset-password/${resetPasswordCode}>Reset password</a>
      <h3>If you do not wish to reset your password, ignore this message. It will expire in 24 hours.</h3>
      <h3>Wish you all the best </h3>
    `,
    })
    .catch((err) => {
      console.log('there is error while sending mail ', err);
    });
};
module.exports.sendInvitationEmail = (group, email, URL) => {
  console.log('Send mail');
  console.log('URL:', URL);
  transport
    .sendMail({
      from: user,
      to: email,
      subject: 'Invitation for Joining Kahoot Group',
      html: `<h1>Invitation Email</h1>
          <h2>Hello : ${email}</h2>
          <p>Thank you for your cooperate. Please clicking this following link to join ${group.name} goup in kahoot</p>
          <a href=${URL}/group-invitation/${group.id}> Click here</a>

          </div>`,
    })
    .catch((err) => console.log(err));
};
