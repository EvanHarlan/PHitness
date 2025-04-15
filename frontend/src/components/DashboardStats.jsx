import StatsDisplay, { CHART_TYPES } from './StatsDisplay';
import { COLORS } from '../lib/constants';

const DashboardStats = ({ user }) => {
  // In the future, you can fetch actual data from MongoDB here
  // For now, we're using placeholder data
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Workout Duration Chart */}
      <StatsDisplay 
        title="Workout Activity" 
        description="Your workout duration over the past week"
        chartType={CHART_TYPES.AREA}
        dataKey="workout"
        yAxisKey="minutes"
        secondaryKey="calories"
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
      
      {/* Macronutrient Distribution */}
      <StatsDisplay 
        title="Macronutrient Breakdown" 
        description="Your average macronutrient distribution"
        chartType={CHART_TYPES.PIE}
        dataKey="macros"
        pieColors={[COLORS.NEON_GREEN, '#36A2EB', '#FF6384']}
      />
      
      {/* Add more charts as needed */}
    </div>
  );
};

export default DashboardStats;