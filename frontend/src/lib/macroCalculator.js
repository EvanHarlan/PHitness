export const calculateMacros = (height, weight, age, gender, activityLevel, nutritionGoal) => {
  // Log raw input parameters for debugging
( {
    height,
    weight,
    age,
    gender,
    activityLevel,
    nutritionGoal
  });

  // Helper function to normalize goal string
  const normalizeGoal = (goal) => goal?.toLowerCase().replace(/[^a-z]/g, "");

  // Helper function to safely convert to number
  const safeNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  // Helper function to parse height from string format
  const parseHeightToCm = (height) => {
    if (!height) {
      return 0;
    }

    // If it's already a number, assume it's in cm
    if (typeof height === 'number' && !isNaN(height)) {
      return Math.round(height);
    }

    // Ensure height is a string before using .match()
    if (typeof height !== 'string') {
      return 0;
    }

    // Try to parse feet'inches" format
    const match = height.match(/^(\d+)'(\d+)"?$/);
    if (match) {
      const feet = Number(match[1]);
      const inches = Number(match[2]);
      return Math.round((feet * 12 + inches) * 2.54);
    }
    
    // Try to parse inches format
    const inchesMatch = height.match(/^(\d+)"?$/);
    if (inchesMatch) {
      return Math.round(Number(inchesMatch[1]) * 2.54);
    }

    return 0;
  };

  // Parse and validate numeric inputs
  const parsedWeight = safeNumber(weight);
  const parsedAge = safeNumber(age);
  const parsedHeight = parseHeightToCm(height);

  if (!parsedWeight || !parsedAge || !parsedHeight) {
    ( {
      weight: parsedWeight,
      age: parsedAge,
      height: parsedHeight
    });
    return {
      targetCalories: 0,
      targetProtein: 0,
      targetCarbs: 0,
      targetFats: 0
    };
  }

  // Validate required string inputs
  if (!gender || !activityLevel || !nutritionGoal) {
    ( {
      gender,
      activityLevel,
      nutritionGoal
    });
    return {
      targetCalories: 0,
      targetProtein: 0,
      targetCarbs: 0,
      targetFats: 0
    };
  }

  // Normalize goal string
  const normalizedGoal = normalizeGoal(nutritionGoal);

  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr;
  if (gender.toLowerCase() === 'male') {
    bmr = 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge + 5;
  } else {
    bmr = 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge - 161;
  }

  // Calculate TDEE based on activity level
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  };

  const activityMultiplier = activityMultipliers[activityLevel.toLowerCase()] || 1.2;
  const tdee = Math.round(bmr * activityMultiplier);

  // Adjust calories based on goal
  let totalCalories;
  switch (normalizedGoal) {
    case "weightloss":
      totalCalories = Math.round(tdee - 500); // 500 calorie deficit
      break;
    case "musclegain":
      totalCalories = Math.round(tdee + 250); // 250 calorie surplus
      break;
    case "healthy":
    case "healthyeating":
    case "maintenance":
    default:
      totalCalories = Math.round(tdee);
      break;
  }

  // Set protein multiplier based on goal
  let proteinPerLb;
  switch (normalizedGoal) {
    case "weightloss":
      proteinPerLb = 1.1;
      break;
    case "musclegain":
      proteinPerLb = 1.2;
      break;
    case "healthy":
    case "healthyeating":
    case "maintenance":
    default:
      proteinPerLb = 0.8;
      break;
  }

  // Calculate protein target
  const targetProtein = Math.round(proteinPerLb * parsedWeight);
  
  // Clamp protein to prevent unrealistic values
  const maxProtein = Math.round(parsedWeight * 1.2);
  const clampedProtein = Math.min(targetProtein, maxProtein);
  const proteinCalories = clampedProtein * 4;
  const adjustedRemainingCalories = totalCalories - proteinCalories;

  // Set macro ratios based on goal
  let carbRatio, fatRatio;
  switch (normalizedGoal) {
    case "weightloss":
      carbRatio = 0.35;
      fatRatio = 0.35;
      break;
    case "musclegain":
      carbRatio = 0.50;
      fatRatio = 0.30;
      break;
    case "healthy":
    case "healthyeating":
    case "maintenance":
    default:
      carbRatio = 0.45;
      fatRatio = 0.35;
      break;
  }

  // Calculate remaining macros using adjusted ratios
  const targetCarbs = Math.round((adjustedRemainingCalories * carbRatio) / 4);
  const targetFats = Math.round((adjustedRemainingCalories * fatRatio) / 9);

  // Log final macro calculations with sanity checks
  ( {
    targetCalories: totalCalories,
    clampedProtein,
    targetCarbs,
    targetFats,
    goal: normalizedGoal,
    ratios: {
      protein: (clampedProtein * 4) / totalCalories,
      carbs: (targetCarbs * 4) / totalCalories,
      fats: (targetFats * 9) / totalCalories
    }
  });

  return {
    targetCalories: totalCalories,
    targetProtein: clampedProtein,
    targetCarbs,
    targetFats
  };
}; 