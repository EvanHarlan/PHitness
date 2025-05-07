import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, addWeeks, startOfWeek, addDays } from 'date-fns';
import COLORS from '../lib/constants';
import { useUserStore } from '../stores/useUserStore';
import { API_BASE_URL } from '../config';

const WeightNotification = () => {
  const [showModal, setShowModal] = useState(false);
  const [weight, setWeight] = useState('');
  const [needsWeight, setNeedsWeight] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextCheckDate, setNextCheckDate] = useState(null);
  const { user } = useUserStore();

  useEffect(() => {
    checkWeightStatus();
  }, []);

  const checkWeightStatus = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/weight-tracking/status`, {
        withCredentials: true
      });
      setNeedsWeight(response.data.needsWeight);
      setNextCheckDate(response.data.nextCheckDate);
    } catch (error) {
      setError('Failed to check weight status');
    } finally {
      setIsLoading(false);
    }
  };

  const validateWeight = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Please enter a valid number';
    if (numValue <= 0) return 'Weight must be greater than 0';
    if (numValue > 1000) return 'Weight cannot exceed 1000 lbs';
    return null;
  };

  const handleWeightChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setWeight(value);
      setError(validateWeight(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateWeight(weight);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        userId: user._id,
        weight: parseFloat(weight)
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/weight-tracking/submit`, payload);
      
      const currentWeekStart = startOfWeek(new Date());
      const nextWeekDate = addDays(currentWeekStart, 7);
      
      const message = `✅ Your weight has been logged for the week of ${format(currentWeekStart, 'MMMM d')}. You'll be able to submit again next week on ${format(nextWeekDate, 'MMMM d')}.`;
      
      toast.success(message, {
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.NEON_GREEN,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`,
        },
      });
      
      setShowModal(false);
      setNeedsWeight(false);
      setWeight('');
      setError(null);
      
      // Update the next check date
      const nextWeek = addWeeks(new Date(), 1);
      setNextCheckDate(nextWeek);

      // Reload the page to show updated graph
      window.location.reload();
    } catch (error) {
      const errorMessage = error.response?.data?.details || error.response?.data?.error || 'Failed to record weight';
      toast.error(errorMessage, {
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!needsWeight) return null;

  return (
    <>
      <div 
        className="mx-auto mb-8 p-4 rounded-lg shadow-lg max-w-md"
        style={{
          backgroundColor: COLORS.DARK_GRAY,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`,
          boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
        }}
      >
        <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.NEON_GREEN }}>
          Weekly Weight Check
        </h3>
        <div className="mb-4 space-y-2">
          <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
            Current check-in period: {format(startOfWeek(new Date()), 'MMMM d')} - {format(addDays(startOfWeek(new Date()), 6), 'MMMM d')}
          </p>
          <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
            Next check-in available: {format(addDays(startOfWeek(new Date()), 7), 'MMMM d')}
          </p>
        </div>
        <p className="mb-4" style={{ color: COLORS.WHITE }}>
          Please enter your weight for this week
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={weight}
              onChange={handleWeightChange}
              placeholder="Enter weight in lbs"
              className="flex-1 p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-neon-green focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !!error}
              className={`py-2 px-6 rounded font-bold ${
                isLoading || error
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-neon-green hover:bg-neon-green-dark'
              }`}
              style={{
                color: COLORS.DARK_GRAY,
                transition: 'background-color 0.2s'
              }}
            >
              {isLoading ? 'Submitting...' : 'Enter'}
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </form>
      </div>
    </>
  );
};

export default WeightNotification; 