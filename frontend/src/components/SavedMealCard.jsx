import { useState } from 'react';
import COLORS from '../lib/constants';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// THIS RENDERS OUT EACH INDIVIDUAL MEAL WITHIN THE LIBRARY. THIS COMPONENT IS USED INSIDE THE MEAL LIST COMPONENT TO DISPLAY EACH MEAL IN THE LIBRARY.

const SavedMealCard = ({ meal, onDeleteMeal, onToggleFavorite }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  if (!meal) return null;

  const handleToggleFavorite = () => {
    onToggleFavorite(meal._id);
    toast.success(meal.favorite ? 'Removed from favorites' : 'Added to favorites', {
      style: {
        background: COLORS.DARK_GRAY,
        color: COLORS.NEON_GREEN,
        border: `1px solid ${COLORS.MEDIUM_GRAY}`
      }
    });
  };

  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.MEDIUM_GRAY }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <h3 
            className="text-lg font-medium cursor-pointer hover:underline" 
            style={{ color: COLORS.WHITE }}
            onClick={() => navigate(`/meals/${meal._id}`)}
          >
            {meal.title || 'Unnamed Meal'}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleFavorite}
            className="p-2 rounded-full transition hover:bg-opacity-80"
            style={{ backgroundColor: COLORS.DARK_GRAY }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill={meal.favorite ? "#FFD700" : "none"}
              stroke={meal.favorite ? "#FFD700" : COLORS.WHITE}
              strokeWidth="1.5"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="px-3 py-1 rounded-lg text-sm transition" 
            style={{ backgroundColor: COLORS.DARK_GRAY, color: COLORS.WHITE }}
          >
            {expanded ? 'Hide' : 'View'}
          </button>
          {onDeleteMeal && (
            <button 
              onClick={() => onDeleteMeal(meal._id)} 
              className="px-3 py-1 rounded-lg text-sm transition" 
              style={{ backgroundColor: COLORS.DARK_GRAY, color: '#ff4d4d' }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: COLORS.DARK_GRAY }}>
          <div className="mb-2" style={{ color: COLORS.LIGHT_GRAY }}>
            Created: {new Date(meal.createdAt).toLocaleDateString()}
          </div>
          {meal.description && (
            <div className="mb-2">
              <h4 className="font-medium" style={{ color: COLORS.WHITE }}>Description</h4>
              <p style={{ color: COLORS.LIGHT_GRAY }}>{meal.description}</p>
            </div>
          )}
          {meal.meals && meal.meals.length > 0 && (
            <div>
              <h4 className="font-medium mb-2" style={{ color: COLORS.WHITE }}>Meals</h4>
              <div className="space-y-2">
                {meal.meals.map((item, index) => (
                  <div key={index} className="p-2 rounded" style={{ backgroundColor: COLORS.MEDIUM_GRAY }}>
                    <div className="font-medium" style={{ color: COLORS.WHITE }}>{item.name}</div>
                    {item.ingredients && item.ingredients.length > 0 && (
                      <div style={{ color: COLORS.LIGHT_GRAY }}>
                        {item.ingredients.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedMealCard;