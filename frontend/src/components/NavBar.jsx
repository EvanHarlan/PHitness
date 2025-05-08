import { Link } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import { COLORS } from '../lib/constants';
import { useState, useEffect } from 'react';

function Navbar() {
  const { user, logout } = useUserStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Two-stage animation approach for smoother transitions
  useEffect(() => {
    let timeout;
    if (isMenuOpen) {
      setMenuVisible(true);
    } else {
      timeout = setTimeout(() => {
        setMenuVisible(false);
      }, 300); // Match this with your CSS transition duration
    }
    
    return () => {
      clearTimeout(timeout);
    };
  }, [isMenuOpen]);

  // Close mobile menu when component unmounts or route changes
  useEffect(() => {
    return () => {
      setIsMenuOpen(false);
      setMenuVisible(false);
    };
  }, []);
// opens menu
  const toggleMenu = () => {
    setIsMenuOpen(prevState => !prevState);
  };
// closes menu
  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };
// log out user
  const handleLogout = () => {
    logout();
    handleCloseMenu();
  };

  return (
    <nav 
      className="text-white shadow-md sticky top-0 z-50"
      style={{
        backgroundColor: COLORS.MEDIUM_GRAY
      }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold flex items-center transition-opacity duration-200 hover:opacity-80"
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
            <Link to="/" className="hover:text-green-400 transition-colors duration-200">
              Home
            </Link>
            
            {user ? (
              <>
                <Link to="/profile" className="hover:text-green-400 transition-colors duration-200">
                  Profile
                </Link>
                <Link to="/social" className="hover:text-green-400 transition-colors duration-200">
                  Social
                </Link>
                <Link to="/nutrition" className="hover:text-green-400 transition-colors duration-200">
                  Nutrition
                </Link>
                <Link to="/workout" className="hover:text-green-400 transition-colors duration-200">
                  Workouts
                </Link>
                <button 
                  onClick={logout} 
                  className="ml-2 px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-green-400 transition-colors duration-200">
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 rounded font-medium transition-all duration-200 hover:opacity-90"
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
          
          {/* Mobile menu button with transition */}
          <button 
            onClick={toggleMenu}
            className="md:hidden outline-none p-2 transition-transform duration-200 active:scale-95"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <div className="relative w-6 h-6">
              <svg 
                className={`w-6 h-6 absolute top-0 left-0 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <svg 
                className={`w-6 h-6 absolute top-0 left-0 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
          </button>
        </div>
        
        {/* Mobile Navigation with smooth transitions */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!isMenuOpen}
        >
          <div className="mt-4 pb-4 space-y-3 flex flex-col">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded hover:bg-gray-700 transition-colors duration-200"
              onClick={handleCloseMenu}
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="block px-3 py-2 rounded hover:bg-gray-700 transition-colors duration-200"
                  onClick={handleCloseMenu}
                >
                  Profile
                </Link>
                <Link 
                  to="/social" 
                  className="block px-3 py-2 rounded hover:bg-gray-700 transition-colors duration-200"
                  onClick={handleCloseMenu}
                >
                  Social
                </Link>
                <Link 
                  to="/nutrition" 
                  className="block px-3 py-2 rounded hover:bg-gray-700 transition-colors duration-200"
                  onClick={handleCloseMenu}
                >
                  Nutrition
                </Link>
                <Link 
                  to="/workout" 
                  className="block px-3 py-2 rounded hover:bg-gray-700 transition-colors duration-200"
                  onClick={handleCloseMenu}
                >
                  Workouts
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded bg-red-600 hover:bg-red-700 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded hover:bg-gray-700 transition-colors duration-200"
                  onClick={handleCloseMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block px-3 py-2 rounded font-medium transition-all duration-200"
                  style={{ 
                    backgroundColor: COLORS.NEON_GREEN,
                    color: COLORS.MEDIUM_GRAY
                  }}
                  onClick={handleCloseMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;