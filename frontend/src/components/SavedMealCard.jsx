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
    toast.success(meal.isFavorite ? 'Removed from favorites' : 'Added to favorites', {
      style: {
        background: COLORS.DARK_GRAY,
        color: COLORS.NEON_GREEN,
        border: `1px solid ${COLORS.MEDIUM_GRAY}`
      }
    });
  };

  return (
    <div className="mb-6 rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 
              className="text-xl font-semibold mb-2 cursor-pointer hover:underline" 
              style={{ color: COLORS.NEON_GREEN }}
              onClick={() => navigate(`/meals/${meal._id}`)}
            >
              {meal.title || 'Unnamed Meal'}
            </h3>
            <p className="text-sm opacity-70" style={{ color: COLORS.LIGHT_GRAY }}>
              Created {new Date(meal.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-full transition hover:bg-opacity-80"
              style={{ backgroundColor: COLORS.BLACK }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill={meal.isFavorite ? "#FFD700" : "none"}
                stroke={meal.isFavorite ? "#FFD700" : COLORS.WHITE}
                strokeWidth="1.5"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              style={{ color: COLORS.LIGHT_GRAY }}
            >
              {expanded ? '▼' : '▶'}
            </button>
            {onDeleteMeal && (
              <button 
                onClick={() => onDeleteMeal(meal._id)} 
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
          {meal.description && (
            <div className="mb-4">
              <h4 className="text-sm uppercase tracking-wider mb-2 opacity-70">Description</h4>
              <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>{meal.description}</p>
            </div>
          )}
          {meal.meals && meal.meals.length > 0 && (
            <div>
              <h4 className="text-sm uppercase tracking-wider mb-4 opacity-70">Meals</h4>
              <div className="space-y-3">
                {meal.meals.map((item, index) => (
                  <div key={index} className="p-3 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                    <div className="font-medium mb-1" style={{ color: COLORS.WHITE }}>{item.name}</div>
                    {item.ingredients && item.ingredients.length > 0 && (
                      <div className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
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