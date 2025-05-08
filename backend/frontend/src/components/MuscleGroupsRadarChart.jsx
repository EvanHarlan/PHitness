import React, { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import COLORS from '../lib/constants';
//MUSCLE GROUP COMPONENT THAT DISPLAYS THE MUSCLES TARGETED
const MuscleGroupsRadarChart = () => {
  const [muscleGroupsData, setMuscleGroupsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMuscleGroupsData = async () => {
      try {
        // Get today's date range
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const response = await axios.get('/api/workouts/by-date', {
          params: {
            startDate: startOfDay.toISOString(),
            endDate: endOfDay.toISOString()
          },
          withCredentials: true
        });

        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid workout data format');
        }

        // Process the workouts to count muscle group frequency
        const muscleGroupCounts = {};
        response.data.forEach(workout => {
          if (!workout.exercises || !Array.isArray(workout.exercises)) return;
          
          workout.exercises.forEach(exercise => {
            if (exercise.targetMuscles && typeof exercise.targetMuscles === 'string') {
              const muscles = exercise.targetMuscles.split(',').map(m => m.trim());
              muscles.forEach(muscle => {
                if (muscle) {
                  muscleGroupCounts[muscle] = (muscleGroupCounts[muscle] || 0) + 1;
                }
              });
            }
          });
        });

        // Convert to array format for the radar chart
        const data = Object.entries(muscleGroupCounts).map(([group, value]) => ({
          group,
          value
        }));

        // Sort by muscle group name for consistent display
        data.sort((a, b) => a.group.localeCompare(b.group));

        setMuscleGroupsData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load muscle groups data');
        setLoading(false);
      }
    };

    fetchMuscleGroupsData();
  }, []);

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

  if (muscleGroupsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No workout data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={muscleGroupsData}>
          <PolarGrid stroke={COLORS.MEDIUM_GRAY} />
          <PolarAngleAxis 
            dataKey="group" 
            stroke={COLORS.WHITE}
            tick={{ fill: COLORS.WHITE }}
          />
          <Radar
            name="Muscle Groups"
            dataKey="value"
            stroke={COLORS.NEON_GREEN}
            fill={COLORS.NEON_GREEN}
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MuscleGroupsRadarChart; 