import { useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/NavBar';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SocialPage from './pages/SocialPage';
import NutritionPage from './pages/NutritionPage';
import WorkoutPage from './pages/WorkoutPage';
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import LoadingSpinner from "./components/LoadingSpinner";
import { useUserStore } from './stores/useUserStore';
import COLORS from './lib/constants';
import WorkoutDetailsPage from './pages/WorkoutDetailsPage'
import AchievementNotifier from './components/AchievementNotifier';
import MealDetailsPage from './pages/MealsDetailsPage';
import UpdateProfilePage from './pages/UpdateProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
//APP
// ProtectedRoute component definition
const ProtectedRoute = ({ element }) => {
  const { user } = useUserStore();
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return element;
};

// Add PropTypes validation
ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired
};

function App() {
    const { user, checkAuth, checkingAuth } = useUserStore();
    const unlockedAchievement = useUserStore(state => state.unlockedAchievement);
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (checkingAuth) return <LoadingSpinner />;
  
  return (
    <div className="relative">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
        
            background: COLORS.DARK_GRAY,
            color: COLORS.WHITE,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`,
          },
          // Customize success toasts
          success: {
            duration: 3000,
            iconTheme: {
              primary: COLORS.NEON_GREEN,
              secondary: COLORS.BLACK,
            },
          },
          // Customize error toasts
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ff4b4b',
              secondary: COLORS.WHITE,
            },
          },
        }}
      />
      <AchievementNotifier unlockedAchievement={unlockedAchievement} />

      <Navbar />
      <main>
      <Routes>
        <Route path="/" element={<HomePage />} />
    
        <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
        <Route path="/social" element={<ProtectedRoute element={<SocialPage />} />} />
        <Route path="/nutrition" element={<ProtectedRoute element={<NutritionPage />} />} />
        <Route path="/workout" element={<ProtectedRoute element={<WorkoutPage />} />} />
        <Route path="/workouts/:id" element={<ProtectedRoute element={<WorkoutDetailsPage />} />} />
        <Route path="/meals/:id" element={<ProtectedRoute element={<MealDetailsPage />} />} /> 
        <Route path="/meals/:id" element={<ProtectedRoute element={<MealDetailsPage />} />} />     
         <Route path="/update-profile" element={<ProtectedRoute element={<UpdateProfilePage />} />} />          
        
        <Route path="/signup" element={user ? <Navigate to="/" /> : <SignUpPage />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPasswordPage />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </main>
    </div>
  );
}

export default App;