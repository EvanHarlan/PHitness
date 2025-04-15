import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { COLORS } from '../lib/constants';

// Sample data for charts - replace with actual data from MongoDB later
const PLACEHOLDER_DATA = {
  workout: [
    { day: 'Mon', minutes: 45, calories: 320 },
    { day: 'Tue', minutes: 30, calories: 250 },
    { day: 'Wed', minutes: 60, calories: 450 },
    { day: 'Thu', minutes: 0, calories: 0 },
    { day: 'Fri', minutes: 45, calories: 350 },
    { day: 'Sat', minutes: 90, calories: 600 },
    { day: 'Sun', minutes: 20, calories: 180 },
  ],
  nutrition: [
    { day: 'Mon', calories: 2100, protein: 120, carbs: 240, fat: 70 },
    { day: 'Tue', calories: 1950, protein: 130, carbs: 200, fat: 65 },
    { day: 'Wed', calories: 2200, protein: 140, carbs: 250, fat: 75 },
    { day: 'Thu', calories: 1800, protein: 110, carbs: 190, fat: 60 },
    { day: 'Fri', calories: 2050, protein: 125, carbs: 220, fat: 68 },
    { day: 'Sat', calories: 2300, protein: 145, carbs: 260, fat: 78 },
    { day: 'Sun', calories: 1900, protein: 115, carbs: 210, fat: 63 },
  ],
  macros: [
    { name: 'Protein', value: 120 },
    { name: 'Carbs', value: 220 },
    { name: 'Fat', value: 65 },
  ],
  progress: [
    { month: 'Jan', weight: 185 },
    { month: 'Feb', weight: 183 },
    { month: 'Mar', weight: 181 },
    { month: 'Apr', weight: 179 },
    { month: 'May', weight: 177 },
    { month: 'Jun', weight: 176 },
    { month: 'Jul', weight: 174 },
  ]
};

// Custom tooltip for the charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-md shadow-lg" style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value} {entry.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CHART_TYPES = {
  LINE: 'line',
  AREA: 'area',
  BAR: 'bar',
  PIE: 'pie'
};

const StatsDisplay = ({ 
  title, 
  description, 
  chartType = CHART_TYPES.LINE, 
  dataKey = 'workout',
  height = 300,
  xAxisKey = 'day',
  yAxisKey = 'minutes',
  secondaryKey,
  pieColors = [COLORS.NEON_GREEN, '#36A2EB', '#FFCE56', '#4BC0C0'],
  // You can pass in real data here later from MongoDB
  data = null
}) => {
  // State to track active time range (for filtering in the future)
  const [timeRange, setTimeRange] = useState('weekly');
  
  // Use passed data or fallback to placeholder
  const chartData = data || PLACEHOLDER_DATA[dataKey];
  
  // Render different chart types based on the prop
  const renderChart = () => {
    switch(chartType) {
      case CHART_TYPES.AREA:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.MEDIUM_GRAY} />
              <XAxis dataKey={xAxisKey} stroke={COLORS.WHITE} />
              <YAxis stroke={COLORS.WHITE} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey={yAxisKey} 
                stroke={COLORS.NEON_GREEN} 
                fill={COLORS.NEON_GREEN} 
                fillOpacity={0.2} 
              />
              {secondaryKey && (
                <Area 
                  type="monotone" 
                  dataKey={secondaryKey} 
                  stroke="#36A2EB" 
                  fill="#36A2EB" 
                  fillOpacity={0.2} 
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case CHART_TYPES.BAR:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.MEDIUM_GRAY} />
              <XAxis dataKey={xAxisKey} stroke={COLORS.WHITE} />
              <YAxis stroke={COLORS.WHITE} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={yAxisKey} fill={COLORS.NEON_GREEN} radius={[4, 4, 0, 0]} />
              {secondaryKey && (
                <Bar dataKey={secondaryKey} fill="#36A2EB" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case CHART_TYPES.PIE:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case CHART_TYPES.LINE:
      default:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.MEDIUM_GRAY} />
              <XAxis dataKey={xAxisKey} stroke={COLORS.WHITE} />
              <YAxis stroke={COLORS.WHITE} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={yAxisKey} 
                stroke={COLORS.NEON_GREEN} 
                strokeWidth={2}
                dot={{ r: 4, fill: COLORS.NEON_GREEN }}
                activeDot={{ r: 6, fill: COLORS.NEON_GREEN }}
              />
              {secondaryKey && (
                <Line 
                  type="monotone" 
                  dataKey={secondaryKey} 
                  stroke="#36A2EB" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#36A2EB" }}
                  activeDot={{ r: 6, fill: "#36A2EB" }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div 
      className="p-6 rounded-lg"
      style={{ backgroundColor: COLORS.MEDIUM_GRAY, border: `1px solid ${COLORS.DARK_GRAY}` }}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-1" style={{ color: COLORS.NEON_GREEN }}>{title}</h3>
          {description && <p className="text-sm text-[#B0B0B0]">{description}</p>}
        </div>
        
        {/* Time range selector - functionality can be implemented later */}
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button 
            className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${timeRange === 'weekly' ? 'text-black' : 'text-white'}`}
            style={{ 
              backgroundColor: timeRange === 'weekly' ? COLORS.NEON_GREEN : 'transparent',
              border: timeRange !== 'weekly' ? `1px solid ${COLORS.NEON_GREEN}` : 'none'
            }}
            onClick={() => setTimeRange('weekly')}
          >
            Week
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${timeRange === 'monthly' ? 'text-black' : 'text-white'}`}
            style={{ 
              backgroundColor: timeRange === 'monthly' ? COLORS.NEON_GREEN : 'transparent', 
              border: timeRange !== 'monthly' ? `1px solid ${COLORS.NEON_GREEN}` : 'none'
            }}
            onClick={() => setTimeRange('monthly')}
          >
            Month
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${timeRange === 'yearly' ? 'text-black' : 'text-white'}`}
            style={{ 
              backgroundColor: timeRange === 'yearly' ? COLORS.NEON_GREEN : 'transparent',
              border: timeRange !== 'yearly' ? `1px solid ${COLORS.NEON_GREEN}` : 'none'
            }}
            onClick={() => setTimeRange('yearly')}
          >
            Year
          </button>
        </div>
      </div>
      
      {/* The actual chart */}
      {renderChart()}
    </div>
  );
};

export default StatsDisplay;

// Export chart types for easier reference
export { CHART_TYPES, PLACEHOLDER_DATA };