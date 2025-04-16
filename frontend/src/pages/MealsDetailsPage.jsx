import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import COLORS from '../lib/constants';

const MealDetailsPage = () => {
  const { id } = useParams();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
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
          navigate('/nutrition'); // Redirect back to nutrition page on error
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
        navigate('/nutrition'); // Redirect back to nutrition page on error
      } finally {
        setLoading(false);
      }
    };

    fetchMealDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: COLORS.BLACK, color: COLORS.WHITE }}>
        <div className="p-8 text-lg font-medium">
          <svg className="animate-spin h-6 w-6 mr-3 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading meal plan details...
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.BLACK, color: COLORS.WHITE }}>
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-4" style={{ color: COLORS.NEON_GREEN }}>
            Meal Plan Details
          </h1>
        </header>
        <p>Meal plan not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.BLACK, color: COLORS.WHITE }}>
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-4" style={{ color: COLORS.NEON_GREEN }}>
          Meal Plan: {mealPlan.title || 'Untitled'}
        </h1>
      </header>
      <div className="max-w-3xl mx-auto rounded-xl shadow-md p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
        {mealPlan.meals && Object.keys(mealPlan.meals).map(day => (
          <div key={day} className="mb-6 p-4 rounded-md border" style={{ borderColor: COLORS.MEDIUM_GRAY }}>
            <h2 className="text-xl font-semibold mb-2" style={{ color: COLORS.WHITE }}>{day}</h2>
            {Object.keys(mealPlan.meals[day]).map(mealType => (
              <div key={mealType} className="mb-3">
                <h3 className="font-medium" style={{ color: COLORS.NEON_GREEN }}>{mealType}</h3>
                <p style={{ color: COLORS.LIGHT_GRAY }}>{mealPlan.meals[day][mealType]}</p>
              </div>
            ))}
          </div>
        ))}
        {mealPlan.notes && (
          <div className="mt-4 p-4 rounded-md border" style={{ borderColor: COLORS.MEDIUM_GRAY }}>
            <h3 className="font-semibold" style={{ color: COLORS.WHITE }}>Notes</h3>
            <p style={{ color: COLORS.LIGHT_GRAY }}>{mealPlan.notes}</p>
          </div>
        )}
        {/* You can add more details here based on your meal plan structure */}
      </div>
    </div>
  );
};

export default MealDetailsPage;