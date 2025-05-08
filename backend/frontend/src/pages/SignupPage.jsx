import { COLORS } from '../lib/constants';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
//SIGNUP PAGE
const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
    age: "",
    weight: "",
    height: "",
    gender: "not-specified",
    experienceLevel: "beginner",
    healthConditions: "none",
    fitnessGoal: ""
  });

  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const { signup, loading } = useUserStore();

  // Detect mobile devices
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adjust animation settings for mobile
  const animationSettings = {
    duration: isMobile ? 0.5 : 0.8,
    delay: isMobile ? 0.1 : 0.2
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password needs to be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and conditions";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const success = await signup(formData);

    if (!success) {
      setErrors({ general: "Signup failed. Please check your details." });
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div 
          className="bg-[#121212] rounded-lg sm:rounded-2xl shadow-xl overflow-hidden"
          style={{
            backgroundColor: COLORS.MEDIUM_GRAY,
            maxWidth: isMobile ? "95%" : "100%",
            margin: "0 auto",
          }}
        >
          <div className="bg-[#4CAF50] px-5 sm:px-8 py-8 sm:py-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: animationSettings.duration }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
                Create Account
              </h2>
              <p className="text-sm sm:text-base text-white text-center mt-2">
                Join us to start your journey
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: animationSettings.duration, delay: animationSettings.delay }}
          >
            <div className="p-5 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="name" className="text-xs sm:text-sm font-medium text-gray-300">
                    Full name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full pl-10 px-3 py-3 rounded-lg sm:rounded-xl 
                      bg-[#0a0a0a]/90 text-gray-100 placeholder-gray-400 
                      focus:outline-none focus:border-transparent 
                      transition duration-200 
                      text-sm sm:text-base"
                      placeholder="John Doe"
                      style={{
                        borderColor: COLORS.NEON_GREEN,
                        borderWidth: '1px'
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`block w-full pl-10 px-3 py-3 rounded-lg sm:rounded-xl 
                      bg-[#0a0a0a]/90 text-gray-100 placeholder-gray-400 
                      focus:outline-none focus:border-transparent 
                      transition duration-200
                      text-sm sm:text-base
                      ${errors.email ? "border-red-500 focus:ring-red-500" : "border-green-500 focus:ring-green-500"}`}
                      placeholder="you@example.com"
                      style={{
                        borderColor: errors.email ? "red" : COLORS.NEON_GREEN,
                        borderWidth: '1px'
                      }}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center h-full pointer-events-none">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`block w-full pl-10 px-3 py-3 rounded-lg sm:rounded-xl 
                      bg-[#0a0a0a]/90 text-gray-100 placeholder-gray-400 
                      focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                      transition duration-200
                      text-sm sm:text-base
                      ${errors.password ? "border-red-500 focus:ring-red-500" : "border-green-500 focus:ring-green-500"}`}
                      placeholder="••••••••"
                      style={{
                        borderColor: errors.password ? "red" : COLORS.NEON_GREEN,
                        borderWidth: '1px'
                      }} 
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password}</p>}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center h-full pointer-events-none">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      className={`block w-full pl-10 px-3 py-3 rounded-lg sm:rounded-xl 
                      bg-[#0a0a0a]/90 text-gray-100 placeholder-gray-400 
                      focus:outline-none focus:ring-2 
                      transition duration-200
                      text-sm sm:text-base
                      ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-green-500 focus:ring-green-500"}`}
                      placeholder="••••••••"
                      style={{
                        borderColor: errors.confirmPassword ? "red" : COLORS.NEON_GREEN,
                        borderWidth: '1px'
                      }}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-300">
                    Terms & Conditions
                  </label>
                  <div className="bg-[#0a0a0a]/70 text-gray-300 text-xs sm:text-sm border border-gray-600 rounded-lg sm:rounded-xl p-3 sm:p-4 max-h-32 sm:max-h-40 overflow-y-auto">
                    <p>
                      Welcome, and thank you for choosing our platform. Before proceeding, please carefully review the following Terms and Conditions. By checking the box and using our services, you acknowledge and agree to the following:
                    </p>
                    <p className="mt-2">
                      <strong>1. Acceptance of Terms:</strong> By accessing or using this website and any related services, you agree to comply with and be bound by these Terms and Conditions, our Privacy Policy, and our Community Guidelines. If you do not agree to any part of these terms, please do not use our services.
                    </p>

                    <p className="mt-2">
                      <strong>2. No Professional Advice:</strong> The content provided on this platform, including but not limited to recommendations generated by AI, is for informational purposes only. We are not licensed health professionals, medical providers, or legal advisors. Any content should not be interpreted as medical, legal, or other professional advice. You should always consult with a qualified professional before making decisions related to your health, legal matters, or other critical areas.
                    </p>

                    <p className="mt-2">
                      <strong>3. Limitation of Liability:</strong> Under no circumstances shall we be held liable for any loss, injury, or damage resulting from reliance on any content or recommendations provided on this platform, including AI-generated responses. Use of the platform is at your own risk.
                    </p>

                    <p className="mt-2">
                      <strong>4. Data Privacy and Security:</strong> Your data is encrypted and securely stored. We are committed to maintaining the confidentiality of your personal information. We do not sell, rent, or share your data with third parties without your explicit consent, except as required by law. Please refer to our Privacy Policy for more detailed information.
                    </p>

                    <p className="mt-2">
                      <strong>5. User Conduct:</strong> Users are expected to engage respectfully and responsibly. Any form of abuse, harassment, or violation of community standards may result in account suspension or permanent termination without prior notice.
                    </p>

                    <p className="mt-2">
                      <strong>6. Modifications:</strong> We reserve the right to update or modify these Terms and Conditions at any time. Continued use of the platform after such changes constitutes your acceptance of the new terms.
                    </p>

                    <p className="mt-2">
                      <strong>7. Contact:</strong> If you have any questions about these Terms and Conditions or our policies, please contact our support team at phitness@gmail.com.
                    </p>

                    <p className="mt-2">
                      By checking the box, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions.
                    </p>
                  </div>

                  <div className="flex items-start mt-2 sm:mt-3">
                    <input
                      id="termsAccepted"
                      type="checkbox"
                      checked={formData.termsAccepted || false}
                      onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                      className="mt-1 h-4 w-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="termsAccepted" className="ml-2 text-xs sm:text-sm text-gray-300">
                      I agree to the Terms and Conditions
                    </label>
                  </div>
                  {errors.termsAccepted && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.termsAccepted}</p>}
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
                      <span className="text-xs sm:text-sm">Creating account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm">Create account</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-xs sm:text-sm text-gray-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium hover:text-green-300 inline-flex items-center transition duration-200"
                  >
                    Sign in now
                    <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
