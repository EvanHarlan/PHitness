import { COLORS } from '../App';

const HomePage = () => {
  const quickActions = [
    { title: 'Start Workout', description: 'Begin your daily exercise routine', path: '/workout' },
    { title: 'Nutrition Plan', description: 'View and manage your meal plan', path: '/nutrition' },
    { title: 'Social Connect', description: 'Connect with fitness friends', path: '/social' }
  ];

  return (
    <div 
      className="min-h-screen p-6 md:p-8 lg:p-12"
      style={{ 
        backgroundColor: COLORS.BLACK, 
        color: COLORS.WHITE 
      }}
    >
      <div className="container mx-auto">
        <header className="mb-10">
          <h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: COLORS.NEON_GREEN }}
          >
            Welcome to PHitness
          </h1>
          <p className="text-lg md:text-xl text-[#B0B0B0]">
            Your personal fitness and nutrition companion
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <div 
              key={index}
              className="p-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              style={{
                backgroundColor: COLORS.MEDIUM_GRAY,
                borderColor: COLORS.NEON_GREEN,
                borderWidth: '1px'
              }}
            >
              <h2 
                className="text-xl font-semibold mb-2"
                style={{ color: COLORS.NEON_GREEN }}
              >
                {action.title}
              </h2>
              <p className="mb-4">{action.description}</p>
              <a 
                href={action.path}
                className="inline-block px-4 py-2 rounded-md transition-colors duration-300"
                style={{
                  backgroundColor: COLORS.NEON_GREEN,
                  color: COLORS.BLACK,
                  ':hover': {
                    backgroundColor: COLORS.BALANCED_GREEN
                  }
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