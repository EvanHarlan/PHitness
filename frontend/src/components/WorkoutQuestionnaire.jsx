import COLORS from '../lib/constants';
//WORKOUT QUESTIONNAIRE COMPONENT WHERE USER ENTERS IN THEIR PREFERENCES
const WorkoutQuestionnaire = ({ userParams, setUserParams, onSubmit, loading, canGenerateWorkout }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  // Height options array
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
    ...Array.from({ length: 83 }, (_, i) => ({ // From 18 to 100
      value: 18 + i,
      label: `${18 + i} years`,
    })),
  ];

  // Other form field options
  const genderOptions = [
    { value: "not-specified", label: "Prefer not to say" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" }
  ];

  const fitnessGoalOptions = [
    { value: "", label: "Select a goal" },
    { value: "weight-gain", label: "Weight Gain" },
    { value: "weight-loss", label: "Weight Loss" },
    { value: "muscle-gain", label: "Muscle Gain" },
    { value: "strength", label: "Strength" },
    { value: "endurance", label: "Endurance" },
    { value: "flexibility", label: "Flexibility" },
    { value: "overall-fitness", label: "Overall Fitness" }
  ];

  const experienceOptions = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
  ];

  const equipmentOptions = [
    { value: "minimal", label: "Minimal/Home Equipment" },
    { value: "gym", label: "Full Gym Access" },
    { value: "bodyweight", label: "Bodyweight Only" },
    { value: "resistance-bands", label: "Resistance Bands" },
    { value: "dumbbells", label: "Dumbbells Only" }
  ];

  const timeFrameOptions = [
    { value: "15-minutes", label: "15 Minutes" },
    { value: "30-minutes", label: "30 Minutes" },
    { value: "1-hour", label: "1 Hour" },
    { value: "2-hours", label: "2 Hours" }
  ];

  const healthConditionsOptions = [
    { value: "none", label: "No Health Concerns" },
    { value: "back-pain", label: "Back Pain/Injury" },
    { value: "knee-pain", label: "Knee Pain/Injury" },
    { value: "shoulder-pain", label: "Shoulder Pain/Injury" },
    { value: "heart-condition", label: "Heart Condition" },
    { value: "pregnancy", label: "Pregnancy" },
    { value: "other", label: "Other (Will Adapt Exercises)" }
  ];

  const frequencyOptions = [
    { value: "1-2", label: "1-2 times" },
    { value: "3-4", label: "3-4 times" },
    { value: "5-6", label: "5-6 times" },
    { value: "daily", label: "Daily" }
  ];

  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {getFormField("Height", "height", "select", heightOptions, true)}
          {getFormField("Weight (lbs)", "weight", "number", null, true)}
          {getFormField("Age", "age", "select", ageOptions, true)}
          {getFormField("Gender", "gender", "select", genderOptions, true)}
          {getFormField("Fitness Goal", "fitnessGoal", "select", fitnessGoalOptions, true)}
        </div>
        <div className="space-y-4">
          {getFormField("Experience Level", "experienceLevel", "select", experienceOptions)}
          {getFormField("Available Equipment", "equipment", "select", equipmentOptions)}
          {getFormField("Workout Time Frame", "timeFrame", "select", timeFrameOptions)}
          {getFormField("Health Conditions", "healthConditions", "select", healthConditionsOptions)}
          {getFormField("Workout Frequency (per week)", "frequency", "select", frequencyOptions)}
        </div>
      </div>

      <div className="pt-4 w-full">
        <button 
          type="button"
          className="w-full px-4 py-3 rounded-lg transition font-medium"
          style={{ 
            backgroundColor: canGenerateWorkout ? COLORS.NEON_GREEN : COLORS.MEDIUM_GRAY,
            color: COLORS.BLACK,
            cursor: canGenerateWorkout ? 'pointer' : 'not-allowed',
            opacity: canGenerateWorkout ? 1 : 0.7,
            fontSize: '1.1rem'
          }}
          onClick={onSubmit}
          disabled={!canGenerateWorkout || loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            canGenerateWorkout ? 'Generate Workout' : 'Workout Generated Today'
          )}
        </button>
      </div>
    </form>
  );
};

export default WorkoutQuestionnaire;