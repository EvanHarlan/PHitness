import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../App';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    
    try {
      setLoading(true);
      
      const response = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.token) {
        login(response.data.token, response.data.user);
        navigate('/');
      }
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid credentials or server error. Please try again.');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: COLORS.BLACK }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: COLORS.MEDIUM_GRAY }}>
          {/* Header Section */}
          <div className="px-8 py-12 text-center" style={{ backgroundColor: COLORS.DARK_GRAY }}>
            <h2 className="text-3xl font-bold" style={{ color: COLORS.NEON_GREEN }}>
              Sign In
            </h2>
            <p className="mt-2" style={{ color: COLORS.LIGHT_GRAY }}>
              Welcome back
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', borderColor: 'red', borderWidth: '1px' }}>
                <p style={{ color: 'red' }}>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium" style={{ color: COLORS.WHITE }}>
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5" color={COLORS.LIGHT_GRAY} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-10 px-3 py-3 rounded-xl transition duration-200"
                    style={{
                      backgroundColor: COLORS.DARK_GRAY,
                      color: COLORS.WHITE,
                      borderColor: COLORS.NEON_GREEN,
                      borderWidth: '1px',
                    }}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium" style={{ color: COLORS.WHITE }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5" color={COLORS.LIGHT_GRAY} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-10 px-3 py-3 rounded-xl transition duration-200"
                    style={{
                      backgroundColor: COLORS.DARK_GRAY,
                      color: COLORS.WHITE,
                      borderColor: COLORS.NEON_GREEN,
                      borderWidth: '1px',
                    }}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center"
                style={{
                  backgroundColor: COLORS.NEON_GREEN,
                  color: COLORS.BLACK,
                  ':hover': {
                    backgroundColor: COLORS.BALANCED_GREEN,
                  },
                }}
                disabled={loading}
              >
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign in
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
                {"Don't have an account?"}
                <Link
                  to="/signup"
                  className="transition duration-200"
                  style={{
                    color: COLORS.NEON_GREEN,
                    ':hover': {
                      color: COLORS.BALANCED_GREEN,
                    },
                  }}
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;