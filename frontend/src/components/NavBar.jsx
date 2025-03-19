import { Link } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import { COLORS } from '../lib/constants';
import { useState } from 'react';

function Navbar() {
  const { user, logout } = useUserStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav 
      className="text-white shadow-md sticky top-0 z-50"
      style={{
        backgroundColor: COLORS.MEDIUM_GRAY,
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold flex items-center"
            style={{ color: COLORS.NEON_GREEN }}
          >
            <img 
              src="/PHitnessLogo.png" 
              alt="PHitness Logo" 
              className="h-12 mr-2" 
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-green-400 transition duration-200">Home</Link>
            
            {user ? (
              <>
                <Link to="/profile" className="hover:text-green-400 transition duration-200">Profile</Link>
                <Link to="/social" className="hover:text-green-400 transition duration-200">Social</Link>
                <Link to="/nutrition" className="hover:text-green-400 transition duration-200">Nutrition</Link>
                <Link to="/workout" className="hover:text-green-400 transition duration-200">Workouts</Link>
                <button 
                  onClick={logout} 
                  className="ml-2 px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-green-400 transition duration-200">Login</Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 rounded font-medium transition duration-200"
                  style={{ 
                    backgroundColor: COLORS.NEON_GREEN,
                    color: COLORS.MEDIUM_GRAY
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu}
              className="outline-none p-2"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 flex flex-col">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded hover:bg-gray-700 transition duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="block px-3 py-2 rounded hover:bg-gray-700 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/social" 
                  className="block px-3 py-2 rounded hover:bg-gray-700 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Social
                </Link>
                <Link 
                  to="/nutrition" 
                  className="block px-3 py-2 rounded hover:bg-gray-700 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Nutrition
                </Link>
                <Link 
                  to="/workout" 
                  className="block px-3 py-2 rounded hover:bg-gray-700 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Workouts
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded bg-red-600 hover:bg-red-700 transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded hover:bg-gray-700 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block px-3 py-2 rounded font-medium transition duration-200"
                  style={{ 
                    backgroundColor: COLORS.NEON_GREEN,
                    color: COLORS.MEDIUM_GRAY
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;