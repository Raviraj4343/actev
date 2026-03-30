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
  const secret = process.env.EMAIL_VERIFY_SECRET;
  if (!secret) {
    throw new Error(
      "EMAIL_VERIFY_SECRET is not set. Add EMAIL_VERIFY_SECRET to your .env to generate email verification tokens."
    );
  }
  return jwt.sign({ _id: userId }, secret, {
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