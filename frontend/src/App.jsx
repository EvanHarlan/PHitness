import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavBar';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SocialPage from './pages/SocialPage';
import NutritionPage from './pages/NutritionPage';
import WorkoutPage from './pages/WorkoutPage';
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";

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

const App = () => {
  return (
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
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/nutrition" element={<NutritionPage />} />
            <Route path="/workout" element={<WorkoutPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;