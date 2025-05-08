import { COLORS } from '../lib/constants';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from 'react-hot-toast';
import axios from '../lib/axios'; 


const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [errors, setError] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);


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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      toast.success('Password reset email sent successfully!');
    } catch (error) {
      toast.error('Error sending forgot password request');
    } finally {
      setLoading(false);
    }
  };


  // Adjust animation settings for mobile
  const animationSettings = {
    duration: isMobile ? 0.5 : 0.8,
    delay: isMobile ? 0.1 : 0.2
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div 
          className="bg-[#0a0a0a]/90 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden"
          style={{
            backgroundColor: COLORS.MEDIUM_GRAY,
            maxWidth: isMobile ? "95%" : "100%",
            margin: "0 auto",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)"
          }}
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-gray-700 px-5 sm:px-8 py-8 sm:py-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: animationSettings.duration }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
                Forgot Password?
              </h2>
              <p className="text-sm sm:text-base text-white text-center mt-2">
                If you have a registered account then enter your email so we can send a recovery email. Make sure to check your spam if you cant find it.
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
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 px-3 py-3 rounded-lg sm:rounded-xl 
                      bg-[#0a0a0a]/90 text-gray-100 placeholder-gray-400 
                      focus:outline-none 
                      focus:border-transparent transition duration-200
                      text-sm sm:text-base"
                      placeholder="Enter your email"
                      required

                      style={{
                        borderColor: COLORS.NEON_GREEN,
                        borderWidth: '1px'
                      }}
                    />
                    {errors.email && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                
                {errors.general && <p className="text-red-500 text-xs sm:text-sm text-center">{errors.general}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 flex justify-center items-center bg-gradient-to-r 
                  from-green-600 to-gray-700 hover:from-green-700 hover:to-gray-800 
                  text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl 
                  transition duration-200 disabled:opacity-50
                  active:from-green-800 active:to-gray-900"
                  style={{
                    backgroundColor: COLORS.DARK_GRAY,
                  }}>
                  {loading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span className="text-xs sm:text-sm">Sending...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm">Email Sent</span>
                    </>
                  )}
                </button>
              </form>

             

              
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;