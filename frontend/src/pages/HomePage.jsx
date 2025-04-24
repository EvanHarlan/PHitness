import { useUserStore } from '../stores/useUserStore';
import { Link } from 'react-router-dom';
import { COLORS } from '../lib/constants';
import DashboardStats from '../components/DashboardStats';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import MacronutrientPieChart from '../components/MacronutrientPieChart';
import { useState, useEffect } from 'react';

const HomePage = () => {
  const { user } = useUserStore();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Muscle groups data for radar chart
  const muscleGroupsData = [
    { group: 'Chest', value: user?.stats?.muscleGroups?.chest || 65 },
    { group: 'Back', value: user?.stats?.muscleGroups?.back || 80 },
    { group: 'Legs', value: user?.stats?.muscleGroups?.legs || 45 },
    { group: 'Shoulders', value: user?.stats?.muscleGroups?.shoulders || 60 },
    { group: 'Arms', value: user?.stats?.muscleGroups?.arms || 70 },
    { group: 'Core', value: user?.stats?.muscleGroups?.core || 55 },
  ];

  // Content for authenticated users (dashboard)
  const renderDashboard = () => {
    const quickActions = [
      { title: 'Start Workout', description: 'Begin your daily exercise routine', path: '/workout'},
      { title: 'Nutrition Plan', description: 'View and manage your meal plan', path: '/nutrition'},
      { title: 'Social Connect', description: 'Connect with fitness friends', path: '/social'}
    ];

    return (
      <>
        <header className="mb-6 sm:mb-8 md:mb-12">
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 tracking-tight"
            style={{ color: COLORS.NEON_GREEN }}
          >
            Welcome back, {user?.name || 'Fitness Enthusiast'}
          </h1>
          <p className="text-sm sm:text-base md:text-lg opacity-80 font-light">
            Your personal fitness dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* Statistics Dashboard */}
        <section className="mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 md:mb-8 flex items-center">
            <span className="inline-block w-1 h-6 mr-3 rounded" style={{ backgroundColor: COLORS.NEON_GREEN }}></span>
            Your Progress
          </h2>
          <DashboardStats user={user} />
        </section>

        {/* Muscle Groups Radar Chart */}
        <section className="mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 md:mb-8 flex items-center">
            <span className="inline-block w-1 h-6 mr-3 rounded" style={{ backgroundColor: COLORS.NEON_GREEN }}></span>
            Muscle Groups Trained
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
            <div 
              className="p-4 sm:p-6 rounded-lg sm:rounded-xl"
              style={{ backgroundColor: 'rgba(30, 30, 30, 0.6)' }}
            >
              <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Weekly Focus</h3>
              <div className="h-48 sm:h-56 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={isMobile ? "70%" : "80%"} data={muscleGroupsData}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                    <PolarAngleAxis dataKey="group" tick={{ fill: '#fff', fontSize: isMobile ? 10 : 12 }} />
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
              className="p-4 sm:p-6 rounded-lg sm:rounded-xl bg-gradient-to-br"
              style={{ 
                backgroundImage: `linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(20, 20, 20, 0.8))`, 
                boxShadow: `0 4px 20px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.05)`
              }}
            >
              <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Recommendations</h3>
              <ul className="space-y-3 sm:space-y-4">
                {muscleGroupsData
                  .sort((a, b) => a.value - b.value)
                  .slice(0, 2)
                  .map((item, index) => (
                    <li key={index} className="flex items-center p-2 sm:p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                      <div className="rounded-full p-1.5 sm:p-2 mr-3 sm:mr-4" style={{ backgroundColor: COLORS.NEON_GREEN }}>
                        <span className="text-black font-bold text-xs">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-medium">{item.group} Training</p>
                        <p className="text-xs sm:text-sm opacity-70">Needs more attention in your routine</p>
                      </div>
                    </li>
                  ))}
                <li className="mt-4 sm:mt-6">
                  <Link 
                    to="/workout/planner"
                    className="inline-block w-full py-2 sm:py-3 text-center rounded-lg text-xs sm:text-sm font-medium transition-all duration-300"
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

        {/* Nutrition Insights */}
        <section className="mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 md:mb-8 flex items-center">
            <span className="inline-block w-1 h-6 mr-3 rounded" style={{ backgroundColor: COLORS.NEON_GREEN }}></span>
            Nutrition Insights
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
            <MacronutrientPieChart />
            <div 
              className="p-4 sm:p-6 rounded-lg sm:rounded-xl bg-gradient-to-br"
              style={{ 
                backgroundImage: `linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(20, 20, 20, 0.8))`, 
                boxShadow: `0 4px 20px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.05)`
              }}
            >
              <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Nutrition Tips</h3>
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-start p-2 sm:p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                  <div className="rounded-full p-1.5 sm:p-2 mr-3 sm:mr-4" style={{ backgroundColor: COLORS.NEON_GREEN }}>
                    <span className="text-black font-bold text-xs">1</span>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium">Protein Intake</p>
                    <p className="text-xs sm:text-sm opacity-70">Consider increasing your daily protein to support muscle recovery.</p>
                  </div>
                </li>
                <li className="flex items-start p-2 sm:p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                  <div className="rounded-full p-1.5 sm:p-2 mr-3 sm:mr-4" style={{ backgroundColor: COLORS.NEON_GREEN }}>
                    <span className="text-black font-bold text-xs">2</span>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium">Meal Timing</p>
                    <p className="text-xs sm:text-sm opacity-70">Try spacing your meals 3-4 hours apart for optimal energy.</p>
                  </div>
                </li>
                <li className="flex items-start p-2 sm:p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                  <div className="rounded-full p-1.5 sm:p-2 mr-3 sm:mr-4" style={{ backgroundColor: COLORS.NEON_GREEN }}>
                    <span className="text-black font-bold text-xs">3</span>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium">Hydration</p>
                    <p className="text-xs sm:text-sm opacity-70">Remember to drink plenty of water throughout the day.</p>
                  </div>
                </li>
                <li className="mt-4 sm:mt-6">
                  <Link 
                    to="/nutrition"
                    className="inline-block w-full py-2 sm:py-3 text-center rounded-lg text-xs sm:text-sm font-medium transition-all duration-300"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: COLORS.WHITE,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                    }}
                  >
                    View Full Nutrition Plan
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 md:mb-8 flex items-center">
            <span className="inline-block w-1 h-6 mr-3 rounded" style={{ backgroundColor: COLORS.NEON_GREEN }}></span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <div 
                key={index}
                className="p-4 sm:p-6 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:translate-y-1"
                style={{
                  backgroundColor: 'rgba(30, 30, 30, 0.6)',
                  borderLeft: `3px solid ${COLORS.NEON_GREEN}`,
                  boxShadow: `0 4px 20px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.05)`
                }}
              >
                <div className="flex items-start mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{action.icon}</span>
                  <h3 className="text-lg sm:text-xl font-medium" style={{ color: COLORS.NEON_GREEN }}>
                    {action.title}
                  </h3>
                </div>
                <p className="mb-4 sm:mb-5 text-xs sm:text-sm opacity-80">{action.description}</p>
                <Link 
                  to={action.path}
                  className="inline-block w-full py-2 sm:py-3 text-center rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm"
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
    // Framer motion variants
    const fadeIn = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6 }
      }
    };
    
    const staggerContainer = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2
        }
      }
    };
    
    const buttonHover = {
      scale: 1.03,
      boxShadow: `0 4px 20px rgba(${parseInt(COLORS.NEON_GREEN.slice(1, 3), 16)}, ${parseInt(COLORS.NEON_GREEN.slice(3, 5), 16)}, ${parseInt(COLORS.NEON_GREEN.slice(5, 7), 16)}, 0.3)`
    };
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">  
        {/* Hero Section */}
        <motion.header 
          className="max-w-4xl mx-auto mb-8 sm:mb-12 md:mb-16 text-center pt-4 sm:pt-8 md:pt-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight"
            style={{ color: COLORS.NEON_GREEN }}
          >
            PHitness
          </motion.h1>
          <motion.p 
            className="text-sm sm:text-base md:text-xl mb-6 sm:mb-8 md:mb-12 font-light max-w-lg mx-auto"
            variants={fadeIn}
          >
            Your personal AI-powered fitness & nutrition companion
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"
            variants={staggerContainer}
          >
            <motion.div whileHover={buttonHover} whileTap={{ scale: 0.98 }}>
              <Link 
                to="/signup"
                className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 rounded-md text-base sm:text-lg font-medium transition-all duration-200 inline-block"
                style={{
                  backgroundColor: COLORS.NEON_GREEN,
                  color: COLORS.BLACK,
                }}
              >
                Get Started
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link 
                to="/login"
                className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 rounded-md text-base sm:text-lg font-medium transition-all duration-200 inline-block mt-3 sm:mt-0"
                style={{
                  backgroundColor: 'transparent',
                  color: COLORS.WHITE,
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                Login
              </Link>
            </motion.div>
          </motion.div>
        </motion.header>
        
        {/* Features Section */}
        <motion.section 
          className="w-full max-w-5xl mx-auto mb-8 sm:mb-12 md:mb-20 px-4 sm:px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              { 
                title: 'Custom Workouts',
                icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                        <line x1="6" y1="1" x2="6" y2="4"></line>
                        <line x1="10" y1="1" x2="10" y2="4"></line>
                        <line x1="14" y1="1" x2="14" y2="4"></line>
                      </svg>,
                description: 'Personalized exercise plans tailored to your goals'
              },
              { 
                title: 'Meal Planning',
                icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                        <line x1="6" y1="1" x2="6" y2="4"></line>
                        <line x1="10" y1="1" x2="10" y2="4"></line>
                        <line x1="14" y1="1" x2="14" y2="4"></line>
                      </svg>,
                description: 'AI-generated nutrition plans to optimize your results'
              },
              { 
                title: 'Progress Tracking',
                icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                      </svg>,  
                description: 'Monitor your improvements with detailed analytics'
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="p-4 sm:p-6 rounded-lg"
                style={{ backgroundColor: 'rgba(25, 25, 25, 0.6)' }}
                variants={fadeIn}
                whileHover={{ 
                  y: -5, 
                  boxShadow: '0 10px 30px -15px rgba(0, 0, 0, 0.3)',
                  backgroundColor: 'rgba(28, 28, 28, 0.8)'
                }}
              >
                <div className="mb-3 sm:mb-4" style={{ color: COLORS.NEON_GREEN }}>
                  {feature.icon}
                </div>
                <h3 
                  className="text-lg sm:text-xl font-medium mb-1 sm:mb-2"
                  style={{ color: COLORS.NEON_GREEN }}
                >
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm opacity-80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
  
        {/* How It Works - Simplified */}
        <motion.section 
          className="w-full max-w-5xl mx-auto mb-8 sm:mb-12 md:mb-20 px-4 sm:px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <motion.h2 
            className="text-xl sm:text-2xl font-medium mb-6 sm:mb-8 md:mb-10 text-center"
            variants={fadeIn}
          >
            How It Works
          </motion.h2>
          
          <div className="flex justify-between items-center relative">
            {/* Line connecting steps - hidden on very small screens */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-opacity-20 hidden sm:block" style={{ backgroundColor: COLORS.NEON_GREEN }}></div>
            
            <motion.div 
              className={`flex ${isMobile ? 'flex-col space-y-8' : 'flex-row justify-between'} items-center w-full`}
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {[
                { step: "01", title: "Create Profile" },
                { step: "02", title: "AI Analysis" },
                { step: "03", title: "Get Your Plan" },
                { step: "04", title: "Track Results" }
              ].map((step, index) => (
                <motion.div 
                  key={index} 
                  className="relative z-10 flex flex-col items-center"
                  variants={fadeIn}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm mb-2 sm:mb-3"
                    style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                    whileHover={{ 
                      scale: 1.1,
                      boxShadow: `0 0 15px ${COLORS.NEON_GREEN}` 
                    }}
                  >
                    {step.step}
                  </motion.div>
                  <p className="text-xs sm:text-sm font-medium">{step.title}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
  
        {/* CTA Section */}
        <motion.section 
          className="w-full max-w-3xl mx-auto pb-8 sm:pb-12 md:pb-16 text-center px-4 sm:px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <motion.div 
            className="p-6 sm:p-8 md:p-10 rounded-lg"
            style={{ backgroundColor: 'rgba(20, 20, 20, 0.7)' }}
            whileHover={{
              boxShadow: '0 10px 30px -15px rgba(0, 0, 0, 0.5)',
              backgroundColor: 'rgba(25, 25, 25, 0.8)'
            }}
          >
            <motion.h2 
              className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6"
            >
              Start your transformation today
            </motion.h2>
            <motion.div whileHover={buttonHover} whileTap={{ scale: 0.98 }}>
              <Link 
                to="/signup"
                className="inline-block px-6 sm:px-8 md:px-10 py-2 sm:py-3 rounded-md text-base sm:text-lg font-medium transition-all duration-200"
                style={{
                  backgroundColor: COLORS.NEON_GREEN,
                  color: COLORS.BLACK,
                }}
              >
                Sign Up Free
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-12"
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
