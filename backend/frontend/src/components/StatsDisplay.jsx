import { useState } from 'react';
//STATS DISPLAY COMPONENT
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

// Custom tooltip for the charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-md shadow-lg" style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.dataKey === 'minutes' ? 'Total Time Spent' : 'Calories Burned'}: {entry.value} {entry.dataKey === 'minutes' ? 'min' : 'cal'}
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
  data = null
}) => {
  // Use passed data or fallback to placeholder
  const chartData = data || PLACEHOLDER_DATA[dataKey];
  
  // Render different chart types based on the prop
  const renderChart = () => {
    switch(chartType) {
      case CHART_TYPES.LINE:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.MEDIUM_GRAY} />
              <XAxis 
                dataKey={xAxisKey} 
                stroke={COLORS.WHITE}
                tick={{ fill: COLORS.WHITE }}
              />
              <YAxis 
                yAxisId="left"
                stroke={COLORS.WHITE}
                tick={{ fill: COLORS.WHITE }}
                label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: COLORS.WHITE }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke={COLORS.WHITE}
                tick={{ fill: COLORS.WHITE }}
                label={{ value: 'Calories', angle: 90, position: 'insideRight', fill: COLORS.WHITE }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey={yAxisKey} 
                stroke={COLORS.NEON_GREEN} 
                strokeWidth={2}
                dot={{ r: 4, fill: COLORS.NEON_GREEN }}
                activeDot={{ r: 6, fill: COLORS.NEON_GREEN }}
                name="Time Spent"
              />
              {secondaryKey && (
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey={secondaryKey} 
                  stroke="#36A2EB" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#36A2EB" }}
                  activeDot={{ r: 6, fill: "#36A2EB" }}
                  name="Calories Burned"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
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
    }
  };

  return (
    <div 
      className="p-6 rounded-lg"
      style={{ backgroundColor: COLORS.MEDIUM_GRAY, border: `1px solid ${COLORS.DARK_GRAY}` }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-1" style={{ color: COLORS.NEON_GREEN }}>{title}</h3>
        {description && <p className="text-sm text-[#B0B0B0]">{description}</p>}
      </div>
      {renderChart()}
    </div>
  );
};

export default StatsDisplay;

export { CHART_TYPES};
