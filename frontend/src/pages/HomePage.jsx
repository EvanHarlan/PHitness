import { useUserStore } from '../stores/useUserStore';
import { Link, useNavigate } from 'react-router-dom';
import { COLORS } from '../lib/constants';
import DashboardStats from '../components/DashboardStats';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import MuscleGroupsRadarChart from '../components/MuscleGroupsRadarChart';
import MacronutrientPieChart from '../components/MacronutrientPieChart';
import WeightNotification from '../components/WeightNotification';

const HomePage = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
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

        {/* Quick Actions */}
        <section className="mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 md:mb-8 flex items-center">
            <span className="inline-block w-1 h-6 mr-3 rounded" style={{ backgroundColor: COLORS.NEON_GREEN }}></span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 sm:p-6 rounded-xl transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(30, 30, 30, 0.8)',
                  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)'
                }}
              >
                <Link to={action.path} className="block">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: COLORS.NEON_GREEN }}>
                    {action.title}
                  </h3>
                  <p className="text-sm sm:text-base opacity-80">
                    {action.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Add WeightNotification component */}
        <WeightNotification />
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
      <div className="min-h-screen flex items-center justify-center">
        <motion.header
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center max-w-4xl mx-auto px-4 sm:px-6 md:px-8"
        >
          <motion.h1 
            variants={fadeIn}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 tracking-tight"
            style={{ color: COLORS.NEON_GREEN }}
          >
            Welcome to PHitness
          </motion.h1>
          
          <motion.p 
            variants={fadeIn}
            className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 opacity-90"
          >
            Your personal AI-powered fitness companion
          </motion.p>
          
          <motion.div 
            variants={fadeIn}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
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
