import dotenv from "dotenv";
configDotenv();
import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const FOODS = [
  // ─── Grains / Staples ──────────────────────────────────────
  {
    name: "Roti (Chapati)",
    nameHindi: "रोटी",
    caloriesPerUnit: 80,
    proteinPerUnit: 2.7,
    unit: "piece",
    category: "grain",
    dietType: "veg",
  },
  {
    name: "Rice (Cooked)",
    nameHindi: "चावल",
    caloriesPerUnit: 130,
    proteinPerUnit: 2.7,
    unit: "cup",
    category: "grain",
    dietType: "veg",
  },
  {
    name: "Paratha",
    nameHindi: "परांठा",
    caloriesPerUnit: 180,
    proteinPerUnit: 3.5,
    unit: "piece",
    category: "grain",
    dietType: "veg",
  },
  {
    name: "Idli",
    nameHindi: "इडली",
    caloriesPerUnit: 40,
    proteinPerUnit: 2.0,
    unit: "piece",
    category: "grain",
    dietType: "veg",
  },
  {
    name: "Dosa",
    nameHindi: "डोसा",
    caloriesPerUnit: 120,
    proteinPerUnit: 3.5,
    unit: "piece",
    category: "grain",
    dietType: "veg",
  },
  {
    name: "Poha",
    nameHindi: "पोहा",
    caloriesPerUnit: 180,
    proteinPerUnit: 4.0,
    unit: "bowl",
    category: "grain",
    dietType: "veg",
  },
  {
    name: "Upma",
    nameHindi: "उपमा",
    caloriesPerUnit: 200,
    proteinPerUnit: 4.5,
    unit: "bowl",
    category: "grain",
    dietType: "veg",
  },

  // ─── Protein – Vegetarian ──────────────────────────────────
  {
    name: "Dal (Cooked)",
    nameHindi: "दाल",
    caloriesPerUnit: 150,
    proteinPerUnit: 9.0,
    unit: "bowl",
    category: "protein",
    dietType: "veg",
  },
  {
    name: "Paneer",
    nameHindi: "पनीर",
    caloriesPerUnit: 265,
    proteinPerUnit: 18.0,
    unit: "100g",
    category: "protein",
    dietType: "veg",
  },
  {
    name: "Rajma (Cooked)",
    nameHindi: "राजमा",
    caloriesPerUnit: 170,
    proteinPerUnit: 9.0,
    unit: "bowl",
    category: "protein",
    dietType: "veg",
  },
  {
    name: "Chana (Cooked)",
    nameHindi: "चना",
    caloriesPerUnit: 165,
    proteinPerUnit: 8.9,
    unit: "bowl",
    category: "protein",
    dietType: "veg",
  },
  {
    name: "Soya Chunks (Cooked)",
    nameHindi: "सोया",
    caloriesPerUnit: 145,
    proteinPerUnit: 20.0,
    unit: "bowl",
    category: "protein",
    dietType: "veg",
  },
  {
    name: "Tofu",
    nameHindi: "टोफू",
    caloriesPerUnit: 76,
    proteinPerUnit: 8.0,
    unit: "100g",
    category: "protein",
    dietType: "veg",
  },

  // ─── Protein – Non-Vegetarian ──────────────────────────────
  {
    name: "Egg (Boiled)",
    nameHindi: "अंडा",
    caloriesPerUnit: 77,
    proteinPerUnit: 6.3,
    unit: "piece",
    category: "protein",
    dietType: "non_veg",
  },
  {
    name: "Chicken Breast (Cooked)",
    nameHindi: "चिकन",
    caloriesPerUnit: 165,
    proteinPerUnit: 31.0,
    unit: "100g",
    category: "protein",
    dietType: "non_veg",
  },
  {
    name: "Fish (Rohu / Pomfret, Cooked)",
    nameHindi: "मछली",
    caloriesPerUnit: 120,
    proteinPerUnit: 20.0,
    unit: "100g",
    category: "protein",
    dietType: "non_veg",
  },

  // ─── Dairy ────────────────────────────────────────────────
  {
    name: "Milk (Full Fat)",
    nameHindi: "दूध",
    caloriesPerUnit: 150,
    proteinPerUnit: 8.0,
    unit: "glass",
    category: "dairy",
    dietType: "veg",
  },
  {
    name: "Curd (Dahi)",
    nameHindi: "दही",
    caloriesPerUnit: 60,
    proteinPerUnit: 3.5,
    unit: "bowl",
    category: "dairy",
    dietType: "veg",
  },
  {
    name: "Lassi (Salted)",
    nameHindi: "लस्सी",
    caloriesPerUnit: 100,
    proteinPerUnit: 4.0,
    unit: "glass",
    category: "dairy",
    dietType: "veg",
  },

  // ─── Vegetables ───────────────────────────────────────────
  {
    name: "Sabzi (Mixed Veg Curry)",
    nameHindi: "सब्जी",
    caloriesPerUnit: 120,
    proteinPerUnit: 3.0,
    unit: "bowl",
    category: "vegetable",
    dietType: "veg",
  },
  {
    name: "Palak Paneer",
    nameHindi: "पालक पनीर",
    caloriesPerUnit: 250,
    proteinPerUnit: 14.0,
    unit: "bowl",
    category: "vegetable",
    dietType: "veg",
  },

  // ─── Fruits ───────────────────────────────────────────────
  {
    name: "Banana",
    nameHindi: "केला",
    caloriesPerUnit: 90,
    proteinPerUnit: 1.1,
    unit: "piece",
    category: "fruit",
    dietType: "veg",
  },
  {
    name: "Apple",
    nameHindi: "सेब",
    caloriesPerUnit: 80,
    proteinPerUnit: 0.4,
    unit: "piece",
    category: "fruit",
    dietType: "veg",
  },

  // ─── Snacks ───────────────────────────────────────────────
  {
    name: "Peanuts (Roasted)",
    nameHindi: "मूंगफली",
    caloriesPerUnit: 166,
    proteinPerUnit: 7.0,
    unit: "handful (30g)",
    category: "snack",
    dietType: "veg",
  },
  {
    name: "Samosa",
    nameHindi: "समोसा",
    caloriesPerUnit: 260,
    proteinPerUnit: 3.5,
    unit: "piece",
    category: "snack",
    dietType: "veg",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("✅ Connected to MongoDB");

    await Food.deleteMany({});
    console.log("🗑️  Cleared existing food data");

    const inserted = await Food.insertMany(FOODS);
    console.log(`🌱 Seeded ${inserted.length} food items successfully!\n`);

    inserted.forEach((f) =>
      console.log(`  ✔ ${f.name} — ${f.caloriesPerUnit} kcal / ${f.proteinPerUnit}g protein per ${f.unit}`)
    );

    await mongoose.disconnect();
    console.log("\n✅ Done. MongoDB disconnected.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();