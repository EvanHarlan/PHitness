import React, { PureComponent } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { COLORS } from '../lib/constants';
import axios from 'axios';

//NEEDLE CHART COMPONENT THAT DISPLAYS PERCENT COMPLETION OF EXERCISES AND MEALS
const RADIAN = Math.PI / 180;
const data = [
  { name: 'Unsatisfactory', value: 33, color: '#ff4444' },
  { name: 'Satisfactory', value: 33, color: '#ffbb33' },
  { name: 'Perfect', value: 34, color: '#00C851' },
];

const cx = 150;
const cy = 150;
const iR = 50;
const oR = 100;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: COLORS.BLACK,
        padding: '8px',
        border: `1px solid ${COLORS.NEON_GREEN}`,
        borderRadius: '4px'
      }}>
        <p style={{ color: COLORS.WHITE, margin: 0 }}>
          {payload[0].name}
        </p>
      </div>
    );
  }
  return null;
};

//logic for needle in graph
const needle = (value, data, cx, cy, iR, oR, color) => {
  let total = 0;
  data.forEach((v) => {
    total += v.value;
  });
  const ang = 180.0 * (1 - value / total);
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  const r = 5;
  const x0 = cx + 5;
  const y0 = cy + 5;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return [
    <circle cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
    <path d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`} stroke="none" fill={color} />,
  ];
};

export default class DailySatisfaction extends PureComponent {
  state = {
    satisfactionValue: 0,
    loading: true,
    error: null
  };

  componentDidMount() {
    this.fetchCompletionData();
  }

  fetchCompletionData = async () => {
    try {
      // Get today's date range
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      // Fetch completed meals
      const mealsResponse = await axios.get('http://localhost:5000/api/meal-plans', {
        params: {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString()
        },
        withCredentials: true
      });

      // Fetch completed workouts and their exercises
      const workoutsResponse = await axios.get('http://localhost:5000/api/workouts/by-date', {
        params: {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString()
        },
        withCredentials: true
      });

      // Get exercise tracking data for today's workouts
      const completedExercises = new Set();
      for (const workout of workoutsResponse.data) {
        try {
          const trackingResponse = await axios.get(`http://localhost:5000/api/exercise-tracking/workout/${workout._id}`, {
            withCredentials: true
          });
          
          if (trackingResponse.data.success) {
            trackingResponse.data.data.forEach(tracking => {
              completedExercises.add(tracking.exerciseId);
            });
          }
        } catch (error) {
          console.error('Error fetching exercise tracking:', error);
        }
      }

      // Calculate completion rates
      const completedMeals = mealsResponse.data.reduce((total, plan) => 
        total + plan.meals.filter(meal => meal.completed).length, 0);
      const totalMeals = mealsResponse.data.reduce((total, plan) => 
        total + plan.meals.length, 0);
      
      const totalExercises = workoutsResponse.data.reduce((total, workout) => 
        total + workout.exercises.length, 0);

      // Calculate satisfaction score %
      const mealScore = totalMeals > 0 ? (completedMeals / totalMeals) * 50 : 0;
      const workoutScore = totalExercises > 0 ? (completedExercises.size / totalExercises) * 50 : 0;
      const satisfactionValue = Math.round(mealScore + workoutScore);

      this.setState({ satisfactionValue, loading: false });
    } catch (error) {
      console.error('Error fetching completion data:', error);
      this.setState({ error: 'Failed to load completion data', loading: false });
    }
  };

  render() {
    const { satisfactionValue, loading, error } = this.state;

    if (loading) {
      return (
        <div className="w-full h-64" style={{ backgroundColor: COLORS.MEDIUM_GRAY }}>
          <div className="p-4 flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: COLORS.NEON_GREEN }}></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full h-64" style={{ backgroundColor: COLORS.MEDIUM_GRAY }}>
          <div className="p-4 flex items-center justify-center h-full">
            <p style={{ color: COLORS.LIGHT_GRAY }}>{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-64" style={{ backgroundColor: COLORS.MEDIUM_GRAY }}>
        <div className="p-4">
          <p className="text-sm mb-4" style={{ color: COLORS.LIGHT_GRAY }}>
            Tracks your completed meals and workouts for today
          </p>
          <div className="flex items-center justify-center gap-4">
            <PieChart width={300} height={300}>
              <Pie
                dataKey="value"
                startAngle={180}
                endAngle={0}
                data={data}
                cx={cx}
                cy={cy}
                innerRadius={iR}
                outerRadius={oR}
                fill="#8884d8"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {needle(satisfactionValue, data, cx, cy, iR, oR, COLORS.NEON_GREEN)}
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold" style={{ color: COLORS.NEON_GREEN }}>
                {satisfactionValue}%
              </span>
              <span className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
                Complete
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
