import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import COLORS from '../lib/constants';
import { FaStar, FaRegStar } from 'react-icons/fa';

const MealDetailsPage = () => {
  const { id } = useParams();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMealDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/meal-plans/${id}`, { withCredentials: true });
        if (response.status >= 200 && response.status < 300) {
          setMealPlan(response.data);
        } else {
          toast.error(`Failed to fetch meal plan details. Status: ${response.status}`, {
            style: {
              background: COLORS.DARK_GRAY,
              color: COLORS.WHITE,
              border: `1px solid ${COLORS.MEDIUM_GRAY}`
            }
          });
          navigate('/nutrition');
        }
      } catch (error) {
        console.error('Error fetching meal plan details:', error);
        toast.error('Failed to fetch meal plan details. Please try again.', {
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.WHITE,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`
          }
        });
        navigate('/nutrition');
      } finally {
        setLoading(false);
      }
    };

    fetchMealDetails();
  }, [id, navigate]);

  // Formatted nutrition component with progress bars
  const NutritionStat = ({ label, value, total, color, unit }) => {
    const percentage = (value / total) * 100;
    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm">{value}{unit}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-700">
          <div 
            className="h-2 rounded-full" 
            style={{ width: `${percentage}%`, backgroundColor: color }}
          ></div>
        </div>
      </div>
    );
  };

  // Enhanced Meal card component
  const MealCard = ({ meal, index }) => {
    const [expanded, setExpanded] = useState(false);
    
    // Calculate macronutrient percentages
    const totalCals = meal.protein * 4 + meal.carbs * 4 + meal.fats * 9;
    const proteinPerc = Math.round((meal.protein * 4 / totalCals) * 100);
    const carbsPerc = Math.round((meal.carbs * 4 / totalCals) * 100);
    const fatsPerc = Math.round((meal.fats * 9 / totalCals) * 100);
    
    return (
      <div key={index} className="mb-6 rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.WHITE }}>{meal.name}</h3>
              <p className="text-sm opacity-70" style={{ color: COLORS.LIGHT_GRAY }}>{meal.time}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-1">
                <span className="text-lg font-bold">{meal.calories}</span>
                <span className="text-xs opacity-70">kcal</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Macro circles */}
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#E74C3C" }}></div>
                  <span className="text-xs">{proteinPerc}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#3498DB" }}></div>
                  <span className="text-xs">{carbsPerc}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#F39C12" }}></div>
                  <span className="text-xs">{fatsPerc}%</span>
                </div>
              </div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                style={{ color: COLORS.LIGHT_GRAY }}
              >
                {expanded ? '▼' : '▶'}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded meal details */}
        {expanded && (
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Nutrition column */}
              <div>
                <h4 className="text-sm uppercase tracking-wider mb-4 opacity-70">Nutrition</h4>
                <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                    <div>
                      <div className="text-2xl font-bold" style={{ color: COLORS.NEON_GREEN }}>{meal.calories}</div>
                      <div className="text-xs opacity-70">CALORIES</div>
                    </div>
                    <div className="flex items-end justify-center">
                      <div className="flex gap-3">
                        <div style={{ height: `${proteinPerc}px`, width: "8px", backgroundColor: "#E74C3C", borderRadius: "4px" }}></div>
                        <div style={{ height: `${carbsPerc}px`, width: "8px", backgroundColor: "#3498DB", borderRadius: "4px" }}></div>
                        <div style={{ height: `${fatsPerc}px`, width: "8px", backgroundColor: "#F39C12", borderRadius: "4px" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <NutritionStat 
                    label="Protein" 
                    value={meal.protein} 
                    total={meal.protein + meal.carbs + meal.fats} 
                    color="#E74C3C" 
                    unit="g"
                  />
                  <NutritionStat 
                    label="Carbs" 
                    value={meal.carbs} 
                    total={meal.protein + meal.carbs + meal.fats} 
                    color="#3498DB" 
                    unit="g"
                  />
                  <NutritionStat 
                    label="Fats" 
                    value={meal.fats} 
                    total={meal.protein + meal.carbs + meal.fats} 
                    color="#F39C12" 
                    unit="g"
                  />
                </div>
              </div>
              
              {/* Ingredients column */}
              <div>
                <h4 className="text-sm uppercase tracking-wider mb-4 opacity-70">Ingredients</h4>
                <ul className="space-y-2">
                  {meal.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="mt-1 w-2 h-2 mr-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS.NEON_GREEN }}></div>
                      <span style={{ color: COLORS.LIGHT_GRAY }}>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Instructions column */}
              <div>
                <h4 className="text-sm uppercase tracking-wider mb-4 opacity-70">Instructions</h4>
                <div className="text-sm leading-relaxed" style={{ color: COLORS.LIGHT_GRAY }}>
                  {meal.instructions.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-2">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.BLACK }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.NEON_GREEN }}></div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.BLACK, color: COLORS.WHITE }}>
        <header className="mb-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-4" style={{ color: COLORS.NEON_GREEN }}>
              Meal Plan Details
            </h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-16 max-w-6xl mx-auto">
          <div className="p-10 rounded-xl text-center" style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto mb-6" style={{ color: COLORS.MEDIUM_GRAY }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xl mb-2">Meal plan not found</p>
            <p className="text-sm opacity-70 mb-6">The meal plan you're looking for may have been deleted or doesn't exist</p>
            <button 
              onClick={() => navigate('/nutrition')} 
              className="px-6 py-3 rounded-lg text-sm font-medium inline-flex items-center gap-2"
              style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Nutrition
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter meals based on active tab
  const filteredMeals = activeTab === 'all' 
    ? mealPlan.meals 
    : mealPlan.meals.filter(meal => meal.time.toLowerCase().includes(activeTab));

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: COLORS.BLACK, color: COLORS.WHITE }}>
      {/* Fixed header with blurred backdrop */}
      <header className="sticky top-0 z-10 backdrop-blur-md border-b mb-8" 
              style={{ backgroundColor: `${COLORS.BLACK}E6`, borderColor: COLORS.MEDIUM_GRAY }}>
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: COLORS.NEON_GREEN }}>
                {mealPlan.title || 'Your Custom Meal Plan'}
              </h1>
              <p className="text-sm opacity-75">Created {new Date(mealPlan.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  try {
                    const response = await axios.put(
                      `http://localhost:5000/api/meal-plans/${id}/favorite`,
                      { is_favorite: !mealPlan.isFavorite },
                      { withCredentials: true }
                    );
                    if (response.status === 200) {
                      setMealPlan({ ...mealPlan, isFavorite: !mealPlan.isFavorite });
                      toast.success(`Meal plan ${mealPlan.isFavorite ? 'removed from' : 'added to'} favorites`);
                    }
                  } catch (error) {
                    console.error('Error toggling favorite:', error);
                    toast.error('Failed to update favorite status');
                  }
                }}
                className="p-2 rounded-lg"
                style={{ backgroundColor: COLORS.DARK_GRAY, color: mealPlan.isFavorite ? COLORS.NEON_GREEN : COLORS.WHITE }}
              >
                {mealPlan.isFavorite ? <FaStar size={20} /> : <FaRegStar size={20} />}
              </button>
              <button 
                onClick={() => navigate('/nutrition')} 
                className="px-4 py-2 rounded-lg text-sm font-medium hidden md:flex items-center gap-2"
                style={{ backgroundColor: COLORS.DARK_GRAY, color: COLORS.WHITE, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6">
        {/* Summary card with total nutrition */}
        <div className="mb-10 rounded-xl overflow-hidden shadow-lg" 
             style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Daily Nutrition Summary</h2>
            <p className="text-sm opacity-70 mb-6">Complete macronutrient breakdown for your meal plan</p>
            
            <div className="grid md:grid-cols-4 gap-6">
              {/* Calories */}
              <div className="flex flex-col items-center p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                <div className="text-3xl font-bold mb-1" style={{ color: COLORS.NEON_GREEN }}>
                  {mealPlan.totalNutrition.calories}
                </div>
                <div className="text-xs uppercase tracking-wider opacity-70">Calories</div>
              </div>
              
              {/* Protein with visual bar */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: "#E74C3C" }}></div>
                    <span className="font-medium">Protein</span>
                  </div>
                  <span>{mealPlan.totalNutrition.protein}g</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-700">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${(mealPlan.totalNutrition.protein * 4 / mealPlan.totalNutrition.calories) * 100}%`, 
                      backgroundColor: "#E74C3C" 
                    }}
                  ></div>
                </div>
                <div className="text-xs mt-1 opacity-70 text-right">
                  {Math.round((mealPlan.totalNutrition.protein * 4 / mealPlan.totalNutrition.calories) * 100)}% of total
                </div>
              </div>
              
              {/* Carbs with visual bar */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: "#3498DB" }}></div>
                    <span className="font-medium">Carbs</span>
                  </div>
                  <span>{mealPlan.totalNutrition.carbs}g</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-700">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${(mealPlan.totalNutrition.carbs * 4 / mealPlan.totalNutrition.calories) * 100}%`, 
                      backgroundColor: "#3498DB" 
                    }}
                  ></div>
                </div>
                <div className="text-xs mt-1 opacity-70 text-right">
                  {Math.round((mealPlan.totalNutrition.carbs * 4 / mealPlan.totalNutrition.calories) * 100)}% of total
                </div>
              </div>
              
              {/* Fats with visual bar */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: "#F39C12" }}></div>
                    <span className="font-medium">Fats</span>
                  </div>
                  <span>{mealPlan.totalNutrition.fats}g</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-700">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${(mealPlan.totalNutrition.fats * 9 / mealPlan.totalNutrition.calories) * 100}%`, 
                      backgroundColor: "#F39C12" 
                    }}
                  ></div>
                </div>
                <div className="text-xs mt-1 opacity-70 text-right">
                  {Math.round((mealPlan.totalNutrition.fats * 9 / mealPlan.totalNutrition.calories) * 100)}% of total
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meals section with filters */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Your Meals</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-70">{mealPlan.meals.length} meals</span>
            </div>
          </div>
          
          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'all' ? 'bg-green-500 text-black' : 'bg-gray-700 text-white'
              }`}
            >
              All Meals
            </button>
            <button
              onClick={() => setActiveTab('breakfast')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'breakfast' ? 'bg-green-500 text-black' : 'bg-gray-700 text-white'
              }`}
            >
              Breakfast
            </button>
            <button
              onClick={() => setActiveTab('lunch')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'lunch' ? 'bg-green-500 text-black' : 'bg-gray-700 text-white'
              }`}
            >
              Lunch
            </button>
            <button
              onClick={() => setActiveTab('dinner')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'dinner' ? 'bg-green-500 text-black' : 'bg-gray-700 text-white'
              }`}
            >
              Dinner
            </button>
            <button
              onClick={() => setActiveTab('snack')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'snack' ? 'bg-green-500 text-black' : 'bg-gray-700 text-white'
              }`}
            >
              Snacks
            </button>
          </div>
          
          {filteredMeals.length > 0 ? (
            filteredMeals.map((meal, index) => (
              <MealCard key={index} meal={meal} index={index} />
            ))
          ) : (
            <div className="p-10 text-center rounded-xl" style={{ backgroundColor: COLORS.DARK_GRAY }}>
              <p>No meals found for this filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealDetailsPage; 