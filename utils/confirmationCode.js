exports.confirmationCode = () => {
  const characters =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let token = '';
  for (let i = 0; i < 50; i++) {
    token += characters[Math.floor(Math.random() * characters.length)];
  }
  return token;
};
