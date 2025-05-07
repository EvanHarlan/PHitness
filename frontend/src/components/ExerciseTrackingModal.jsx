import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import COLORS from '../lib/constants';

const ExerciseTrackingModal = ({ exercise, workoutId, onClose }) => {
  const [formData, setFormData] = useState({
    weight: '',
    reps: '',
    timeSpent: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // Weight validation
    if (formData.weight === '') {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(formData.weight) || parseFloat(formData.weight) < 0) {
      newErrors.weight = 'Please enter a valid weight';
    } else if (parseFloat(formData.weight) > 1000) {
      newErrors.weight = 'Weight seems too high. Please verify.';
    }

    // Reps validation
    if (formData.reps === '') {
      newErrors.reps = 'Reps are required';
    } else if (isNaN(formData.reps) || parseInt(formData.reps) < 0) {
      newErrors.reps = 'Please enter a valid number of reps';
    } else if (parseInt(formData.reps) > 100) {
      newErrors.reps = 'Number of reps seems too high. Please verify.';
    }

    // Time validation
    if (formData.timeSpent === '') {
      newErrors.timeSpent = 'Time spent is required';
    } else if (isNaN(formData.timeSpent) || parseInt(formData.timeSpent) < 0) {
      newErrors.timeSpent = 'Please enter a valid time';
    } else if (parseInt(formData.timeSpent) > 180) {
      newErrors.timeSpent = 'Time seems too long. Please verify.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/exercise-tracking/track',
        {
          workoutId,
          exerciseId: exercise._id,
          weight: parseFloat(formData.weight) || 0,
          reps: parseInt(formData.reps),
          timeSpent: parseInt(formData.timeSpent)
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Exercise progress saved successfully', {
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.NEON_GREEN,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`,
          },
        });
        onClose();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to save exercise progress';
      toast.error(errorMessage, {
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = (hasError) => ({
    backgroundColor: COLORS.MEDIUM_GRAY,
    borderColor: hasError ? '#ef4444' : COLORS.LIGHT_GRAY,
    color: COLORS.WHITE,
    borderWidth: '1px',
    borderRadius: '0.375rem',
    padding: '0.5rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
    '&:focus': {
      borderColor: hasError ? '#ef4444' : COLORS.NEON_GREEN,
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md rounded-lg p-6"
        style={{ backgroundColor: COLORS.DARK_GRAY }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold" style={{ color: COLORS.WHITE }}>
            Log {exercise.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Weight and Reps Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.LIGHT_GRAY }}>
                Weight (lbs) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full p-2 rounded border"
                style={inputStyles(!!errors.weight)}
                min="0"
                max="1000"
                step="0.1"
              />
              {errors.weight && (
                <p className="mt-1 text-xs text-red-500">{errors.weight}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.LIGHT_GRAY }}>
                Reps <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="reps"
                value={formData.reps}
                onChange={handleInputChange}
                className="w-full p-2 rounded border"
                style={inputStyles(!!errors.reps)}
                min="0"
                max="100"
              />
              {errors.reps && (
                <p className="mt-1 text-xs text-red-500">{errors.reps}</p>
              )}
            </div>
          </div>

          {/* Time Input */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.LIGHT_GRAY }}>
              Time Spent (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="timeSpent"
              value={formData.timeSpent}
              onChange={handleInputChange}
              className="w-full p-2 rounded border"
              style={inputStyles(!!errors.timeSpent)}
              min="0"
              max="180"
            />
            {errors.timeSpent && (
              <p className="mt-1 text-xs text-red-500">{errors.timeSpent}</p>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-2 rounded font-medium transition-opacity"
            style={{ 
              backgroundColor: COLORS.NEON_GREEN,
              color: COLORS.BLACK,
              opacity: isSubmitting ? 0.7 : 1
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Progress'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseTrackingModal; 