import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import SavedMealCard from './SavedMealCard';
import COLORS from '../lib/constants';

// THIS IS THE MEAL LIBRARY. THIS USES THE MEAL CARD COMPONENT TO SHOW THE SAVED MEALS.
// THIS COMPONENT ALLOWS FOR FAVORITING AND DELETING MEALS FROM THE LIST.

const SavedMealsList = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'favorites'

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/meal-plans', { withCredentials: true }); // Corrected endpoint
      setMeals(response.data);
    } catch (error) {
      console.error('Error fetching meals:', error);
      toast.error('Failed to load your meals', {
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

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm('Are you sure you want to delete this meal plan?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/meal-plans/${mealId}`, { withCredentials: true }); // Corrected endpoint
      setMeals(meals.filter(meal => meal._id !== mealId));
      toast.success('Meal plan deleted successfully', {
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.NEON_GREEN,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        }
      });
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast.error('Failed to delete meal plan', {
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        }
      });
    }
  };

  const handleToggleFavorite = async (mealId) => {
    try {
      const response = await axios.put(`/api/meal-plans/${mealId}/favorite`, {}, { withCredentials: true }); // Corrected endpoint and method

      // Update the meal in state after successful toggle
      if (response.data.success) {
        setMeals(meals.map(meal =>
          meal._id === mealId
            ? { ...meal, favorite: response.data.favorite }
            : meal
        ));
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
      toast.error("Failed to update favorite status. Please try again.", { // Added error toast
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
      <div className="text-center py-4" style={{ color: COLORS.LIGHT_GRAY }}>
        Loading your meals...
      </div>
    );
  }

  // Filter meals based on current view mode
  const filteredMeals = viewMode === 'favorites'
    ? meals.filter(meal => meal.favorite)
    : meals;

  if (!meals.length) {
    return (
      <div className="text-center py-4" style={{ color: COLORS.LIGHT_GRAY }}>
        No saved meals yet. Generate a meal plan to get started!
      </div>
    );
  }

  if (viewMode === 'favorites' && !filteredMeals.length) {
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
            All Meals
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
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-.118l-2.8-2.034c-.783-.57-.38-1.81.588-.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Favorites
          </button>
        </div>
        <div className="text-center py-4" style={{ color: COLORS.LIGHT_GRAY }}>
          No favorite meals yet. Star meals to add them to favorites!
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
          All Meals
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
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-.118l-2.8-2.034c-.783-.57-.38-1.81.588-.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Favorites
        </button>
      </div>
      <div className="grid gap-3">
        {filteredMeals.map(meal => (
          <SavedMealCard
            key={meal._id}
            meal={meal}
            onDeleteMeal={handleDeleteMeal}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};

export default SavedMealsList;