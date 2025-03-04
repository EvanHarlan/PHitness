import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './pages/NavBar';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SocialPage from './pages/SocialPage';
import NutritionPage from './pages/NutritionPage';
import WorkoutPage from './pages/WorkoutPage';

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/workout" element={<WorkoutPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
