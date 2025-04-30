import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import COLORS from '../lib/constants';
import { useUserStore } from '../stores/useUserStore';

const WeightNotification = () => {
  const [showModal, setShowModal] = useState(false);
  const [weight, setWeight] = useState('');
  const [needsWeight, setNeedsWeight] = useState(false);
  const [entryType, setEntryType] = useState('daily');
  const { user } = useUserStore();

  useEffect(() => {
    checkWeightStatus();
  }, []);

  const checkWeightStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/weight-tracking/status', {
        withCredentials: true
      });
      setNeedsWeight(!response.data.hasSubmittedWeight);
    } catch (error) {
      console.error('Error checking weight status:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format current date as YYYY-MM-DD
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const payload = {
        userId: user._id,
        weight: parseFloat(weight),
        entryType: 'weekly',
        date: formattedDate
      };
      
      // Validate required fields
      if (!payload.userId) {
        console.error('Error: userId is missing');
        toast.error('User ID is required');
        return;
      }
      
      if (!payload.weight || isNaN(payload.weight)) {
        console.error('Error: weight is missing or invalid');
        toast.error('Please enter a valid weight');
        return;
      }
      
      console.log('Submitting weight with payload:', payload);
      
      const response = await axios.post('http://localhost:5000/api/weight-tracking/submit', payload);
      
      // Show appropriate success message based on whether it was an update or new entry
      const message = response.data.isUpdate 
        ? `Updated your weight to ${weight} lbs for this week`
        : `Recorded your weight as ${weight} lbs for this week`;
      
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
    } catch (error) {
      console.error('Error submitting weight:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || 'Failed to record weight';
      toast.error(errorMessage, {
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`,
        },
      });
    }
  };

  if (!needsWeight) return null;

  return (
    <>
      {/* Weight Notification Box */}
      <div 
        className="mx-auto mb-8 p-4 rounded-lg shadow-lg max-w-md"
        style={{
          backgroundColor: COLORS.DARK_GRAY,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`,
          boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
        }}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl animate-pulse">⚖️</span>
            <p className="text-lg" style={{ color: COLORS.WHITE }}>
              Don't forget to log your weight this week!
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            style={{
              backgroundColor: COLORS.NEON_GREEN,
              color: COLORS.BLACK,
              boxShadow: `0 2px 4px rgba(0, 255, 0, 0.2)`
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#00ff80'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = COLORS.NEON_GREEN}
          >
            Record Weight
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg w-96"
            style={{
              backgroundColor: COLORS.DARK_GRAY,
              border: `1px solid ${COLORS.MEDIUM_GRAY}`,
              boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.WHITE }}>
              Record Your Weight
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: COLORS.LIGHT_GRAY }}
                >
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full p-2 rounded border"
                  style={{
                    backgroundColor: COLORS.MEDIUM_GRAY,
                    borderColor: COLORS.LIGHT_GRAY,
                    color: COLORS.WHITE
                  }}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: COLORS.LIGHT_GRAY }}
                >
                  Entry Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="daily"
                      checked={entryType === 'daily'}
                      onChange={(e) => setEntryType(e.target.value)}
                      className="mr-2"
                    />
                    <span style={{ color: COLORS.WHITE }}>Daily</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="weekly"
                      checked={entryType === 'weekly'}
                      onChange={(e) => setEntryType(e.target.value)}
                      className="mr-2"
                    />
                    <span style={{ color: COLORS.WHITE }}>Weekly</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded"
                  style={{
                    backgroundColor: COLORS.MEDIUM_GRAY,
                    color: COLORS.WHITE
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded"
                  style={{
                    backgroundColor: COLORS.NEON_GREEN,
                    color: COLORS.BLACK
                  }}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default WeightNotification; 