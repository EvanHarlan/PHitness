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

// Color palette for the chart (using requested colors)
const MACRO_COLORS = {
  PROTEIN: '#FF4136', // Red for protein
  CARBS: '#0074D9',   // Blue for carbs
  FATS: '#FFDC00'     // Yellow for fats
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
  const [macroData, setMacroData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUserStore();

  useEffect(() => {
    const fetchMealData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get all the user's meal plans from the API
        const response = await axios.get('/api/meal-plans', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        // The API should return an array of meal plans
        const mealPlans = response.data;
        
        if (mealPlans && Array.isArray(mealPlans) && mealPlans.length > 0) {
          // Calculate total macros across all meal plans
          const totalProtein = mealPlans.reduce((sum, plan) => sum + (plan.totalNutrition?.protein || 0), 0);
          const totalCarbs = mealPlans.reduce((sum, plan) => sum + (plan.totalNutrition?.carbs || 0), 0);
          const totalFats = mealPlans.reduce((sum, plan) => sum + (plan.totalNutrition?.fats || 0), 0);
          
          const totalMacros = totalProtein + totalCarbs + totalFats;

          // Calculate percentages
          const proteinPct = totalMacros > 0 ? Math.round((totalProtein / totalMacros) * 100) : 0;
          const carbsPct = totalMacros > 0 ? Math.round((totalCarbs / totalMacros) * 100) : 0;
          const fatsPct = totalMacros > 0 ? Math.round((totalFats / totalMacros) * 100) : 0;

          // Prepare the data for the pie chart
          const macros = [
            { name: 'Protein', value: totalProtein, color: MACRO_COLORS.PROTEIN, percentage: proteinPct },
            { name: 'Carbs', value: totalCarbs, color: MACRO_COLORS.CARBS, percentage: carbsPct },
            { name: 'Fats', value: totalFats, color: MACRO_COLORS.FATS, percentage: fatsPct }
          ];

          setMacroData(macros);
        } else {
          // Handle case where no meal plans are returned
          setMacroData([]);
        }
      } catch (err) {
        console.error('Error fetching meal data:', err);
        setError('Failed to load macronutrient data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealData();
  }, [user]);

  // Render loading state
  if (isLoading) {
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
  if (macroData.length === 0) {
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
      <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-4">Macronutrient Distribution</h3>
      
      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={macroData}
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
              {macroData.map((entry, index) => (
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
        {macroData.map((macro, index) => (
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