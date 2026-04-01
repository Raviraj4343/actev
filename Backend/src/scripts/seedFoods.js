import dotenv from "dotenv";
import mongoose from "mongoose";
import Food from "../data/foods.js";
import FoodModel from "../models/food.model.js";
import { DB_NAME, MONGODB_URI } from "../constants.js";

dotenv.config();

const dedupeFoodsByName = (foods) => {
  const seenNames = new Set();
  const uniqueFoods = [];
  let skippedCount = 0;

  foods.forEach((food) => {
    if (seenNames.has(food.name)) {
      skippedCount += 1;
      return;
    }

    seenNames.add(food.name);
    uniqueFoods.push(food);
  });

  return { uniqueFoods, skippedCount };
};

const seed = async () => {
  try {
    await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
    console.log("Connected to MongoDB");

    await FoodModel.deleteMany({});
    console.log("Cleared existing food data");

    const { uniqueFoods, skippedCount } = dedupeFoodsByName(Food);
    if (skippedCount > 0) {
      console.log(`Skipped ${skippedCount} duplicate food names from source data.`);
    }

    const inserted = await FoodModel.insertMany(uniqueFoods);
    console.log(`Seeded ${inserted.length} food items successfully.`);

    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
