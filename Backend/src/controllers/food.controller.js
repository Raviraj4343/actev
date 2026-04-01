import Food from "../models/food.model.js";
import FoodData from "../data/foods.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const escapeRegex = (text = "") => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const CACHE_TTL_MS = 2 * 60 * 1000;
const responseCache = new Map();

const getCache = (key) => {
  const cached = responseCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.ts > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return cached.value;
};

const setCache = (key, value) => {
  responseCache.set(key, { ts: Date.now(), value });
};

const filterStaticFoods = ({ diet, category, q }) => {
  let items = FoodData;

  if (diet === "veg") {
    items = items.filter((item) => item.dietType === "veg");
  }

  if (category) {
    items = items.filter((item) => item.category === category);
  }

  if (q) {
    const term = q.toLowerCase();
    items = items.filter((item) => {
      const name = String(item.name || "").toLowerCase();
      const nameHindi = String(item.nameHindi || "").toLowerCase();
      return name.includes(term) || nameHindi.includes(term);
    });
  }

  return items;
};


const getAllFoods = asyncHandler(async (req, res) => {
  const { diet, category } = req.query;
  const cacheKey = `all:${diet || "all"}:${category || "all"}`;
  const cached = getCache(cacheKey);

  if (cached) {
    res.set("Cache-Control", "public, max-age=120");
    return res
      .status(200)
      .json(new ApiResponse(200, cached, "Foods fetched successfully."));
  }

  const filter = { isActive: true };

  if (diet) {
    // veg users see only veg; non_veg/mixed see all
    if (diet === "veg") {
      filter.dietType = "veg";
    } else {
      filter.dietType = { $in: ["veg", "non_veg", "mixed"] };
    }
  }

  if (category) {
    filter.category = category;
  }

  let foods = await Food.find(filter).sort({ category: 1, name: 1 }).lean();

  // Fallback for environments where seeding has not run yet.
  if (!foods.length) {
    foods = filterStaticFoods({ diet, category });
  }

  setCache(cacheKey, foods);
  res.set("Cache-Control", "public, max-age=120");

  return res
    .status(200)
    .json(new ApiResponse(200, foods, "Foods fetched successfully."));
});


const searchFoods = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 1) {
    throw new ApiError(400, "Search query is required.");
  }

  const term = q.trim();
  const cacheKey = `search:${term.toLowerCase()}`;
  const cached = getCache(cacheKey);

  if (cached) {
    res.set("Cache-Control", "public, max-age=120");
    return res
      .status(200)
      .json(new ApiResponse(200, cached, "Search results."));
  }

  const safeRegex = new RegExp(escapeRegex(term), "i");

  let foods = await Food.find({
    isActive: true,
    $or: [
      { name: safeRegex },
      { nameHindi: safeRegex },
    ],
  })
    .limit(10)
    .lean()
    .select(
      "name nameHindi unit caloriesPerUnit proteinPerUnit carbsPerUnit fatsPerUnit fiberPerUnit calciumPerUnit vitamins category dietType"
    );

  if (!foods.length) {
    foods = filterStaticFoods({ q: term }).slice(0, 10);
  }

  setCache(cacheKey, foods);
  res.set("Cache-Control", "public, max-age=120");

  return res
    .status(200)
    .json(new ApiResponse(200, foods, "Search results."));
});


const getFoodById = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food || !food.isActive) {
    throw new ApiError(404, "Food item not found.");
  }

  return res.status(200).json(new ApiResponse(200, food, "Food item fetched."));
});


const getCategories = asyncHandler(async (req, res) => {
  const cacheKey = "categories";
  const cached = getCache(cacheKey);

  if (cached) {
    res.set("Cache-Control", "public, max-age=120");
    return res
      .status(200)
      .json(new ApiResponse(200, cached, "Categories fetched."));
  }

  let categories = await Food.distinct("category", { isActive: true });

  if (!categories.length) {
    categories = [...new Set(FoodData.map((item) => item.category))];
  }

  setCache(cacheKey, categories);
  res.set("Cache-Control", "public, max-age=120");

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched."));
});

export { getAllFoods, searchFoods, getFoodById, getCategories };
