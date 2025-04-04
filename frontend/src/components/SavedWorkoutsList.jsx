import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import SavedWorkoutCard from './SavedWorkoutCard';
import COLORS from '../lib/constants';

const SavedWorkoutsList = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'favorites'
  
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

  const handleToggleFavorite = async (workoutId) => {
    try {
      const response = await axios.patch(`/api/workouts/${workoutId}/favorite`);
      
      // Update the workout in state after successful toggle
      if (response.data.success) {
        setWorkouts(workouts.map(workout => 
          workout._id === workoutId 
            ? { ...workout, favorite: response.data.favorite } 
            : workout
        ));
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
      // Add appropriate error handling, maybe show a toast notification
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4" style={{ color: COLORS.LIGHT_GRAY }}>
        Loading your workouts...
      </div>
    );
  }

  // Filter workouts based on current view mode
  const filteredWorkouts = viewMode === 'favorites' 
    ? workouts.filter(workout => workout.favorite)
    : workouts;

  if (!workouts.length) {
    return (
      <div className="text-center py-4" style={{ color: COLORS.LIGHT_GRAY }}>
        No saved workouts yet. Generate a workout plan to get started!
      </div>
    );
  }

  if (viewMode === 'favorites' && !filteredWorkouts.length) {
    return (
      <div>
        <div className="flex justify-center mb-4 gap-2">
          <button
            onClick={() => setViewMode('all')}
            className="px-4 py-2 rounded-lg text-sm transition"
            style={{ 
              backgroundColor: viewMode === 'all' ? COLORS.NEON_GREEN : COLORS.MEDIUM_GRAY, 
              color: viewMode === 'all' ? COLORS.BLACK : COLORS.WHITE
            }}
          >
            All Workouts
          </button>
          <button
            onClick={() => setViewMode('favorites')}
            className="px-4 py-2 rounded-lg text-sm transition flex items-center"
            style={{ 
              backgroundColor: viewMode === 'favorites' ? COLORS.NEON_GREEN : COLORS.MEDIUM_GRAY, 
              color: viewMode === 'favorites' ? COLORS.BLACK : COLORS.WHITE
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Favorites
          </button>
        </div>
        <div className="text-center py-4" style={{ color: COLORS.LIGHT_GRAY }}>
          No favorite workouts yet. Star workouts to add them to favorites!
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-center mb-4 gap-2">
        <button
          onClick={() => setViewMode('all')}
          className="px-4 py-2 rounded-lg text-sm transition"
          style={{ 
            backgroundColor: viewMode === 'all' ? COLORS.NEON_GREEN : COLORS.MEDIUM_GRAY, 
            color: viewMode === 'all' ? COLORS.BLACK : COLORS.WHITE
          }}
        >
          All Workouts
        </button>
        <button
          onClick={() => setViewMode('favorites')}
          className="px-4 py-2 rounded-lg text-sm transition flex items-center"
          style={{ 
            backgroundColor: viewMode === 'favorites' ? COLORS.NEON_GREEN : COLORS.MEDIUM_GRAY, 
            color: viewMode === 'favorites' ? COLORS.BLACK : COLORS.WHITE
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Favorites
        </button>
      </div>
      <div className="grid gap-3">
        {filteredWorkouts.map(workout => (
          <SavedWorkoutCard 
            key={workout._id} 
            workout={workout} 
            onDeleteWorkout={handleDeleteWorkout}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};

export default SavedWorkoutsList;