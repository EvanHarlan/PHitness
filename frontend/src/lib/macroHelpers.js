// Helper to calculate smart macro limits based on user parameters
export const calculateMacroLimits = (userParams) => {
  // Helper to normalize goal string
  const normalizeGoal = (goal) => {
    if (!goal) return '';
    return goal.toLowerCase().replace(/[-\s]/g, '');
  };

  // Safe number conversion helper
  const safeNumber = (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  // Parse height from string format (e.g., "5'11"") to centimeters
  const parseHeightToCm = (heightStr) => {
    try {
      if (!heightStr) return 0;
      
      // Match feet and inches using regex
      const match = heightStr.match(/^(\d+)'(\d+)"?$/);
      if (!match) {
        return 0;
      }

      const feet = parseInt(match[1]);
      const inches = parseInt(match[2]);
      const totalInches = (feet * 12) + inches;
      return Math.round(totalInches * 2.54); // Convert to cm
    } catch (error) {
      return 0;
    }
  };

  // Validate and convert inputs
  const weight = safeNumber(userParams?.weight);
  const age = safeNumber(userParams?.age);
  const heightInCm = parseHeightToCm(userParams?.height);
  const gender = userParams?.gender;
  const activityLevel = userParams?.activityLevel;

  // Convert weight to pounds
  const weightInLbs = weight * 2.20462;

  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * heightInCm - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * heightInCm - 5 * age - 161;
  }

  // Activity level multipliers
  const activityMultipliers = {
    'sedentary': 1.2,
    'lightly-active': 1.375,
    'moderately-active': 1.55,
    'very-active': 1.725,
    'extra-active': 1.9
  };

  // Calculate TDEE
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

  // Calculate macro limits
  const limits = {
    maxCalories: Math.round(tdee * 1.15),
    minCalories: Math.round(tdee * 0.85),
    maxProtein: Math.round(weightInLbs * 1.6),
    perMealProteinCap: 60,
    macroFlex: 0.1, // 10% margin allowed
    tdee: Math.round(tdee)
  };

  // Log calculated limits for debugging

  return limits;
};

// Helper to get recommended macro ratios based on goal
export const getMacroRatio = (goal) => {
  // Normalize goal string
  const normalizedGoal = goal.toLowerCase().replace(/[-\s]/g, '');

  // Define macro ratios for different goals
  const macroRatios = {
    'weightloss': { protein: 0.40, carbs: 0.30, fats: 0.30 },
    'fatloss': { protein: 0.40, carbs: 0.30, fats: 0.30 },
    'musclegain': { protein: 0.30, carbs: 0.45, fats: 0.25 },
    'bulk': { protein: 0.30, carbs: 0.45, fats: 0.25 },
    'maintenance': { protein: 0.30, carbs: 0.40, fats: 0.30 },
    'healthy': { protein: 0.30, carbs: 0.40, fats: 0.30 },
    'increaseenergy': { protein: 0.25, carbs: 0.50, fats: 0.25 }
  };

  // Get ratios for the goal or default to maintenance
  const ratios = macroRatios[normalizedGoal] || macroRatios.maintenance;

({
    goal,
    normalizedGoal,
    ratios
  });

  return ratios;
}; 