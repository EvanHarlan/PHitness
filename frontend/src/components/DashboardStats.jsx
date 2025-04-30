import { useState, useEffect } from 'react';
import StatsDisplay, { CHART_TYPES } from './StatsDisplay';
import NutritionIntakeChart from './NutritionIntakeChart';
import WeightNotification from './WeightNotification';
import { COLORS } from '../lib/constants';
import axios from 'axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const DashboardStats = ({ user }) => {
  const [workoutData, setWorkoutData] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      try {
        // Get the start and end dates for the current week
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of current week

        console.log('Fetching workouts between:', startOfWeek.toISOString(), 'and', endOfWeek.toISOString());

        const response = await axios.get('http://localhost:5000/api/workouts/by-date', {
          params: {
            startDate: startOfWeek.toISOString(),
            endDate: endOfWeek.toISOString()
          },
          withCredentials: true
        });

        console.log('Received workout data:', response.data);

        // Process the data to match the chart format
        const processedData = processWorkoutData(response.data);
        console.log('Processed data for chart:', processedData);
        setWorkoutData(processedData);
      } catch (error) {
        console.error('Error fetching workout data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, []);

  useEffect(() => {
    fetchWeightData();
  }, []);

  const processWorkoutData = (workouts) => {
    // Create an array for all days of the week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const processedData = days.map(day => ({
      day,
      minutes: 0,
      calories: 0
    }));

    // Fill in the data for days that have workouts
    workouts.forEach(workout => {
      const workoutDate = new Date(workout.createdAt);
      const dayIndex = workoutDate.getDay();
      const dayData = processedData[dayIndex];
      
      // Set total time spent in minutes
      dayData.minutes = workout.totalTimeSpent || 0;
      
      // Handle estimated calories by taking average of the two numbers
      if (workout.estimatedCalories) {
        const caloriesStr = workout.estimatedCalories.toString();
        if (caloriesStr.length === 6) { // Format like "300400"
          const firstNum = parseInt(caloriesStr.substring(0, 3));
          const secondNum = parseInt(caloriesStr.substring(3));
          dayData.calories = Math.round((firstNum + secondNum) / 2);
        } else {
          dayData.calories = parseInt(caloriesStr) || 0;
        }
      }
    });

    console.log('Processed data:', processedData);
    return processedData;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString(); // Ensure full ISO string with timezone
  };

  const fetchWeightData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/weight-tracking/history', {
        withCredentials: true
      });
      
      // Transform the data for the chart, ensuring all values are properly formatted
      const formattedData = response.data
        .map(entry => ({
          // Convert date to timestamp for sorting
          timestamp: new Date(entry.date).getTime(),
          // Format date for display
          formattedDate: formatDate(entry.date),
          // Ensure weight is a number
          weight: Number(entry.weight),
          // Keep entry type as string
          entryType: entry.entryType
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(entry => ({
          // Remove timestamp and use formatted date for display
          date: entry.formattedDate,
          weight: entry.weight,
          entryType: entry.entryType
        }));
      
      setWeightData(formattedData);
    } catch (error) {
      console.error('Error fetching weight data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: COLORS.NEON_GREEN }}></div>
      </div>
    );
  }

  // Custom tooltip component with properly formatted data
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-md shadow-lg" style={{ 
          backgroundColor: COLORS.DARK_GRAY,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`,
          color: COLORS.WHITE
        }}>
          <p className="font-medium">
            {new Date(label).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })}
          </p>
          <p style={{ color: COLORS.NEON_GREEN }}>
            Weight: {payload[0].value} lbs
          </p>
          <p className="text-sm opacity-75">
            {payload[0].payload.entryType === 'weekly' ? 'Weekly Entry' : 'Daily Entry'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom dot component to handle entry type styling
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const isWeekly = payload.entryType === 'weekly';
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isWeekly ? 4 : 2}
        fill={isWeekly ? COLORS.NEON_GREEN : 'transparent'}
        stroke={COLORS.NEON_GREEN}
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="space-y-8">
      <WeightNotification />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workout Activity Chart */}
        <StatsDisplay 
          title="Workout Activity" 
          description="Your workout duration and calories burned over the past week"
          chartType={CHART_TYPES.LINE}
          dataKey="workout"
          yAxisKey="minutes"
          secondaryKey="calories"
          data={workoutData}
          yAxisLabel="Minutes"
          secondaryYAxisLabel="Calories"
        />
        
        {/* Weight Progress Chart */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.DARK_GRAY }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.WHITE }}>
            Weight Progress
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.MEDIUM_GRAY} />
                <XAxis 
                  dataKey="date"
                  stroke={COLORS.LIGHT_GRAY}
                  tick={{ fill: COLORS.WHITE }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                />
                <YAxis 
                  stroke={COLORS.LIGHT_GRAY}
                  tick={{ fill: COLORS.WHITE }}
                  label={{ 
                    value: 'Weight (lbs)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: COLORS.WHITE }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke={COLORS.NEON_GREEN}
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Nutrition Intake Chart */}
        <NutritionIntakeChart />
      </div>
    </div>
  );
};

export default DashboardStats;