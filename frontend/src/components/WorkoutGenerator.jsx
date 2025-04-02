import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const WorkoutGenerator = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    age: '',
    gender: '',
    fitnessGoal: 'overall-fitness',
    experienceLevel: 'beginner',
    equipment: 'minimal',
    timeFrame: '30-minutes'
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/workouts/generate', formData);
      
      // If a workoutId was returned, redirect to the workout page
      if (response.data.workoutId) {
        navigate(`/workouts/${response.data.workoutId}`);
      } else {
        // Handle case where workout was generated but not saved (user not logged in)
        const workoutData = JSON.parse(response.data.answer);
        // Save to localStorage or handle in state management
        localStorage.setItem('lastGeneratedWorkout', response.data.answer);
        navigate('/workout-result');
      }
    } catch (err) {
      console.error('Error generating workout:', err);
      setError(err.response?.data?.error || 'Failed to generate workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const goalOptions = [
    { value: 'weight-loss', label: 'Weight Loss' },
    { value: 'muscle-gain', label: 'Muscle Gain (Hypertrophy)' },
    { value: 'strength', label: 'Strength Building' },
    { value: 'endurance', label: 'Endurance and Stamina' },
    { value: 'flexibility', label: 'Flexibility and Mobility' },
    { value: 'overall-fitness', label: 'Overall Fitness and Health' }
  ];
  
  const equipmentOptions = [
    { value: 'minimal', label: 'Minimal Home Equipment' },
    { value: 'gym', label: 'Full Gym Access' },
    { value: 'bodyweight', label: 'Bodyweight Exercises Only' },
    { value: 'resistance-bands', label: 'Resistance Bands' },
    { value: 'dumbbells', label: 'Dumbbells Only' }
  ];
  
  const timeFrameOptions = [
    { value: '15-minutes', label: '15 Minutes' },
    { value: '30-minutes', label: '30 Minutes' },
    { value: '1-hour', label: '1 Hour' },
    { value: '2-hours', label: '2 Hours' }
  ];
  
  const experienceLevelOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];
  
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Generate Custom Workout</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Physical Parameters */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Height
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g., 5'10\"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              />
            </label>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Weight (lbs)
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g., 160"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              />
            </label>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Age
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g., 30"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </label>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Gender
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              >
                <option value="">Select Gender (Optional)</option>
                {genderOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          
          {/* Workout Parameters */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Fitness Goal
              <select
                name="fitnessGoal"
                value={formData.fitnessGoal}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              >
                {goalOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Experience Level
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              >
                {experienceLevelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Available Equipment
              <select
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              >
                {equipmentOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Workout Duration
              <select
                name="timeFrame"
                value={formData.timeFrame}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              >
                {timeFrameOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        
        <div className="mt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="small" />
                <span className="ml-2">Generating Workout...</span>
              </div>
            ) : (
              'Generate Custom Workout'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkoutGenerator;