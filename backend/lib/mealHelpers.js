// Meal type definitions with prep styles and times
const mealTypes = {
  smoothie: {
    prepStyle: 'blended',
    prepTime: '5-10 minutes',
    description: 'Quick, nutrient-dense blended meal'
  },
  salad: {
    prepStyle: 'raw/assembled',
    prepTime: '10-15 minutes',
    description: 'Fresh, crisp meal with varied textures'
  },
  bowl: {
    prepStyle: 'assembled',
    prepTime: '15-20 minutes',
    description: 'Balanced meal with layered ingredients'
  },
  wrap: {
    prepStyle: 'assembled',
    prepTime: '10-15 minutes',
    description: 'Portable, balanced meal'
  },
  'stir-fry': {
    prepStyle: 'stir-fried',
    prepTime: '15-20 minutes',
    description: 'Quick-cooked meal with varied textures'
  },
  'grilled plate': {
    prepStyle: 'grilled',
    prepTime: '20-25 minutes',
    description: 'Protein-focused meal with grilled elements'
  },
  'oven bake': {
    prepStyle: 'baked',
    prepTime: '25-30 minutes',
    description: 'Hearty, oven-cooked meal'
  }
};

// Helper to rotate meal types for variety
export const rotateMealType = (mealCount) => {
  // Get all meal types
  const types = Object.keys(mealTypes);
  
  // Shuffle the types
  const shuffled = types.sort(() => Math.random() - 0.5);
  
  // Select the first N types (where N is mealCount)
  const selectedTypes = shuffled.slice(0, mealCount);
  
  // Map to include prep details
  const meals = selectedTypes.map(type => ({
    type,
    ...mealTypes[type]
  }));

  console.log("🍽️ Rotated meal types:", meals);

  return meals;
};

// Helper to get meal type details
export const getMealTypeDetails = (type) => {
  return mealTypes[type] || {
    prepStyle: 'mixed',
    prepTime: '15-20 minutes',
    description: 'Balanced meal'
  };
}; 