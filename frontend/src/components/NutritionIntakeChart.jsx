import { useState, useEffect } from 'react';
//NUTRITION INTAKE COMPONENT THAT DISPLAYS CALORIES EATEN FOR THE DAY, FOR A WEEK PERIOD
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { COLORS } from '../lib/constants';
import axios from 'axios';

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-md shadow-lg" style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value} kcal
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const NutritionIntakeChart = () => {
  const [nutritionData, setNutritionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        setLoading(true);
        // Get the start and end dates for the current week
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);


        // Fetch meal plans for the date range
        const response = await axios.get('http://localhost:5000/api/meal-plans', {
          params: {
            startDate: startOfWeek.toISOString(),
            endDate: endOfWeek.toISOString()
          },
          withCredentials: true
        });



        // Process the data to get daily calories from completed meals
        const processedData = processNutritionData(response.data);
        setNutritionData(processedData);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load nutrition data');
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionData();
  }, []);

  const processNutritionData = (mealPlans) => {
    // Create an array for all days of the week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const processedData = days.map(day => ({
      day,
      calories: 0
    }));

    // Sum up calories from completed meals for each day
    mealPlans.forEach(plan => {
      plan.meals.forEach(meal => {
        if (meal.completed) {
          const mealDate = new Date(plan.createdAt);
          const dayIndex = mealDate.getDay();
          processedData[dayIndex].calories += meal.calories;
        }
      });
    });

    return processedData;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: COLORS.NEON_GREEN }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl" style={{ backgroundColor: COLORS.MEDIUM_GRAY, border: `1px solid ${COLORS.DARK_GRAY}` }}>
      <div className="mb-6">
        <h3 className="text-xl font-bold" style={{ color: COLORS.NEON_GREEN }}>Weekly Caloric Intake</h3>
        <p className="text-sm opacity-70">Calories from completed meals this week</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={nutritionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.DARK_GRAY} />
            <XAxis 
              dataKey="day" 
              stroke={COLORS.WHITE}
              tick={{ fill: COLORS.WHITE }}
            />
            <YAxis 
              stroke={COLORS.WHITE}
              tick={{ fill: COLORS.WHITE }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: COLORS.DARK_GRAY,
                border: `1px solid ${COLORS.MEDIUM_GRAY}`,
                color: COLORS.WHITE
              }}
              formatter={(value) => [`${value} kcal`, 'Calories']}
            />
            <Bar 
              dataKey="calories" 
              fill={COLORS.NEON_GREEN}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NutritionIntakeChart; 