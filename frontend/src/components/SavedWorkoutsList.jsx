import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import SavedWorkoutCard from './SavedWorkoutCard';
import COLORS from '../lib/constants';

// THIS COMPONENT IS USED TO DISPLAY THE LIST OF SAVED WORKOUTS AND NAMES WITH EDIT OR VIEW OPTIONS
// THIS IS PRESENT AFTER A USER CLICKS "VIEW SAVED WORKOUTS" ON THE WORKOUTPAGE

const SavedWorkoutsList = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/workouts', { withCredentials: true });
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      toast.error('Failed to load your workouts', {
        style: { 
          background: COLORS.DARK_GRAY, 
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/workouts/${workoutId}`, { withCredentials: true });
      setWorkouts(workouts.filter(workout => workout._id !== workoutId));
      toast.success('Workout deleted successfully', {
        style: { 
          background: COLORS.DARK_GRAY, 
          color: COLORS.NEON_GREEN,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        }
      });
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout', {
        style: { 
          background: COLORS.DARK_GRAY, 
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-t-transparent rounded-full mb-2" 
             style={{ borderColor: COLORS.MEDIUM_GRAY, borderTopColor: 'transparent' }}></div>
        <p style={{ color: COLORS.LIGHT_GRAY }}>Loading your workouts...</p>
      </div>
    );
  }

  if (!workouts.length) {
    return (
      <div className="text-center p-6 border rounded-xl" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: 'rgba(255,255,255,0.05)' }}>
        <p style={{ color: COLORS.LIGHT_GRAY }}>No saved workouts yet. Generate a workout plan to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {workouts.map(workout => (
        <SavedWorkoutCard 
          key={workout._id} 
          workout={workout} 
          onDeleteWorkout={handleDeleteWorkout} 
        />
      ))}
    </div>
  );
};

export default SavedWorkoutsList;