import { Link } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import { COLORS } from '../lib/constants';

function Navbar() {
  const { user, logout } = useUserStore();

  return (
    <nav className=" text-white shadow-md"
    style={{
      backgroundColor: COLORS.MEDIUM_GRAY,
      }}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold" style={{ color: COLORS.NEON_GREEN }}>
          PHitness
        </Link>
        
        <div className="flex space-x-4">
          {/* Home link always visible */}
          <Link to="/" className="hover:text-green-400">Home</Link>
          
          {/* Show these links only when user is logged in */}
          {user ? (
            <>
              <Link to="/profile" className="hover:text-green-400">Profile</Link>
              <Link to="/social" className="hover:text-green-400">Social</Link>
              <Link to="/nutrition" className="hover:text-green-400">Nutrition</Link>
              <Link to="/workout" className="hover:text-green-400">Workouts</Link>
              <button 
                onClick={logout} 
                className="hover:text-green-400"
              >
                Logout
              </button>
            </>
          ) : (
            /* Show these links only when user is NOT logged in */
            <>
              <Link to="/login" className="hover:text-green-400">Login</Link>
              <Link to="/signup" className="hover:text-green-400">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;