import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {generateAccessToken, generateRefreshToken, generateEmailVerifyToken, verifyToken} from "../utils/tokenUtils.js";
import { sendVerificationEmail } from "../utils/emailService.js";
import { COOKIE_OPTIONS } from "../constants.js";


const issueTokens = async (user, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Persist hashed refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const accessCookieOpts = {
    ...COOKIE_OPTIONS,
    maxAge: process.env.ACCESS_TOKEN_EXPIRATION, 
  };
  const refreshCookieOpts = {
    ...COOKIE_OPTIONS,
    maxAge: process.env.REFRESH_TOKEN_EXPIRATION, 
  };

  res
    .cookie("accessToken", accessToken, accessCookieOpts)
    .cookie("refreshToken", refreshToken, refreshCookieOpts);

  return { accessToken, refreshToken };
};


const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = await User.create({ name, email, password });

  // Send verification email
  const verifyToken_ = generateEmailVerifyToken(user._id);
  try {
    await sendVerificationEmail(email, name, verifyToken_);
  } catch (emailErr) {
    console.error("Email send failed:", emailErr.message);
    // Don't block signup if email fails – user can request resend
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      { userId: user._id, email: user.email },
      "Account created! Please verify your email to continue."
    )
  );
});


const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) throw new ApiError(400, "Verification token is required.");

  let decoded;
  try {
    decoded = verifyToken(token, process.env.EMAIL_VERIFY_SECRET);
  } catch {
    throw new ApiError(400, "Invalid or expired verification link.");
  }

  const user = await User.findById(decoded._id);
  if (!user) throw new ApiError(404, "User not found.");
  if (user.isEmailVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Email already verified."));
  }

  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Email verified successfully! You can now log in."));
});


const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required.");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "No account found with this email.");
  if (user.isEmailVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Email is already verified."));
  }

  const verifyToken_ = generateEmailVerifyToken(user._id);
  await sendVerificationEmail(email, user.name, verifyToken_);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Verification email resent."));
});


const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user) throw new ApiError(401, "Invalid email or password.");

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password.");

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before logging in.");
  }

  const { accessToken, refreshToken } = await issueTokens(user, res);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profileCompleted: user.profileCompleted,
        },
        accessToken,
        refreshToken,
      },
      "Logged in successfully."
    )
  );
});


const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const clearOpts = { ...COOKIE_OPTIONS, maxAge: 0 };
  res.clearCookie("accessToken", clearOpts);
  res.clearCookie("refreshToken", clearOpts);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully."));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token not provided.");
  }

  let decoded;
  try {
    decoded = verifyToken(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }

  const user = await User.findById(decoded._id).select("+refreshToken");
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is invalid or has been revoked.");
  }

  const { accessToken, refreshToken } = await issueTokens(user, res);

  return res.status(200).json(
    new ApiResponse(200, { accessToken, refreshToken }, "Token refreshed.")
  );
});


const getMe = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully."));
});

export default  {
  signup,
  verifyEmail,
  resendVerification,
  login,
  logout,
  refreshAccessToken,
  getMe,
};