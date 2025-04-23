import { useState, useEffect } from 'react';
import COLORS from '../lib/constants';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// THIS RENDERS OUT EACH INDIVIDUAL WORKOUT WITHIN THE LIBRARY. THIS COMPONENT IS USED INSIDE THE WORKOUT LIST COMPONENT TO DISPLAY EACH WORKOUT IN THE LIBRARY.

const SavedWorkoutCard = ({ workout, onDeleteWorkout, onToggleFavorite }) => {
  const [expanded, setExpanded] = useState(false);
  const [loggedExercises, setLoggedExercises] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    if (workout?._id) {
      fetchLoggedExercises();
    }
  }, [workout?._id]);

  const fetchLoggedExercises = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/exercise-tracking/workout/${workout._id}`, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        const loggedIds = new Set(response.data.data.map(tracking => tracking.exerciseId));
        setLoggedExercises(loggedIds);
      }
    } catch (error) {
      console.error('Error fetching logged exercises:', error);
    }
  };

  if (!workout) return null;

  return (
    <div className="mb-6 rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 
              className="text-xl font-semibold mb-2 cursor-pointer hover:underline" 
              style={{ color: COLORS.NEON_GREEN }}
              onClick={() => navigate(`/workouts/${workout._id}`)}
            >
              {workout.name}
            </h3>
            <p className="text-sm opacity-70" style={{ color: COLORS.LIGHT_GRAY }}>
              Created {new Date(workout.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleFavorite(workout._id, workout.favorite)}
              className="p-2 rounded-full transition hover:bg-opacity-80"
              style={{ backgroundColor: COLORS.BLACK }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill={workout.favorite ? "#FFD700" : "none"}
                stroke={workout.favorite ? "#FFD700" : COLORS.WHITE}
                strokeWidth="1.5"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
            <div className="p-2 rounded-full" style={{ backgroundColor: COLORS.BLACK }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill={workout.completed ? COLORS.NEON_GREEN : COLORS.MEDIUM_GRAY}
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              style={{ color: COLORS.LIGHT_GRAY }}
            >
              {expanded ? '▼' : '▶'}
            </button>
            {onDeleteWorkout && (
              <button 
                onClick={() => onDeleteWorkout(workout._id)} 
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                style={{ color: '#ff4d4d' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-6 border-t" style={{ borderColor: COLORS.MEDIUM_GRAY }}>
          <div className="space-y-6">
            {workout.exercises.map((exercise, index) => (
              <div key={index} className="rounded-lg overflow-hidden" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium mb-2" style={{ color: COLORS.WHITE }}>{exercise.name}</h4>
                      {loggedExercises.has(exercise._id) && (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 20 20" 
                          fill={COLORS.NEON_GREEN}
                        >
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
                    <div className="flex items-center gap-2">
                      <span className="opacity-70">Sets:</span>
                      <span>{exercise.sets}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="opacity-70">Reps:</span>
                      <span>{exercise.reps}</span>
                    </div>
                    {exercise.weight > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="opacity-70">Weight:</span>
                        <span>{exercise.weight} lbs</span>
                      </div>
                    )}
                  </div>
                  {exercise.description && (
                    <div className="mt-3 text-sm leading-relaxed" style={{ color: COLORS.LIGHT_GRAY }}>
                      {exercise.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedWorkoutCard;