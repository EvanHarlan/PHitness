import React, { useState, useEffect, useRef } from 'react';
import COLORS from '../lib/constants';
//NUTRITION QUESTIONNAIRE COMPONENT WHERE USER ENTERS IN THEIR PREFERENCES
const NutritionQuestionnaire = ({ userParams, setUserParams, onSubmit, loading, canGenerateMealPlan, nextGenerationTime }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle a selected option
  const toggleSelection = (value, field) => {
    setUserParams(prev => {
      if (value === "none") {
        return {
          ...prev,
          [field]: prev[field].includes("none") ? [] : ["none"]
        };
      }

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
          value={userParams[name] || ''}
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
          value={userParams[name] || ''}
          onChange={handleInputChange}
          placeholder={label}
          required={required}
        />
      )}
    </div>
  );

  // Custom dropdown component
  const CustomDropdown = ({ value, onChange, options, placeholder, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-left ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          style={inputStyles}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          {value || placeholder}
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-black border border-medium-gray rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                className={`w-full px-4 py-2 text-left hover:bg-medium-gray ${
                  value === option.value ? 'bg-neon-green text-black' : 'text-white'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Height, Age, Gender, goals etc options array
  const heightOptions = [
    { value: "", label: "Select your height" },
    ...[...Array(90 - 54 + 1)].map((_, i) => {
      const totalInches = i + 54;
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      const height = `${feet}'${inches}"`;
      return { value: height, label: height };
    })
  ];
 

  const ageOptions = [
    { value: "", label: "Select your age" },
    ...Array.from({ length: 83 }, (_, i) => ({
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
    { value: "weight-gain", label: "Weight Gain"},
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

  // Dietary restrictions options
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

  // Health conditions options
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
        <div className="space-y-4">
          {getFormField("Height", "height", "select", heightOptions, true)}
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.LIGHT_GRAY }}>
              Weight (lbs) <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
              style={inputStyles}
              type="number"
              name="weight"
              value={userParams.weight || ''}
              onChange={handleInputChange}
              placeholder="Enter your weight in pounds"
              min="50"
              max="500"
              required
            />
          </div>
          {getFormField("Age", "age", "select", ageOptions, true)}
          {getFormField("Gender", "gender", "select", genderOptions, true)}
          {getFormField("Primary Goal", "goal", "select", goalOptions, true)}
          {getFormField("Typical Activity Level", "activityLevel", "select", activityLevelOptions, true)}
        </div>

        <div className="space-y-4">
          {getFormField("Preferred Meal Frequency", "mealFrequency", "select", mealFrequencyOptions)}
          {getFormField("Snack Preference", "snackPreference", "select", snackPreferenceOptions)}
          {getFormField("Daily Water Intake", "hydrationPreference", "select", hydrationPreferenceOptions)}
          {getFormField("Cooking Skill Level", "cookingSkill", "select", cookingSkillOptions)}
          {getFormField("Typical Meal Prep Time", "timePerMeal", "select", timePerMealOptions)}
          {getFormField("Grocery Budget", "budget", "select", budgetOptions)}
        </div>
      </div>

      <div className="mb-6 pt-4">
        <label className="block text-sm font-medium mb-2" style={{ color: COLORS.LIGHT_GRAY }}>
          Dietary Restrictions
        </label>
        <div className="flex flex-wrap">
          {dietaryRestrictionsOptions.map(option => (
            <SelectionTag
              key={option.value}
              label={option.label}
              selected={userParams.dietaryRestrictions?.includes(option.value)}
              onClick={() => toggleSelection(option.value, 'dietaryRestrictions')}
              disabled={option.value !== "none" && userParams.dietaryRestrictions?.includes("none")}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: COLORS.LIGHT_GRAY }}>
          Health Conditions
        </label>
        <div className="flex flex-wrap">
          {healthConditionsOptions.map(option => (
            <SelectionTag
              key={option.value}
              label={option.label}
              selected={userParams.healthConditions?.includes(option.value)}
              onClick={() => toggleSelection(option.value, 'healthConditions')}
              disabled={option.value !== "none" && userParams.healthConditions?.includes("none")}
            />
          ))}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className={`w-full px-4 py-3 rounded-lg transition font-medium ${
            !canGenerateMealPlan ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
          style={{ 
            backgroundColor: canGenerateMealPlan ? COLORS.NEON_GREEN : COLORS.MEDIUM_GRAY,
            color: COLORS.BLACK
          }}
          disabled={!canGenerateMealPlan || loading}
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
