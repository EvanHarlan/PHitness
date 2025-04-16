import React from 'react';
import { Link } from 'react-router-dom';
import COLORS from '../lib/constants';
import { toast } from 'react-hot-toast';

const SavedMealCard = ({ meal, onDeleteMeal, onToggleFavorite }) => {
  const handleDelete = () => {
    onDeleteMeal(meal._id);
  };

  const handleFavorite = () => {
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
    <div
      className="rounded-xl shadow-md p-4 flex justify-between items-center"
      style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}
    >
      <div>
        <h3 className="text-lg font-semibold" style={{ color: COLORS.WHITE }}>
          {meal.title || 'Unnamed Meal'} {/* Assuming 'title' is the correct property */}
        </h3>
        {meal.description && <p className="text-sm text-[#B0B0B0]">{meal.description}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <Link to={`/meals/${meal._id}`} className="text-sm text-blue-500 hover:underline">
          View
        </Link>
        <button onClick={handleFavorite} className="p-2 rounded-full hover:bg-[#222222]">
          <svg
            className={`h-5 w-5 ${meal.favorite ? 'fill-yellow-500 text-yellow-500' : 'text-[#B0B0B0]'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </button>
        <button onClick={handleDelete} className="p-2 rounded-full hover:bg-[#222222]">
          <svg
            className="h-5 w-5 text-[#ff4b4b]"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4h5.236l-.724-1.447A1 1 0 0011 2H9zm7 8a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h12a1 1 0 011 1v5zm-2-3a1 1 0 00-1 1v3a1 1 0 001 1h1a1 1 0 001-1V6a1 1 0 00-1-1h-1zM5 6a1 1 0 00-1 1v3a1 1 0 001 1h1a1 1 0 001-1V6a1 1 0 00-1-1H5z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SavedMealCard;