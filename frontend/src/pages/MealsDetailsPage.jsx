import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { COLORS } from '../lib/constants';

const MealDetailsPage = () => {
  const { id } = useParams();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleCompleteMealPlan = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/meal-plans/${mealPlan._id}/complete`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        setMealPlan(response.data);
        toast.success('Meal plan completed!', {
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.NEON_GREEN,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`
          }
        });
      }
    } catch (error) {
      toast.error('Failed to complete meal plan', {
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        }
      });
    }
  };

  // Formatted nutrition component with progress bars
  const NutritionStat = ({ label, value, total, color, unit }) => {
    const percentage = (value / total) * 100;
    return (
      <div className="mb-2 sm:mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs sm:text-sm font-medium">{label}</span>
          <span className="text-xs sm:text-sm">{value}{unit}</span>
        </div>
        <div className="h-1.5 sm:h-2 w-full rounded-full bg-gray-700">
          <div 
            className="h-1.5 sm:h-2 rounded-full" 
            style={{ width: `${percentage}%`, backgroundColor: color }}
          ></div>
        </div>
      </div>
    );
  };

  // Enhanced Meal card component
  const MealCard = ({ meal, index }) => {
    const [expanded, setExpanded] = useState(false);
    const [isCompleted, setIsCompleted] = useState(meal.completed);
    
    // Calculate macronutrient percentages
    const totalCals = meal.protein * 4 + meal.carbs * 4 + meal.fats * 9;
    const proteinPerc = Math.round((meal.protein * 4 / totalCals) * 100);
    const carbsPerc = Math.round((meal.carbs * 4 / totalCals) * 100);
    const fatsPerc = Math.round((meal.fats * 9 / totalCals) * 100);

    const handleCompleteMeal = async () => {
      try {
        const response = await axios.patch(`http://localhost:5000/api/meal-plans/${mealPlan._id}/meals/${index}/complete`, {}, { withCredentials: true });

        if (response.status === 200) {
          setIsCompleted(true);
          toast.success('Meal completed successfully!', {
            style: {
              background: COLORS.DARK_GRAY,
              color: COLORS.NEON_GREEN,
              border: `1px solid ${COLORS.MEDIUM_GRAY}`
            }
          });
        }
      } catch (error) {
        toast.error('Failed to complete meal. Please try again.', {
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.WHITE,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`
          }
        });
      }
    };
    
    return (
      <div className="mb-4 sm:mb-6 overflow-hidden rounded-lg sm:rounded-xl border transition-all" 
           style={{ 
             backgroundColor: COLORS.DARK_GRAY, 
             borderColor: COLORS.MEDIUM_GRAY 
           }}>
        {/* Meal header */}
        <div 
          className="p-4 sm:p-6 cursor-pointer" 
          onClick={() => setExpanded(!expanded)}
          style={{ borderBottom: expanded ? `1px solid ${COLORS.MEDIUM_GRAY}` : 'none' }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
              <div className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full text-xs sm:text-sm font-bold transition-colors"
                  style={{ 
                    backgroundColor: isCompleted ? COLORS.NEON_GREEN : COLORS.BLACK, 
                    color: isCompleted ? COLORS.BLACK : COLORS.NEON_GREEN 
                  }}>
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-bold" style={{ color: COLORS.NEON_GREEN }}>{meal.name}</h3>
                <p className="text-xs sm:text-sm opacity-70">{meal.time}</p>
              </div>
            </div>
            <div className="flex justify-between sm:justify-start items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-lg font-bold">{meal.calories}</span>
                <span className="text-xs opacity-70">kcal</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Macro circles */}
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full" style={{ backgroundColor: "#E74C3C" }}></div>
                  <span className="text-xs">{proteinPerc}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full" style={{ backgroundColor: "#3498DB" }}></div>
                  <span className="text-xs">{carbsPerc}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full" style={{ backgroundColor: "#F39C12" }}></div>
                  <span className="text-xs">{fatsPerc}%</span>
                </div>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16"
                className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Expanded meal details */}
        {expanded && (
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
              {/* Nutrition column */}
              <div>
                <h4 className="text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 opacity-70">Nutrition</h4>
                <div className="p-3 sm:p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                  <div className="grid grid-cols-2 gap-3 mb-3 sm:mb-4 text-center">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold" style={{ color: COLORS.NEON_GREEN }}>{meal.calories}</div>
                      <div className="text-xs opacity-70">CALORIES</div>
                    </div>
                    <div className="flex items-end justify-center">
                      <div className="flex gap-2 sm:gap-3">
                        <div style={{ height: `${proteinPerc}px`, width: "6px", backgroundColor: "#E74C3C", borderRadius: "4px" }}></div>
                        <div style={{ height: `${carbsPerc}px`, width: "6px", backgroundColor: "#3498DB", borderRadius: "4px" }}></div>
                        <div style={{ height: `${fatsPerc}px`, width: "6px", backgroundColor: "#F39C12", borderRadius: "4px" }}></div>
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
              <div className="mt-4 sm:mt-0">
                <h4 className="text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 opacity-70">Ingredients</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {meal.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="mt-1 w-1.5 h-1.5 sm:w-2 sm:h-2 mr-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS.NEON_GREEN }}></div>
                      <span className="text-xs sm:text-sm" style={{ color: COLORS.LIGHT_GRAY }}>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Instructions column */}
              <div className="mt-4 sm:mt-0">
                <h4 className="text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 opacity-70">Instructions</h4>
                <div className="text-xs sm:text-sm leading-relaxed" style={{ color: COLORS.LIGHT_GRAY }}>
                  {meal.instructions.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-2">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end mt-4 sm:mt-6 gap-3">
              <button 
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2"
                style={{ backgroundColor: COLORS.BLACK, color: COLORS.WHITE, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}
                onClick={handleCompleteMeal}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: COLORS.NEON_GREEN }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs sm:text-sm">Complete Meal</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Filter tabs component
  const FilterTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
      { id: 'all', label: 'All Meals' },
      { id: 'breakfast', label: 'Breakfast' },
      { id: 'lunch', label: 'Lunch' }, 
      { id: 'dinner', label: 'Dinner' },
      { id: 'snack', label: 'Snack' }
    ];
    
    return (
      <div className="flex overflow-x-auto pb-2 mb-4 sm:mb-6 hide-scrollbar">
        <div className="flex gap-1.5 sm:gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors ${activeTab === tab.id ? 'font-medium' : ''}`}
              style={{
                backgroundColor: activeTab === tab.id ? COLORS.NEON_GREEN : COLORS.DARK_GRAY,
                color: activeTab === tab.id ? COLORS.BLACK : COLORS.WHITE,
                border: `1px solid ${activeTab === tab.id ? COLORS.NEON_GREEN : COLORS.MEDIUM_GRAY}`
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: COLORS.BLACK, color: COLORS.WHITE }}>
        <div className="flex flex-col items-center p-4 sm:p-8">
          <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 mb-3 sm:mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-base sm:text-lg font-medium">Preparing your meal plan...</p>
          <p className="text-xs sm:text-sm opacity-70 mt-2">This won't take long</p>
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: COLORS.BLACK, color: COLORS.WHITE }}>
        <header className="mb-6 sm:mb-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4" style={{ color: COLORS.NEON_GREEN }}>
              Meal Plan Details
            </h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-8 sm:py-16 max-w-6xl mx-auto">
          <div className="p-6 sm:p-10 rounded-xl text-center" style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto mb-4 sm:mb-6" style={{ color: COLORS.MEDIUM_GRAY }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-lg sm:text-xl mb-2">Meal plan not found</p>
            <p className="text-xs sm:text-sm opacity-70 mb-4 sm:mb-6">The meal plan you're looking for may have been deleted or doesn't exist</p>
            <button 
              onClick={() => navigate('/nutrition')} 
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center gap-2"
              style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div className="min-h-screen pb-8 sm:pb-16" style={{ backgroundColor: COLORS.BLACK, color: COLORS.WHITE }}>
      {/* Fixed header with blurred backdrop */}
      <header className="sticky top-0 z-10 backdrop-blur-md border-b mb-4 sm:mb-8" 
              style={{ backgroundColor: `${COLORS.BLACK}E6`, borderColor: COLORS.MEDIUM_GRAY }}>
        <div className="max-w-6xl mx-auto p-3 sm:p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: COLORS.NEON_GREEN }}>
                {mealPlan.title || 'Your Custom Meal Plan'}
              </h1>
              <p className="text-xs sm:text-sm opacity-75">
                Created {new Date(mealPlan.createdAt).toLocaleDateString()}
                {mealPlan.completed && (
                  <span className="ml-2 inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor" style={{ color: COLORS.NEON_GREEN }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Completed {new Date(mealPlan.completedAt).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/nutrition')} 
                className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2"
                style={{ backgroundColor: COLORS.DARK_GRAY, color: COLORS.WHITE, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        {/* Summary card with total nutrition */}
        <div className="mb-6 sm:mb-10 rounded-lg sm:rounded-xl overflow-hidden shadow-lg" 
             style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Daily Nutrition Summary</h2>
            <p className="text-xs sm:text-sm opacity-70 mb-4 sm:mb-6">Complete macronutrient breakdown for your meal plan</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {/* Calories */}
              <div className="flex flex-col items-center p-3 sm:p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: COLORS.NEON_GREEN }}>
                  {mealPlan.totalNutrition.calories}
                </div>
                <div className="text-xs uppercase tracking-wider opacity-70">Calories</div>
              </div>
              
              {/* Protein with visual bar */}
              <div className="p-3 sm:p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <div className="flex items-center">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full mr-2" style={{ backgroundColor: "#E74C3C" }}></div>
                    <span className="text-xs sm:text-sm font-medium">Protein</span>
                  </div>
                  <span className="text-xs sm:text-sm">{mealPlan.totalNutrition.protein}g</span>
                </div>
                <div className="h-1.5 sm:h-2 w-full rounded-full bg-gray-700">
                  <div 
                    className="h-1.5 sm:h-2 rounded-full" 
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
              <div className="p-3 sm:p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <div className="flex items-center">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full mr-2" style={{ backgroundColor: "#3498DB" }}></div>
                    <span className="text-xs sm:text-sm font-medium">Carbs</span>
                  </div>
                  <span className="text-xs sm:text-sm">{mealPlan.totalNutrition.carbs}g</span>
                </div>
                <div className="h-1.5 sm:h-2 w-full rounded-full bg-gray-700">
                  <div 
                    className="h-1.5 sm:h-2 rounded-full" 
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
              <div className="p-3 sm:p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <div className="flex items-center">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full mr-2" style={{ backgroundColor: "#F39C12" }}></div>
                    <span className="text-xs sm:text-sm font-medium">Fats</span>
                  </div>
                  <span className="text-xs sm:text-sm">{mealPlan.totalNutrition.fats}g</span>
                </div>
                <div className="h-1.5 sm:h-2 w-full rounded-full bg-gray-700">
                  <div 
                    className="h-1.5 sm:h-2 rounded-full" 
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
        <div className="mb-6 sm:mb-10">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold">Your Meals</h2>
            <div className="flex items-center gap-2">
              <button 
                className="p-1.5 sm:p-2 rounded-lg"
                style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <span className="text-xs sm:text-sm opacity-70">{mealPlan.meals.length} meals</span>
            </div>
          </div>
          
          <FilterTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {filteredMeals.length > 0 ? (
            filteredMeals.map((meal, index) => (
              <MealCard key={index} meal={meal} index={index} />
            ))
          ) : (
            <div className="p-6 sm:p-10 text-center rounded-lg sm:rounded-xl" style={{ backgroundColor: COLORS.DARK_GRAY }}>
              <p className="text-sm sm:text-base">No meals found for this filter.</p>
            </div>
          )}

          {/* Complete Plan Button */}
          {!mealPlan.completed && (
            <div className="mt-8 sm:mt-12 flex justify-center">
              <button 
                onClick={handleCompleteMealPlan}
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-medium flex items-center gap-2 transition-transform hover:scale-105"
                style={{ 
                  backgroundColor: COLORS.NEON_GREEN, 
                  color: COLORS.BLACK,
                  boxShadow: `0 0 20px ${COLORS.NEON_GREEN}40`
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Complete Meal Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealDetailsPage;
