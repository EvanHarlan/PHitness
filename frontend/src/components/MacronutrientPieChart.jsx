import { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';
import { COLORS } from '../lib/constants';
import axios from 'axios';
import { useUserStore } from '../stores/useUserStore';

// Color palette for the chart 
const MACRO_COLORS = {
  PROTEIN: '#FF4136', 
  CARBS: '#0074D9',   
  FATS: '#FFDC00'     
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="p-3 rounded-md shadow-lg" style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
        <p className="font-medium mb-1" style={{ color: data.payload.color }}>{data.name}</p>
        <p className="text-sm">{data.value}g ({data.payload.percentage}%)</p>
      </div>
    );
  }
  return null;
};

// Custom legend renderer for better mobile display
const renderLegend = (props) => {
  const { payload } = props;
  
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 p-0">
      {payload.map((entry, index) => (
        <li key={`legend-${index}`} className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs sm:text-sm">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

const MacronutrientPieChart = () => {
  const [macronutrientData, setMacronutrientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUserStore();

  useEffect(() => {
    const fetchMacronutrientData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get today's date range
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        // Fetch meal plans for today only
        const response = await axios.get('/api/meal-plans', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          params: {
            startDate: startOfDay.toISOString(),
            endDate: endOfDay.toISOString()
          },
          withCredentials: true
        });

        // Process the data to get macronutrient totals from completed meals
        const processedData = processMacronutrientData(response.data);
        setMacronutrientData(processedData);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load macronutrient data');
      } finally {
        setLoading(false);
      }
    };

    fetchMacronutrientData();
  }, [user]);

  const processMacronutrientData = (mealPlans) => {
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    // Sum up macronutrients from completed meals
    mealPlans.forEach(plan => {
      plan.meals.forEach(meal => {
        if (meal.completed) {
          totalProtein += meal.protein;
          totalCarbs += meal.carbs;
          totalFats += meal.fats;
        }
      });
    });

    // Calculate total grams
    const totalGrams = totalProtein + totalCarbs + totalFats;

    // Calculate percentages
    const proteinPercentage = totalGrams > 0 ? Math.round((totalProtein / totalGrams) * 100) : 0;
    const carbsPercentage = totalGrams > 0 ? Math.round((totalCarbs / totalGrams) * 100) : 0;
    const fatsPercentage = totalGrams > 0 ? Math.round((totalFats / totalGrams) * 100) : 0;

    return [
      { name: 'Protein', value: totalProtein, color: MACRO_COLORS.PROTEIN, percentage: proteinPercentage },
      { name: 'Carbs', value: totalCarbs, color: MACRO_COLORS.CARBS, percentage: carbsPercentage },
      { name: 'Fats', value: totalFats, color: MACRO_COLORS.FATS, percentage: fatsPercentage }
    ];
  };

  // Render loading state
  if (loading) {
    return (
      <div 
        className="p-6 rounded-xl flex items-center justify-center"
        style={{ 
          backgroundColor: 'rgba(30, 30, 30, 0.8)', 
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
          height: '300px'
        }}
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div 
        className="p-6 rounded-xl flex items-center justify-center"
        style={{ 
          backgroundColor: 'rgba(30, 30, 30, 0.8)', 
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
          height: '300px'
        }}
      >
        <p>{error}</p>
      </div>
    );
  }

  // Render when no user is logged in
  if (!user) {
    return (
      <div 
        className="p-6 rounded-xl flex items-center justify-center"
        style={{ 
          backgroundColor: 'rgba(30, 30, 30, 0.8)', 
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
          height: '300px'
        }}
      >
        <p>Please log in to view your macronutrient data</p>
      </div>
    );
  }

  // Render when no data is available
  if (macronutrientData.length === 0) {
    return (
      <div 
        className="p-6 rounded-xl flex items-center justify-center"
        style={{ 
          backgroundColor: 'rgba(30, 30, 30, 0.8)', 
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
          height: '300px'
        }}
      >
        <p>No macronutrient data available. Create a meal plan to see your nutrition breakdown.</p>
      </div>
    );
  }

  return (
    <div 
      className="p-4 sm:p-6 rounded-xl"
      style={{ 
        backgroundColor: 'rgba(30, 30, 30, 0.8)', 
        boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold" style={{ color: COLORS.NEON_GREEN }}>Today's Macronutrient Breakdown</h3>
        <p className="text-sm opacity-70">Distribution of protein, carbs, and fats from completed meals today</p>
      </div>
      
      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={macronutrientData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={1}
              stroke="rgba(0,0,0,0.1)"
              label={({ name, percentage }) => `${percentage}%`}
              labelLine={false}
            >
              {macronutrientData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.3))' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 sm:mt-4 grid grid-cols-3 gap-1 sm:gap-2">
        {macronutrientData.map((macro, index) => (
          <div 
            key={index} 
            className="text-center p-2 rounded"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.15)',
              borderLeft: `3px solid ${macro.color}`
            }}
          >
            <p className="text-xs sm:text-sm font-medium" style={{ color: macro.color }}>{macro.name}</p>
            <p className="text-base sm:text-lg font-medium">{macro.value}g</p>
            <p className="text-xs opacity-50">{macro.percentage}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MacronutrientPieChart;