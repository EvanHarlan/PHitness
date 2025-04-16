import { useUserStore } from '../stores/useUserStore';
import { Link } from 'react-router-dom';
import { COLORS } from '../lib/constants';
import DashboardStats from '../components/DashboardStats';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const HomePage = () => {
  // Get user authentication status from your store
  const { user } = useUserStore();

  // Muscle groups data for radar chart
  const muscleGroupsData = [
    { group: 'Chest', value: user?.stats?.muscleGroups?.chest || 65 },
    { group: 'Back', value: user?.stats?.muscleGroups?.back || 80 },
    { group: 'Legs', value: user?.stats?.muscleGroups?.legs || 45 },
    { group: 'Shoulders', value: user?.stats?.muscleGroups?.shoulders || 60 },
    { group: 'Arms', value: user?.stats?.muscleGroups?.arms || 70 },
    { group: 'Core', value: user?.stats?.muscleGroups?.core || 55 },
  ];

  // Mock nutrition data
  const nutritionData = [
    { day: 'Mon', calories: 2100, protein: 120, target: 2200 },
    { day: 'Tue', calories: 2300, protein: 135, target: 2200 },
    { day: 'Wed', calories: 1950, protein: 115, target: 2200 },
    { day: 'Thu', calories: 2250, protein: 130, target: 2200 },
    { day: 'Fri', calories: 2050, protein: 125, target: 2200 },
    { day: 'Sat', calories: 2400, protein: 140, target: 2200 },
    { day: 'Sun', calories: 1850, protein: 110, target: 2200 },
  ];

  // Content for authenticated users (dashboard)
  const renderDashboard = () => {
    const quickActions = [
      { title: 'Start Workout', description: 'Begin your daily exercise routine', path: '/workout', icon: '💪' },
      { title: 'Nutrition Plan', description: 'View and manage your meal plan', path: '/nutrition', icon: '🥗' },
      { title: 'Social Connect', description: 'Connect with fitness friends', path: '/social', icon: '👥' }
    ];

    return (
      <>
        <header className="mb-12">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-2 tracking-tight"
            style={{ color: COLORS.NEON_GREEN }}
          >
            Welcome back, {user?.name || 'Fitness Enthusiast'}
          </h1>
          <p className="text-lg opacity-80 font-light">
            Your personal fitness dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* Statistics Dashboard */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 flex items-center">
            <span className="inline-block w-1 h-6 mr-3 rounded" style={{ backgroundColor: COLORS.NEON_GREEN }}></span>
            Your Progress
          </h2>
          <DashboardStats user={user} />
        </section>

        {/* New: Muscle Groups Radar Chart */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 flex items-center">
            <span className="inline-block w-1 h-6 mr-3 rounded" style={{ backgroundColor: COLORS.NEON_GREEN }}></span>
            Muscle Groups Trained
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'rgba(30, 30, 30, 0.6)' }}
            >
              <h3 className="text-lg font-medium mb-4">Weekly Focus</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius="80%" data={muscleGroupsData}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                    <PolarAngleAxis dataKey="group" tick={{ fill: '#fff', fontSize: 12 }} />
                    <Radar
                      name="Muscle Focus"
                      dataKey="value"
                      stroke={COLORS.NEON_GREEN}
                      fill={COLORS.NEON_GREEN}
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div 
              className="p-6 rounded-xl bg-gradient-to-br"
              style={{ 
                backgroundImage: `linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(20, 20, 20, 0.8))`, 
                boxShadow: `0 4px 20px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.05)`
              }}
            >
              <h3 className="text-lg font-medium mb-4">Recommendations</h3>
              <ul className="space-y-4">
                {muscleGroupsData
                  .sort((a, b) => a.value - b.value)
                  .slice(0, 2)
                  .map((item, index) => (
                    <li key={index} className="flex items-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                      <div className="rounded-full p-2 mr-4" style={{ backgroundColor: COLORS.NEON_GREEN }}>
                        <span className="text-black font-bold text-xs">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{item.group} Training</p>
                        <p className="text-sm opacity-70">Needs more attention in your routine</p>
                      </div>
                    </li>
                  ))}
                <li className="mt-6">
                  <Link 
                    to="/workout/planner"
                    className="inline-block w-full py-3 text-center rounded-lg text-sm font-medium transition-all duration-300"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: COLORS.WHITE,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                    }}
                  >
                    View Full Muscle Analysis
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* New: Nutrition Insights */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 flex items-center">
            <span className="inline-block w-1 h-6 mr-3 rounded" style={{ backgroundColor: COLORS.NEON_GREEN }}></span>
            Nutrition Insights
          </h2>
          <div 
            className="p-6 rounded-xl"
            style={{ 
              backgroundImage: `linear-gradient(180deg, rgba(30, 30, 30, 0.8), rgba(20, 20, 20, 0.9))`,
              boxShadow: `0 4px 20px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.05)`
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
              {nutritionData.map((day, index) => {
                const percentOfTarget = (day.calories / day.target) * 100;
                const barHeight = Math.min(Math.max(percentOfTarget, 30), 120); // Min 30%, max 120%
                const isOverTarget = percentOfTarget > 100;
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <p className="text-xs mb-1 opacity-70">{day.day}</p>
                    <div className="relative w-full h-32 flex flex-col-reverse">
                      <div 
                        className="w-full rounded-t-sm transition-all duration-500"
                        style={{ 
                          height: `${barHeight}%`,
                          backgroundColor: isOverTarget ? 'rgba(255, 99, 71, 0.7)' : COLORS.NEON_GREEN,
                          opacity: day.day === 'Wed' ? 1 : 0.7
                        }}
                      ></div>
                      {day.day === 'Wed' && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                          <span className="text-xs py-1 px-2 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                            {day.calories} cal
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-xs font-medium" style={{ color: isOverTarget ? 'rgba(255, 99, 71, 0.9)' : 'rgba(255, 255, 255, 0.9)' }}>
                        {Math.round(percentOfTarget)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-700">
              <div>
                <p className="text-sm opacity-70">Weekly Average</p>
                <p className="text-xl font-medium">{Math.round(nutritionData.reduce((sum, day) => sum + day.calories, 0) / 7)} calories</p>
              </div>
              <Link 
                to="/nutrition"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                style={{
                  backgroundColor: COLORS.NEON_GREEN,
                  color: COLORS.BLACK
                }}
              >
                View Nutrition Details
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Actions Section - Redesigned */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-8 flex items-center">
            <span className="inline-block w-1 h-6 mr-3 rounded" style={{ backgroundColor: COLORS.NEON_GREEN }}></span>
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl transition-all duration-300 transform hover:translate-y-1"
                style={{
                  backgroundColor: 'rgba(30, 30, 30, 0.6)',
                  borderLeft: `3px solid ${COLORS.NEON_GREEN}`,
                  boxShadow: `0 4px 20px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.05)`
                }}
              >
                <div className="flex items-start mb-4">
                  <span className="text-2xl mr-3">{action.icon}</span>
                  <h3 className="text-xl font-medium" style={{ color: COLORS.NEON_GREEN }}>
                    {action.title}
                  </h3>
                </div>
                <p className="mb-5 text-sm opacity-80">{action.description}</p>
                <Link 
                  to={action.path}
                  className="inline-block w-full py-3 text-center rounded-lg font-medium transition-all duration-300 text-sm"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: COLORS.WHITE,
                    border: `1px solid rgba(255, 255, 255, 0.2)`,
                  }}
                >
                  {action.title}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  };

  // Content for non-authenticated users (landing page)
  const renderLandingPage = () => {
    const features = [
      { 
        title: 'Personalized Workouts', 
        description: 'Custom workout plans tailored to your fitness goals and experience level',
        icon: '🎯'
      },
      { 
        title: 'Nutrition Tracking', 
        description: 'Monitor your caloric intake and macronutrients with our intuitive tools',
        icon: '📊' 
      },
      { 
        title: 'Social Motivation', 
        description: 'Connect with friends and stay motivated on your fitness journey together',
        icon: '🤝' 
      }
    ];

    return (
      <>
        <header className="max-w-4xl mx-auto mb-20 text-center pt-12">
          <h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
            style={{ color: COLORS.NEON_GREEN }}
          >
            PHitness
          </h1>
          <p className="text-xl md:text-2xl mb-12 font-light max-w-2xl mx-auto leading-relaxed">
            Your ultimate companion for achieving your fitness and nutrition goals
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/signup"
              className="px-8 py-4 rounded-lg text-lg font-medium transition-all duration-300 transform hover:translate-y-1"
              style={{
                backgroundColor: COLORS.NEON_GREEN,
                color: COLORS.BLACK,
                boxShadow: `0 4px 20px rgba(${parseInt(COLORS.NEON_GREEN.slice(1, 3), 16)}, ${parseInt(COLORS.NEON_GREEN.slice(3, 5), 16)}, ${parseInt(COLORS.NEON_GREEN.slice(5, 7), 16)}, 0.3)`
              }}
            >
              Get Started
            </Link>
            <Link 
              to="/login"
              className="px-8 py-4 rounded-lg text-lg font-medium border transition-all duration-300"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: COLORS.WHITE
              }}
            >
              Login
            </Link>
          </div>
        </header>

        <section className="mb-24 max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold mb-16 text-center">
            Why Choose PHitness?
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="rounded-xl overflow-hidden transition-all duration-300 transform hover:translate-y-1"
              >
                <div className="p-1" style={{ backgroundColor: COLORS.NEON_GREEN }}>
                  <div 
                    className="p-8 rounded-t-lg text-center h-full"
                    style={{ backgroundColor: COLORS.BLACK }}
                  >
                    <span className="text-4xl block mb-6">{feature.icon}</span>
                    <h3 
                      className="text-xl font-semibold mb-3"
                      style={{ color: COLORS.NEON_GREEN }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-sm opacity-80 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center pb-16 max-w-3xl mx-auto">
          <div 
            className="p-10 rounded-2xl"
            style={{ 
              backgroundImage: `linear-gradient(135deg, rgba(40, 40, 40, 0.8), rgba(20, 20, 20, 0.9))`,
              boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`
            }}
          >
            <h2 className="text-3xl font-semibold mb-4">
              Ready to transform your fitness journey?
            </h2>
            <p className="mb-8 text-lg opacity-80 max-w-lg mx-auto">
              Join thousands of users who have already improved their health with PHitness
            </p>
            <Link 
              to="/signup"
              className="inline-block px-8 py-4 rounded-lg text-lg font-medium transition-all duration-300 transform hover:translate-y-1"
              style={{
                backgroundColor: COLORS.NEON_GREEN,
                color: COLORS.BLACK,
                boxShadow: `0 4px 20px rgba(${parseInt(COLORS.NEON_GREEN.slice(1, 3), 16)}, ${parseInt(COLORS.NEON_GREEN.slice(3, 5), 16)}, ${parseInt(COLORS.NEON_GREEN.slice(5, 7), 16)}, 0.3)`
              }}
            >
              Sign Up Now
            </Link>
          </div>
        </section>
      </>
    );
  };

  return (
    <div 
      className="min-h-screen px-6 md:px-8 lg:px-12 py-12"
      style={{ 
        backgroundColor: COLORS.BLACK, 
        color: COLORS.WHITE,
        backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(60, 60, 60, 0.15), transparent 800px)'
      }}
    >
      <div className="container mx-auto">
        {/* Conditionally render content based on authentication status */}
        {user ? renderDashboard() : renderLandingPage()}
      </div>
    </div>
  );
};

export default HomePage;