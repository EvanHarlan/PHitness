import { COLORS } from '../lib/constants';
import { useEffect, useState } from 'react';

const HomePage = () => {
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

  const quickActions = [
    { title: 'Start Workout', description: 'Begin your daily exercise routine', path: '/workout' },
    { title: 'Nutrition Plan', description: 'View and manage your meal plan', path: '/nutrition' },
    { title: 'Social Connect', description: 'Connect with fitness friends', path: '/social' }
  ];

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-12"
      style={{ 
        backgroundColor: COLORS.BLACK, 
        color: COLORS.WHITE 
      }}
    >
      <div className="container mx-auto">
        <header className="mb-6 md:mb-10">
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4"
            style={{ color: COLORS.NEON_GREEN }}
          >
            Welcome to PHitness
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#B0B0B0]">
            Your personal fitness and nutrition companion
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action, index) => (
            <div 
              key={index}
              className={`p-4 sm:p-6 rounded-lg ${!isMobile ? 'transition-all duration-300 transform hover:scale-105' : 'active:bg-opacity-90'}`}
              style={{
                backgroundColor: COLORS.MEDIUM_GRAY,
                borderColor: COLORS.NEON_GREEN,
                borderWidth: '1px'
              }}
            >
              <h2 
                className="text-lg sm:text-xl font-semibold mb-2"
                style={{ color: COLORS.NEON_GREEN }}
              >
                {action.title}
              </h2>
              <p className="mb-3 md:mb-4 text-sm sm:text-base">{action.description}</p>
              <a 
                href={action.path}
                className="inline-block w-full sm:w-auto text-center px-4 py-3 sm:py-2 rounded-md transition-colors duration-300 text-base font-medium"
                style={{
                  backgroundColor: COLORS.NEON_GREEN,
                  color: COLORS.BLACK
                }}
              >
                Go to {action.title}
              </a>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
