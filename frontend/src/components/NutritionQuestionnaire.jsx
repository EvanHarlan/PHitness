import React from 'react';
import COLORS from '../lib/constants';

const NutritionQuestionnaire = ({ userParams, setUserParams, onSubmit, loading, canGenerateMealPlan, nextGenerationTime }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle height selection specifically to store in a format that can be used by the API
  const handleHeightChange = (feet, inches) => {
    // Store height in a format that can be easily converted to cm for the API if needed
    const heightStr = `${feet}'${inches}"`;
    const heightInInches = (parseInt(feet) * 12) + parseInt(inches);
    
    setUserParams(prev => ({
      ...prev,
      height: heightStr,
      heightInInches: heightInInches
    }));
  };

  // Parse height string (e.g. "5'10"") into feet and inches components
  const parseHeight = (heightStr) => {
    if (!heightStr || typeof heightStr !== 'string') return { feet: '', inches: '' };
    
    const match = heightStr.match(/(\d+)'(\d+)"/);
    if (match) {
      return {
        feet: match[1],
        inches: match[2]
      };
    }
    return { feet: '', inches: '' };
  };

  // Toggle a selected option (for tag-based selection)
  const toggleSelection = (value, field) => {
    setUserParams(prev => {
      // Handle "none" option specially - if selecting "none", clear other selections
      if (value === "none") {
        return {
          ...prev,
          [field]: prev[field].includes("none") ? [] : ["none"]
        };
      }

      // If a value other than "none" is selected, remove "none" from the array if present
      let updatedArray = prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field].filter(item => item !== "none"), value];

      return {
        ...prev,
        [field]: updatedArray
      };
    });
  };

  // Custom Tag component for multi-select
  const SelectionTag = ({ label, selected, onClick, disabled = false }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all mr-2 mb-2 ${
        selected 
          ? 'bg-neon-green text-black' 
          : 'bg-black text-white border border-medium-gray hover:border-light-gray'
      }`}
      style={
        selected 
          ? { backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK } 
          : { 
              backgroundColor: COLORS.BLACK, 
              color: COLORS.WHITE,
              borderColor: COLORS.MEDIUM_GRAY,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1
            }
      }
    >
      {label}
    </button>
  );

  const inputStyles = {
    backgroundColor: COLORS.MEDIUM_GRAY,
    color: COLORS.WHITE,
    borderColor: COLORS.LIGHT_GRAY
  };

  const getFormField = (label, name, type, options = null, required = false) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium mb-1" style={{ color: COLORS.LIGHT_GRAY }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {type === 'select' ? (
        <select
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
          style={inputStyles}
          name={name}
          value={userParams[name]}
          onChange={handleInputChange}
          required={required}
        >
          {options.map((option, index) => (
            <option key={index} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <input
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
          style={inputStyles}
          type={type}
          name={name}
          value={userParams[name]}
          onChange={handleInputChange}
          placeholder={label}
          required={required}
        />
      )}
    </div>
  );

  // Parsed height from userParams
  const parsedHeight = parseHeight(userParams.height);

  // Feet and inches dropdowns for height selection
  const HeightSelector = () => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium mb-1" style={{ color: COLORS.LIGHT_GRAY }}>
          Height <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <select
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
              style={inputStyles}
              value={parsedHeight.feet}
              onChange={(e) => handleHeightChange(e.target.value, parsedHeight.inches)}
              required
            >
              <option value="">Feet</option>
              {Array.from({ length: 8 }, (_, i) => i + 3).map(feet => (
                <option key={feet} value={feet}>{feet} ft</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <select
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
              style={inputStyles}
              value={parsedHeight.inches}
              onChange={(e) => handleHeightChange(parsedHeight.feet, e.target.value)}
              required
              disabled={!parsedHeight.feet}
            >
              <option value="">Inches</option>
              {Array.from({ length: 12 }, (_, i) => i).map(inches => (
                <option key={inches} value={inches}>{inches} in</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  const ageOptions = [
    { value: "", label: "Select your age" },
    ...Array.from({ length: 83 }, (_, i) => ({ // From 18 to 100
      value: 18 + i,
      label: `${18 + i} years`,
    })),
  ];

  const genderOptions = [
    { value: "", label: "Select your gender" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "not-specified", label: "Prefer not to say" },
  ];

  const goalOptions = [
    { value: "", label: "Select your primary goal" },
    { value: "weight-loss", label: "Weight Loss" },
    { value: "muscle-gain", label: "Muscle Gain" },
    { value: "healthy-eating", label: "Improve Overall Health & Nutrition" },
    { value: "increase-energy", label: "Increase Energy Levels" },
    { value: "manage-condition", label: "Manage a Specific Health Condition" },
    { value: "performance-enhancement", label: "Enhance Athletic Performance" },
  ];

  const activityLevelOptions = [
    { value: "", label: "Select your typical activity level" },
    { value: "sedentary", label: "Sedentary (little to no exercise)" },
    { value: "lightly-active", label: "Lightly Active (light exercise/walking 1-3 days/week)" },
    { value: "moderately-active", label: "Moderately Active (moderate exercise 3-5 days/week)" },
    { value: "very-active", label: "Very Active (intense exercise 6-7 days/week)" },
    { value: "extra-active", label: "Extra Active (very intense training or physically demanding job)" },
  ];

  // Dietary restrictions options for the tag-based selection
  const dietaryRestrictionsOptions = [
    { value: "none", label: "No restrictions" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "gluten-free", label: "Gluten-Free" },
    { value: "dairy-free", label: "Dairy-Free" },
    { value: "nut-free", label: "Nut-Free" },
    { value: "soy-free", label: "Soy-Free" },
    { value: "egg-free", label: "Egg-Free" },
    { value: "fish-free", label: "Fish-Free" },
    { value: "shellfish-free", label: "Shellfish-Free" },
    { value: "pescatarian", label: "Pescatarian" },
    { value: "paleo", label: "Paleo" },
    { value: "keto", label: "Keto" },
    { value: "low-carb", label: "Low-Carb" },
    { value: "low-fat", label: "Low-Fat" },
    { value: "mediterranean", label: "Mediterranean" },
    { value: "whole-30", label: "Whole30" },
  ];

  const mealFrequencyOptions = [
    { value: "", label: "Preferred number of main meals per day" },
    { value: "1", label: "1 Meal" },
    { value: "2", label: "2 Meals" },
    { value: "3", label: "3 Meals" },
    { value: "4", label: "4 Meals" },
    { value: "5+", label: "5+ Meals" },
  ];

  const snackPreferenceOptions = [
    { value: "", label: "Do you prefer to include snacks?" },
    { value: "yes-scheduled", label: "Yes, scheduled snacks" },
    { value: "yes-flexible", label: "Yes, flexible as needed" },
    { value: "no", label: "No snacks between meals" },
  ];

  const hydrationPreferenceOptions = [
    { value: "", label: "Typical daily water intake" },
    { value: "less-than-4", label: "Less than 4 cups" },
    { value: "4-6", label: "4-6 cups" },
    { value: "7-9", label: "7-9 cups" },
    { value: "10+", label: "10+ cups" },
  ];

  const cookingSkillOptions = [
    { value: "", label: "Your cooking skill level" },
    { value: "beginner", label: "Beginner (simple recipes)" },
    { value: "intermediate", label: "Intermediate (can follow most recipes)" },
    { value: "advanced", label: "Advanced (comfortable with complex dishes)" },
  ];

  const timePerMealOptions = [
    { value: "", label: "Typical time available to prepare each meal" },
    { value: "less-than-15", label: "Less than 15 minutes" },
    { value: "15-30", label: "15-30 minutes" },
    { value: "30-45", label: "30-45 minutes" },
    { value: "45+", label: "45+ minutes" },
  ];

  const budgetOptions = [
    { value: "", label: "Your approximate budget for groceries" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  // Health conditions options for the tag-based selection
  const healthConditionsOptions = [
    { value: "none", label: "No known conditions" },
    { value: "diabetes-type1", label: "Diabetes Type 1" },
    { value: "diabetes-type2", label: "Diabetes Type 2" },
    { value: "high-cholesterol", label: "High Cholesterol" },
    { value: "high-blood-pressure", label: "High Blood Pressure" },
    { value: "ibs", label: "IBS" },
    { value: "gerd", label: "GERD" },
    { value: "celiac-disease", label: "Celiac Disease" },
    { value: "lactose-intolerance", label: "Lactose Intolerance" },
    { value: "kidney-disease", label: "Kidney Disease" },
    { value: "allergies", label: "Food Allergies" },
    { value: "pregnancy", label: "Pregnancy" },
    { value: "breastfeeding", label: "Breastfeeding" },
  ];

  const formatTimeRemaining = (nextTime) => {
    if (!nextTime) return "No previous meal plan generation";
    
    const now = new Date();
    const diff = nextTime - now;
    
    if (diff <= 0) return "Available now!";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s remaining`;
  };

  return (
    <form className="space-y-6" onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information - Left Column */}
        <div className="space-y-4">
          <HeightSelector />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.LIGHT_GRAY }}>
              Weight (lbs) <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
              style={inputStyles}
              type="number"
              name="weight"
              value={userParams.weight}
              onChange={handleInputChange}
              placeholder="Enter your weight in pounds"
              min="50"
              max="500"
              required
            />
          </div>
          
          {getFormField("Age", "age", "select", ageOptions)}
          {getFormField("Gender", "gender", "select", genderOptions)}
          {getFormField("Primary Goal", "goal", "select", goalOptions, true)}
          {getFormField("Typical Activity Level", "activityLevel", "select", activityLevelOptions)}
        </div>

        {/* Dietary Preferences - Right Column */}
        <div className="space-y-4">
          {getFormField("Preferred Meal Frequency", "mealFrequency", "select", mealFrequencyOptions)}
          {getFormField("Snack Preference", "snackPreference", "select", snackPreferenceOptions)}
          {getFormField("Daily Water Intake", "hydrationPreference", "select", hydrationPreferenceOptions)}
          {getFormField("Cooking Skill Level", "cookingSkill", "select", cookingSkillOptions)}
          {getFormField("Typical Meal Prep Time", "timePerMeal", "select", timePerMealOptions)}
          {getFormField("Grocery Budget", "budget", "select", budgetOptions)}
        </div>
      </div>

      {/* Dietary Restrictions Tag Selection */}
      <div className="mb-6 pt-4">
        <label className="block text-sm font-medium mb-2" style={{ color: COLORS.LIGHT_GRAY }}>
          Dietary Restrictions
        </label>
        <div className="flex flex-wrap">
          {dietaryRestrictionsOptions.map(option => (
            <SelectionTag
              key={option.value}
              label={option.label}
              selected={userParams.dietaryRestrictions.includes(option.value)}
              onClick={() => toggleSelection(option.value, 'dietaryRestrictions')}
              disabled={option.value !== "none" && userParams.dietaryRestrictions.includes("none")}
            />
          ))}
        </div>
      </div>

      {/* Health Conditions Tag Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: COLORS.LIGHT_GRAY }}>
          Health Conditions
        </label>
        <div className="flex flex-wrap">
          {healthConditionsOptions.map(option => (
            <SelectionTag
              key={option.value}
              label={option.label}
              selected={userParams.healthConditions.includes(option.value)}
              onClick={() => toggleSelection(option.value, 'healthConditions')}
              disabled={option.value !== "none" && userParams.healthConditions.includes("none")}
            />
          ))}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="button"
          className="px-4 py-2 rounded-lg transition font-medium"
          style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Optimal Meal Plan...
            </span>
          ) : (
            canGenerateMealPlan ? 'Generate Optimal Meal Plan' : 'Meal Plan Generated Today'
          )}
        </button>
        {!canGenerateMealPlan && !loading && (
          <p className="text-center mt-2 text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
            Next generation available in {formatTimeRemaining(nextGenerationTime)}
          </p>
        )}
      </div>
    </form>
  );
};

export default NutritionQuestionnaire;
