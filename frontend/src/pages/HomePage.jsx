import { useUserStore } from '../stores/useUserStore';
import { Link, useNavigate } from 'react-router-dom'; // Assuming useNavigate might be used elsewhere or was planned
import { COLORS } from '../lib/constants';
import DashboardStats from '../components/DashboardStats';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import MuscleGroupsRadarChart from '../components/MuscleGroupsRadarChart';
import MacronutrientPieChart from '../components/MacronutrientPieChart';
import WeightNotification from '../components/WeightNotification';

const HomePage = () => {
  const { user } = useUserStore();
  const [isMobile, setIsMobile] = useState(false); 

  // Detect mobile devices - This useEffect is not directly related to the scrolling issue
  // but kept as it was in the original code.
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
            Your personal PHitness dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* Statistics Dashboard */}
        <section className="mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 md:mb-8 flex items-center">
            <span className="inline-block w-1 h-6 mr-3 rounded" style={{ backgroundColor: COLORS.NEON_GREEN }}></span>
            Your Statistics
          </h2>
          <DashboardStats user={user} />
        </section>

        {/* Training Insights */}
        <section className="mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 md:mb-8 flex items-center">
            <span className="inline-block w-1 h-6 mr-3 rounded" style={{ backgroundColor: COLORS.NEON_GREEN }}></span>
            Training Insights
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 sm:p-6 rounded-xl" style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)' }}>
              <h3 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: COLORS.NEON_GREEN }}>Muscle Groups Trained</h3>
              <MuscleGroupsRadarChart />
            </div>
            <div className="p-4 sm:p-6 rounded-xl" style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)' }}>
              <h3 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: COLORS.NEON_GREEN }}>Training Analysis</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                  <h4 className="text-sm font-medium mb-2" style={{ color: COLORS.NEON_GREEN }}>Muscle Balance</h4>
                  <p className="text-sm opacity-80">Your radar chart shows which muscle groups you've been focusing on. Aim for balanced development across all major muscle groups to prevent imbalances and reduce injury risk.</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                  <h4 className="text-sm font-medium mb-2" style={{ color: COLORS.NEON_GREEN }}>Training Frequency</h4>
                  <p className="text-sm opacity-80">Each point represents how often you've trained a specific muscle group. Consider adjusting your routine if certain areas are being neglected.</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                  <h4 className="text-sm font-medium mb-2" style={{ color: COLORS.NEON_GREEN }}>Recovery Tips</h4>
                  <p className="text-sm opacity-80">Ensure adequate rest between training sessions for the same muscle groups. Most muscles need 48-72 hours to recover fully.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nutrition Insights */}
        <section className="mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 md:mb-8 flex items-center">
            <span className="inline-block w-1 h-6 mr-3 rounded" style={{ backgroundColor: COLORS.NEON_GREEN }}></span>
            Nutrition Insights
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 sm:p-6 rounded-xl" style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)' }}>
              <h3 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: COLORS.NEON_GREEN }}>Nutrition Breakdown</h3>
              <MacronutrientPieChart />
            </div>
            <div className="p-4 sm:p-6 rounded-xl" style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)' }}>
              <h3 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: COLORS.NEON_GREEN }}>Nutrition Analysis</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                  <h4 className="text-sm font-medium mb-2" style={{ color: COLORS.NEON_GREEN }}>Macronutrient Balance</h4>
                  <p className="text-sm opacity-80">Your pie chart shows the distribution of protein, carbs, and fats in your diet. A balanced ratio supports optimal performance and recovery.</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                  <h4 className="text-sm font-medium mb-2" style={{ color: COLORS.NEON_GREEN }}>Protein Intake</h4>
                  <p className="text-sm opacity-80">Protein is crucial for muscle repair and growth. Aim for 0.8-1.2g of protein per pound of body weight, depending on your goals.</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                  <h4 className="text-sm font-medium mb-2" style={{ color: COLORS.NEON_GREEN }}>Carb & Fat Distribution</h4>
                  <p className="text-sm opacity-80">Carbs provide energy for workouts, while healthy fats support hormone production and overall health. Adjust these based on your activity level and goals.</p>
                </div>
              </div>
            </div>
          </div>
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
      <motion.header
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="text-center max-w-4xl w-full px-4 sm:px-6 md:px-8"
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
    );
  };

  // Define base classes and conditional classes for the main wrapper
  const commonWrapperClasses = "px-4 sm:px-6 md:px-8 lg:px-12";
  const authenticatedWrapperClasses = "min-h-screen overflow-y-auto py-6 sm:py-8 md:py-12";
  const unauthenticatedWrapperClasses = "fixed inset-0 overflow-hidden flex items-center justify-center";

  return (
    <div 
      className={`
        ${commonWrapperClasses}
        ${user ? authenticatedWrapperClasses : unauthenticatedWrapperClasses}
      `}
      style={{ 
        backgroundColor: COLORS.BLACK, 
        color: COLORS.WHITE,
      }}
    >
      {user ? (
        // Container for dashboard to manage max-width and centering within the scrollable area
        <div className="container mx-auto">
          {renderDashboard()}
        </div>
      ) : (
        // Landing page is rendered directly; its content is centered by unauthenticatedWrapperClasses
        renderLandingPage()
      )}
    </div>
  );
};

export default HomePage;