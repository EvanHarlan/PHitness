import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/NavBar';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SocialPage from './pages/SocialPage';
import NutritionPage from './pages/NutritionPage';
import WorkoutPage from './pages/WorkoutPage';
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import PropTypes from 'prop-types';

// Color Constants
export const COLORS = {
  NEON_GREEN: '#32CD32',
  BALANCED_GREEN: '#4CAF50',
  DARK_GRAY: '#1E1E1E',
  BLACK: '#121212',
  MEDIUM_GRAY: '#2A2A2A',
  LIGHT_GRAY: '#B0B0B0',
  WHITE: '#F5F5F5'
};

// PropTypes for AuthProvider component (if needed)
AuthProvider.propTypes = {
    element: PropTypes.node.isRequired,
};

// Protected Route component
const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('authToken');
  return token ? element : <Navigate to="/login" />;
};

// Add PropTypes validation for ProtectedRoute
ProtectedRoute.propTypes = {
  element: PropTypes.node.isRequired, // Validate that 'element' is a React node
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div
          className="min-h-screen bg-[#121212] text-[#F5F5F5] flex flex-col"
          style={{
            backgroundColor: COLORS.BLACK,
            color: COLORS.WHITE
          }}
        >
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-6 md:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
              <Route path="/social" element={<ProtectedRoute element={<SocialPage />} />} />
              <Route path="/nutrition" element={<ProtectedRoute element={<NutritionPage />} />} />
              <Route path="/workout" element={<ProtectedRoute element={<WorkoutPage />} />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
