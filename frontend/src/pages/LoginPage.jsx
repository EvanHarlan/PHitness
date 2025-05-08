import { COLORS } from '../lib/constants';
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setError] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const { login, loading } = useUserStore();
  const navigate = useNavigate();

  // Detect mobile devices
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError({}); // Reset error messages on form submission
    login(email, password)
      .then((success) => {
        if (success) {
          navigate("/profile"); // Redirect to profile page after successful login
        } else {
          // Set error message if login fails
          setError({ general: "Invalid email or password. Please try again." });
        }
      })
      .catch(() => {
        // Handle unexpected errors (e.g., network issues)
        setError({ general: "Something went wrong. Please try again later." });
      });
  };

  // Adjust animation settings for mobile
  const animationSettings = {
    duration: isMobile ? 0.5 : 0.8,
    delay: isMobile ? 0.1 : 0.2
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div 
          className="bg-[#121212] rounded-xl sm:rounded-2xl shadow-xl overflow-hidden"
          style={{
            backgroundColor: COLORS.MEDIUM_GRAY,
            maxWidth: isMobile ? "95%" : "100%",
            margin: "0 auto",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)"
          }}
        >
          {/* Header Section */}
          <div className="bg-[#4CAF50] px-5 sm:px-8 py-8 sm:py-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: animationSettings.duration }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
                Welcome Back
              </h2>
              <p className="text-sm sm:text-base text-white text-center mt-2">
                Enter your credentials to access your account
              </p>
            </motion.div>
          </div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: animationSettings.duration, delay: animationSettings.delay }}
          >
            <div className="p-5 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-300">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 px-3 py-3 rounded-lg sm:rounded-xl 
                      bg-[#0a0a0a]/90 text-gray-100 placeholder-gray-400 
                      focus:outline-none 
                      focus:border-transparent transition duration-200
                      text-sm sm:text-base"
                      placeholder="you@example.com"
                      style={{
                        borderColor: COLORS.NEON_GREEN,
                        borderWidth: '1px'
                      }}
                    />
                    {errors.email && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 px-3 py-3 border border-gray-600 rounded-lg sm:rounded-xl 
                      bg-[#0a0a0a]/90 text-gray-100 placeholder-gray-400 
                      focus:outline-none focus:ring-2 focus:ring-gray-500 
                      focus:border-transparent transition duration-200
                      text-sm sm:text-base"
                      placeholder="••••••••"
                      style={{
                        borderColor: COLORS.NEON_GREEN,
                        borderWidth: '1px'
                      }}
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password}</p>}
                </div>

                {errors.general && <p className="text-red-500 text-xs sm:text-sm text-center">{errors.general}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 flex justify-center items-center
                  text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl 
                  transition duration-200 disabled:opacity-90 hover:brightness-90"
                  style={{ 
                    backgroundColor: COLORS.BALANCED_GREEN
                  }}>
                  {loading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span className="text-xs sm:text-sm">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm">Sign in to your account</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7 text-center">
                <p className="text-xs sm:text-sm text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-medium text-gray-400 hover:text-green-300 
                    inline-flex items-center transition duration-200"
                    style={{
                      backgroundColor: COLORS.MEDIUM_GRAY,
                    }}> 
                    Create one now
                    <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </p>
              </div>

              <div className="mt-4 text-center">
                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm text-gray-400 hover:text-green-300 items-center transition duration-200"
                  >
                  Forgot your password?
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
