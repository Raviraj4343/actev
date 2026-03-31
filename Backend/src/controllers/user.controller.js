import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "express-async-handler";
import { calculateBMI, calculateDailyCalories, calculateDailyProtein } from "../utils/healthUtils.js";
// (duplicates removed)
import multer from "multer";
import path from "path";
import fs from "fs";

// Multer storage for avatar uploads (stores under public/uploads/avatars)
const avatarsDir = path.join(process.cwd(), "public", "uploads", "avatars");
fs.mkdirSync(avatarsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, avatarsDir);
  },
  filename: function (_req, file, cb) {
    const name = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, name);
  },
});
const upload = multer({ storage });


const setupProfile = asyncHandler(async (req, res) => {
  const {
    age,
    gender,
    heightCm,
    weightKg,
    bodyFatPercent,
    goal,
    activityLevel,
    dietPreference,
  } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      age,
      gender,
      heightCm,
      weightKg,
      bodyFatPercent,
      goal,
      activityLevel,
      dietPreference,
      profileCompleted: true,
    },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile set up successfully! Let's start tracking 🚀"));
});


const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "age",
    "gender",
    "heightCm",
    "weightKg",
    "bodyFatPercent",
    "goal",
    "activityLevel",
    "dietPreference",
    "name",
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update.");
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully."));
});


const getHealthStats = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user.profileCompleted) {
    throw new ApiError(403, "Please complete your profile first.");
  }

  const { bmi, category, message } = calculateBMI(user.weightKg, user.heightCm);
  const requiredCalories = calculateDailyCalories(user);
  const requiredProtein = calculateDailyProtein(user.weightKg, user.goal);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        bmi,
        bmiCategory: category,
        bmiMessage: message,
        requiredCalories,
        requiredProtein,
        goal: user.goal,
        activityLevel: user.activityLevel,
        dietPreference: user.dietPreference,
      },
      "Health stats fetched."
    )
  );
});


const getProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Profile fetched."));
});


// Upload avatar handler (expects multipart/form-data with `avatar` file)
const uploadAvatar = [
  upload.single("avatar"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "No avatar file uploaded.");

    const relPath = `/uploads/avatars/${req.file.filename}`;
    const avatarUrl = `${process.env.SERVER_URL || process.env.CLIENT_URL || ""}${relPath}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl },
      { new: true }
    );

    return res.status(200).json(new ApiResponse(200, user, "Avatar uploaded successfully."));
  }),
];

export default  { setupProfile, updateProfile, getHealthStats, getProfile, uploadAvatar };