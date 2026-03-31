import Food from "../models/food.model.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";


const getAllFoods = asyncHandler(async (req, res) => {
  const { diet, category } = req.query;

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

  const foods = await Food.find(filter).sort({ category: 1, name: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, foods, "Foods fetched successfully."));
});


const searchFoods = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 1) {
    throw new ApiError(400, "Search query is required.");
  }

  const foods = await Food.find({
    isActive: true,
    name: { $regex: q.trim(), $options: "i" },
  })
    .limit(10)
    .select("name unit caloriesPerUnit proteinPerUnit category dietType");

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
  const categories = await Food.distinct("category", { isActive: true });

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched."));
});

export default { getAllFoods, searchFoods, getFoodById, getCategories };