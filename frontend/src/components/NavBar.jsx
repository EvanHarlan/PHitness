import { useState } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../App';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/profile', label: 'Profile' },
    { path: '/social', label: 'Social/Friends' },
    { path: '/nutrition', label: 'Nutrition/Meal Plan' },
    { path: '/workout', label: 'Workout' },
    {path: '/login', label:'Login'},
    {path: '/signup', label:'SignUp'}
  ];

  return (
    <nav 
      className="bg-[#1E1E1E] p-4 shadow-md"
      style={{ backgroundColor: COLORS.DARK_GRAY }}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand */}
        <Link 
          to="/" 
          className="text-2xl font-bold"
          style={{ color: COLORS.NEON_GREEN }}
        >
          PHitness
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke={COLORS.NEON_GREEN}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 6h16M4 12h16M4 18h16" 
            />
          </svg>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="px-3 py-2 rounded-md transition-colors duration-300 hover:bg-[#32CD32] hover:text-black"
              style={{
                color: COLORS.WHITE,
                backgroundColor: COLORS.MEDIUM_GRAY
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div 
            className="absolute top-16 left-0 w-full md:hidden z-50"
            style={{ backgroundColor: COLORS.DARK_GRAY }}
          >
            <div className="flex flex-col items-center space-y-2 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="w-full text-center py-2 rounded-md transition-colors duration-300 hover:bg-[#32CD32] hover:text-black"
                  style={{
                    color: COLORS.WHITE,
                    backgroundColor: COLORS.MEDIUM_GRAY
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;