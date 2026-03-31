import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { calculateBMI, calculateDailyCalories, calculateDailyProtein } from "../utils/HealthCalculation.js";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const AVATAR_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      cb(new ApiError(400, "Please upload a valid image file."));
      return;
    }
    cb(null, true);
  },
});

const buildAvatarUrl = (req, filename) =>
  `${req.protocol}://${req.get("host")}/uploads/avatars/${filename}`;

const removeOldAvatar = async (avatarUrl) => {
  if (!avatarUrl || !avatarUrl.includes("/uploads/avatars/")) return;

  const filename = avatarUrl.split("/uploads/avatars/")[1];
  if (!filename) return;

  const filePath = path.join(AVATAR_DIR, path.basename(filename));
  await fs.unlink(filePath).catch(() => {});
};

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
    .json(new ApiResponse(200, user, "Profile set up successfully! Let's start tracking."));
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

const uploadAvatar = [
  avatarUpload.single("avatar"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, "Please choose an image to upload.");
    }

    await fs.mkdir(AVATAR_DIR, { recursive: true });

    const ext = path.extname(req.file.originalname || "") || ".png";
    const filename = `${req.user._id}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    const filePath = path.join(AVATAR_DIR, filename);

    await fs.writeFile(filePath, req.file.buffer);

    const avatarUrl = buildAvatarUrl(req, filename);
    await removeOldAvatar(req.user.avatarUrl);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl },
      { new: true, runValidators: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Avatar uploaded successfully."));
  }),
];

export default { setupProfile, updateProfile, getHealthStats, getProfile, uploadAvatar };
