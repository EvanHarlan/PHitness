import { COLORS } from '../lib/constants';
import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

    const [errors, setErrors] = useState({});

  const { signup, loading } = useUserStore();

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

      if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
      }

      setErrors({});
      const success = await signup(formData);

      if (!success) {
          setErrors({ general: "Signup failed. Please check your details." })
      }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0a0a0a]/90 rounded-2xl shadow-xl overflow-hidden "
        style={{
          backgroundColor: COLORS.MEDIUM_GRAY,
        }}>
        
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-gray-700 px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-white text-center">
                Create Account
              </h2>
              <p className="text-white text-center mt-2">
                Join us to start your journey
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-300">
                    Full name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full pl-10 px-3 py-3 rounded-xl 
                      bg-[#0a0a0a]/90 text-gray-100 placeholder-gray-400 
                      focus:outline-none focus:border-transparent 
                      transition duration-200"
                      placeholder="John Doe"
                      style={{
                        
                        borderColor: COLORS.NEON_GREEN,
                        borderWidth: '1px'
                      }}/>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`block w-full pl-10 px-3 py-3 rounded-xl 
                      bg-[#0a0a0a]/90 text-gray-100 placeholder-gray-400 
                      focus:outline-none focus:border-transparent 
                      transition duration-200
                      ${errors.email ? "border-red-500 focus:ring-red-500" : "border-green-500 focus:ring-green-500"}`}
                      placeholder="you@example.com"
                      style={{
                        
                        borderColor: errors.email ? "red" : COLORS.NEON_GREEN,
                        borderWidth: '1px'
                      }}/>
                                  </div>
                                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center h-full pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`block w-full pl-10 px-3 py-3 rounded-xl 
                      bg-[#0a0a0a]/90 text-gray-100 placeholder-gray-400 
                      focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                      transition duration-200
                      ${errors.password ? "border-red-500 focus:ring-red-500" : "border-green-500 focus:ring-green-500"}`}
                      placeholder="••••••••"
                      style={{
                        
                        borderColor: errors.password ? "red" : COLORS.NEON_GREEN,
                        borderWidth: '1px'
                       }} 
                    />
                                  </div>
                                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center h-full pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      className={`block w-full pl-10 px-3 py-3  rounded-xl 
                      bg-[#0a0a0a]/90 text-gray-100 placeholder-gray-400 
                      focus:outline-none focus:ring-2 
                      transition duration-200
                      ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-green-500 focus:ring-green-500"}`}
                      placeholder="••••••••"
                      style={{
                        
                        borderColor: errors.confirmPassword ? "red" : COLORS.NEON_GREEN,
                        borderWidth: '1px'
                      }}
                     />
                                  </div>
                                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 flex justify-center items-center bg-gradient-to-r 
                  from-green-600 to-gray-700 hover:from-green-700 hover:to-gray-800 
                  text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl 
                  transition duration-200 disabled:opacity-50"
                  >
                  {loading ? (
                    <>
                      <Loader className="mr-2 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Create account
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium hover:text-green-300 inline-flex items-center transition duration-200"
                    >
                    Sign in now
                    <ArrowRight className="ml-1 h-4 w-4" />
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
