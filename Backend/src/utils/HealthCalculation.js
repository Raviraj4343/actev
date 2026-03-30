import { ACTIVITY_MULTIPLIERS, GOALS } from "../constants.js";

/**
 * Calculate BMI and category
 */
const calculateBMI = (weightKg, heightCm) => {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const rounded = parseFloat(bmi.toFixed(1));

  let category;
  let message;
  if (bmi < 18.5) {
    category = "Underweight";
    message = "You are underweight. Consider increasing calorie intake.";
  } else if (bmi < 25) {
    category = "Normal";
    message = "Your weight is in the healthy range. Keep it up! 💪";
  } else if (bmi < 30) {
    category = "Overweight";
    message = "You are slightly overweight. Focus on a balanced diet and exercise.";
  } else {
    category = "Obese";
    message = "High BMI detected. Please consult a healthcare professional.";
  }

  return { bmi: rounded, category, message };
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure) using Mifflin-St Jeor
 */
const calculateDailyCalories = (user) => {
  const { age, gender, weightKg, heightCm, activityLevel, goal } = user;

  // BMR calculation (Mifflin-St Jeor)
  let bmr;
  if (gender === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  let tdee = bmr * multiplier;

  // Adjust for goal
  if (goal === GOALS.WEIGHT_LOSS) {
    tdee -= 300; // 300 kcal deficit
  } else if (goal === GOALS.MUSCLE_GAIN) {
    tdee += 300; // 300 kcal surplus
  }

  return Math.round(tdee);
};

/**
 * Calculate daily protein requirement
 */
const calculateDailyProtein = (weightKg, goal) => {
  let proteinPerKg;
  if (goal === GOALS.MUSCLE_GAIN) {
    proteinPerKg = 1.5; // 1.2–1.5g per kg
  } else if (goal === GOALS.WEIGHT_LOSS) {
    proteinPerKg = 1.2;
  } else {
    proteinPerKg = 0.8; // maintain
  }
  return Math.round(weightKg * proteinPerKg);
};

/**
 * Generate health insights based on daily log vs requirements
 */
const generateInsights = ({
  dailyLog,
  requiredCalories,
  requiredProtein,
  bmiCategory,
  goal,
  dietPreference,
}) => {
  const insights = [];
  const suggestions = [];
  const warnings = [];

  const { totalCalories = 0, totalProtein = 0, waterIntake, sleepHours, steps } = dailyLog;

  // ── Calorie analysis ──
  const calorieDiff = totalCalories - requiredCalories;
  if (calorieDiff < -400) {
    insights.push(`Calories are very low (${totalCalories} / ${requiredCalories} kcal)`);
    suggestions.push("Eat a balanced meal with complex carbs and healthy fats.");
  } else if (calorieDiff < -100) {
    insights.push(`Calories are slightly below target (${totalCalories} / ${requiredCalories} kcal)`);
    suggestions.push("Add a small snack like a banana or handful of nuts.");
  } else if (calorieDiff > 300) {
    insights.push(`Calorie intake is above target (${totalCalories} / ${requiredCalories} kcal)`);
    suggestions.push("Consider reducing portion sizes for the next meal.");
  } else {
    insights.push(`Calorie intake is on track ✅ (${totalCalories} / ${requiredCalories} kcal)`);
  }

  // ── Protein analysis ──
  const proteinDiff = requiredProtein - totalProtein;
  if (proteinDiff > 20) {
    warnings.push(`Protein is low by ${proteinDiff}g (${totalProtein}g / ${requiredProtein}g needed)`);

    if (dietPreference === "veg") {
      suggestions.push("Add paneer, dal, or soy milk to boost protein.");
    } else if (dietPreference === "non_veg") {
      suggestions.push("Add 2 eggs or a chicken breast to reach your protein goal.");
    } else {
      suggestions.push("Add 2 eggs, paneer, or a glass of milk to meet your protein target.");
    }
  } else if (proteinDiff > 0) {
    insights.push(`Protein is slightly low (${totalProtein}g / ${requiredProtein}g)`);
  } else {
    insights.push(`Protein intake is sufficient ✅ (${totalProtein}g / ${requiredProtein}g)`);
  }

  // ── BMI-based insights ──
  if (bmiCategory === "Overweight" || bmiCategory === "Obese") {
    warnings.push("BMI indicates you are overweight. Focus on portion control.");
    if (goal !== GOALS.WEIGHT_LOSS) {
      suggestions.push("Consider switching your goal to weight loss.");
    }
  }

  // ── Sleep analysis ──
  if (sleepHours !== undefined) {
    if (sleepHours < 6) {
      warnings.push("Sleep is critically low (< 6 hours). This affects metabolism!");
      suggestions.push("Try to sleep at least 7–8 hours for better recovery.");
    } else if (sleepHours < 7) {
      insights.push("Sleep is slightly low. Aim for 7–8 hours.");
    } else {
      insights.push("Sleep duration looks good ✅");
    }
  }

  // ── Water analysis ──
  if (waterIntake) {
    if (waterIntake === "<1L") {
      warnings.push("Water intake is very low! Risk of dehydration.");
      suggestions.push("Drink at least 2–3 litres of water daily.");
    } else if (waterIntake === "1-2L") {
      insights.push("Water intake is average. Try to drink more.");
      suggestions.push("Keep a water bottle nearby and drink regularly.");
    } else if (waterIntake === "2-3L") {
      insights.push("Water intake is good ✅");
    } else {
      insights.push("Excellent water intake ✅");
    }
  }

  // ── Steps analysis ──
  if (steps !== undefined && steps !== null) {
    if (steps < 3000) {
      warnings.push("Step count is very low. Physical inactivity affects health.");
      suggestions.push("Walk at least 20 minutes daily to reach 5000+ steps.");
    } else if (steps < 7000) {
      insights.push(`Steps: ${steps} — Try to reach 8000+ steps daily.`);
      suggestions.push("A 15-minute evening walk can add ~2000 steps.");
    } else {
      insights.push(`Great step count today ✅ (${steps} steps)`);
    }
  } else {
    suggestions.push("Start tracking your steps — aim for 8000 steps/day.");
  }

  return { insights, suggestions, warnings };
};

/**
 * Calculate total calories and protein for a meal array
 */
const calculateMealTotals = (meals) => {
  let totalCalories = 0;
  let totalProtein = 0;

  meals.forEach((mealGroup) => {
    (mealGroup.items || []).forEach((item) => {
      totalCalories += (item.caloriesPerUnit || 0) * (item.quantity || 1);
      totalProtein += (item.proteinPerUnit || 0) * (item.quantity || 1);
    });
  });

  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: parseFloat(totalProtein.toFixed(1)),
  };
};

export {
  calculateBMI,
  calculateDailyCalories,
  calculateDailyProtein,
  generateInsights,
  calculateMealTotals,
};