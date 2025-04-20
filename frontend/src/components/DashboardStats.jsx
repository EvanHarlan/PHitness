import { useState, useEffect } from 'react';
import StatsDisplay, { CHART_TYPES } from './StatsDisplay';
import { COLORS } from '../lib/constants';
import axios from 'axios';

const DashboardStats = ({ user }) => {
  const [workoutData, setWorkoutData] = useState([]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: COLORS.NEON_GREEN }}></div>
      </div>
    );
  }

  return (
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
      <StatsDisplay 
        title="Weight Progress" 
        description="Your weight progress over time"
        chartType={CHART_TYPES.LINE}
        dataKey="progress"
        xAxisKey="month"
        yAxisKey="weight"
      />
      
      {/* Nutrition Intake Chart */}
      <StatsDisplay 
        title="Caloric Intake" 
        description="Your daily caloric consumption"
        chartType={CHART_TYPES.BAR}
        dataKey="nutrition"
        yAxisKey="calories"
      />
      
      {/* Add more charts as needed */}
    </div>
  );
};

export default DashboardStats;