import { useState } from 'react';
import COLORS from '../lib/constants';
import { useNavigate } from 'react-router-dom';

// THIS COMPONENT IS USED TO DISPLAY THE CARD UNDER "SAVED WORKOUTS" WHERE USERS CAN THEN CLICK TO ACCESS THE WORKOUTDETAILSPAGE FOR MORE INFORMATION

const SavedWorkoutCard = ({ workout, onDeleteWorkout }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  if (!workout) return null;

  return (
    <div 
      className="p-4 border rounded-lg cursor-pointer hover:opacity-90 transition"
      style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: 'rgba(255,255,255,0.05)' }}
      onClick={() => navigate(`/workouts/${workout._id}`)}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold" style={{ color: COLORS.WHITE }}>
          {workout.name}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1 rounded-lg text-sm transition"
            style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
          >
            {expanded ? 'Hide' : 'View'}
          </button>
          {onDeleteWorkout && (
            <button
              onClick={() => onDeleteWorkout(workout._id)}
              className="px-3 py-1 rounded-lg text-sm transition"
              style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: '#ff4d4d' }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4">
          <p className="text-sm mb-2" style={{ color: COLORS.LIGHT_GRAY }}>
            Created: {new Date(workout.createdAt).toLocaleDateString()}
          </p>
          
          <div className="mt-3">
            <h4 className="font-medium mb-2" style={{ color: COLORS.NEON_GREEN }}>Exercises</h4>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {workout.exercises.map((exercise, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded border"
                  style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <p className="font-medium" style={{ color: COLORS.WHITE }}>{exercise.name}</p>
                  <div className="flex space-x-4 mt-1">
                    <span style={{ color: COLORS.LIGHT_GRAY }}>
                      <span style={{ color: COLORS.NEON_GREEN }}>{exercise.sets}</span> sets
                    </span>
                    <span style={{ color: COLORS.LIGHT_GRAY }}>
                      <span style={{ color: COLORS.NEON_GREEN }}>{exercise.reps}</span> reps
                    </span>
                    {exercise.weight > 0 && (
                      <span style={{ color: COLORS.LIGHT_GRAY }}>
                        <span style={{ color: COLORS.NEON_GREEN }}>{exercise.weight}</span> lbs
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedWorkoutCard;