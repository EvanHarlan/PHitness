import { useUserStore } from '../stores/useUserStore';
import { Link } from 'react-router-dom';
import { COLORS } from '../lib/constants';
import DashboardStats from '../components/DashboardStats';

const HomePage = () => {
  // Get user authentication status from your store
  const { user } = useUserStore();

  // Content for authenticated users (dashboard)
  const renderDashboard = () => {
    const quickActions = [
      { title: 'Start Workout', description: 'Begin your daily exercise routine', path: '/workout' },
      { title: 'Nutrition Plan', description: 'View and manage your meal plan', path: '/nutrition' },
      { title: 'Social Connect', description: 'Connect with fitness friends', path: '/social' }
    ];

    return (
      <>
        <header className="mb-10">
          <h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: COLORS.NEON_GREEN }}
          >
            Welcome back, {user?.name || 'Fitness Enthusiast'}!
          </h1>
          <p className="text-lg md:text-xl text-[#B0B0B0]">
            Your personal fitness dashboard
          </p>
        </header>

        {/* Statistics Dashboard */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Your Progress</h2>
          <DashboardStats user={user} />
        </section>

        {/* Quick Actions Section */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
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
                <Link 
                  to={action.path}
                  className="inline-block px-4 py-2 rounded-md transition-colors duration-300"
                  style={{
                    backgroundColor: COLORS.NEON_GREEN,
                    color: COLORS.BLACK
                  }}
                >
                  Go to {action.title}
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
        description: 'Custom workout plans tailored to your fitness goals and experience level' 
      },
      { 
        title: 'Nutrition Tracking', 
        description: 'Monitor your caloric intake and macronutrients with our intuitive tools' 
      },
      { 
        title: 'Social Motivation', 
        description: 'Connect with friends and stay motivated on your fitness journey together' 
      }
    ];

    return (
      <>
        <header className="mb-12 text-center">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            style={{ color: COLORS.NEON_GREEN }}
          >
            PHitness
          </h1>
          <p className="text-xl md:text-2xl text-[#B0B0B0] max-w-2xl mx-auto">
            Your ultimate companion for achieving your fitness and nutrition goals
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/signup"
              className="px-6 py-3 rounded-md text-lg font-medium transition-colors duration-300"
              style={{
                backgroundColor: COLORS.NEON_GREEN,
                color: COLORS.BLACK
              }}
            >
              Get Started
            </Link>
            <Link 
              to="/login"
              className="px-6 py-3 rounded-md text-lg font-medium border-2 transition-colors duration-300"
              style={{
                borderColor: COLORS.NEON_GREEN,
                color: COLORS.NEON_GREEN
              }}
            >
              Login
            </Link>
          </div>
        </header>

        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
            Why Choose PHitness?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-lg text-center"
                style={{
                  backgroundColor: COLORS.MEDIUM_GRAY
                }}
              >
                <h3 
                  className="text-xl font-semibold mb-3"
                  style={{ color: COLORS.NEON_GREEN }}
                >
                  {feature.title}
                </h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center pb-8">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Ready to transform your fitness journey?
          </h2>
          <p className="mb-6 text-lg text-[#B0B0B0]">
            Join thousands of users who have already improved their health with PHitness
          </p>
          <Link 
            to="/signup"
            className="inline-block px-6 py-3 rounded-md text-lg font-medium transition-colors duration-300"
            style={{
              backgroundColor: COLORS.NEON_GREEN,
              color: COLORS.BLACK
            }}
          >
            Sign Up Now
          </Link>
        </section>
      </>
    );
  };

  return (
    <div 
      className="min-h-screen p-6 md:p-8 lg:p-12"
      style={{ 
        backgroundColor: COLORS.BLACK, 
        color: COLORS.WHITE 
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