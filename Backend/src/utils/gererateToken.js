import jwt from "jsonwebtoken";


const generateAccessToken = (userId) => {
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRATION || "15m";
  return jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn,
  });
};


const generateRefreshToken = (userId) => {
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRATION || "7d";
  return jwt.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn,
  });
};


const generateEmailVerifyToken = (userId) => {
  const expiresIn = process.env.EMAIL_VERIFY_EXPIRATION || "24h";
  return jwt.sign({ _id: userId }, process.env.EMAIL_VERIFY_SECRET, {
    expiresIn,
  });
};


const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerifyToken,
  verifyToken,
};