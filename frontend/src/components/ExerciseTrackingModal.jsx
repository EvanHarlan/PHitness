import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import COLORS from '../lib/constants';

const ExerciseTrackingModal = ({ exercise, workoutId, onClose }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [timeSpent, setTimeSpent] = useState('');

  const handleSave = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/exercise-tracking/track',
        {
          workoutId,
          exerciseId: exercise._id,
          weight: parseFloat(weight) || 0,
          reps: parseInt(reps),
          timeSpent: parseInt(timeSpent)
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
      console.error('Error saving exercise progress:', error);
      toast.error('Failed to save exercise progress', {
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`,
        },
      });
    }
  };

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
                Weight (lbs)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-2 rounded border"
                style={{ 
                  backgroundColor: COLORS.MEDIUM_GRAY,
                  borderColor: COLORS.LIGHT_GRAY,
                  color: COLORS.WHITE
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.LIGHT_GRAY }}>
                Reps
              </label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full p-2 rounded border"
                style={{ 
                  backgroundColor: COLORS.MEDIUM_GRAY,
                  borderColor: COLORS.LIGHT_GRAY,
                  color: COLORS.WHITE
                }}
              />
            </div>
          </div>

          {/* Time Input */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.LIGHT_GRAY }}>
              Time Spent (minutes)
            </label>
            <input
              type="number"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              className="w-full p-2 rounded border"
              style={{ 
                backgroundColor: COLORS.MEDIUM_GRAY,
                borderColor: COLORS.LIGHT_GRAY,
                color: COLORS.WHITE
              }}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-2 rounded font-medium"
            style={{ 
              backgroundColor: COLORS.NEON_GREEN,
              color: COLORS.BLACK
            }}
          >
            Save Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseTrackingModal; 