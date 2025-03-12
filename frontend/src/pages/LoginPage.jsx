import { COLORS } from '../lib/constants';
import { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, Loader } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = userState({});
  const { login, loading } = useUserStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
      let newErrors = {};

      if (!email.trim()) {
          newErrors.email = "Email is required.";
      }
      if (!password.trim()) {
          newErrors.password = "Password is required.";
      }

      if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
      }

      setErrors({});
      const success = await login(email, password);

      if (!success) {
          setErrors({ general: "Invalid email or password." });
      }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0a0a0a]/90 rounded-2xl shadow-xl overflow-hidden"
        style={{
          backgroundColor: COLORS.MEDIUM_GRAY,
        }}>
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-gray-700 px-8 py-12">
            <h2 className="text-3xl font-bold text-white text-center"
            >
              Welcome Back
            </h2>
            <p className="text-white text-center mt-2">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 px-3 py-3 rounded-xl 
                    bg-[#0a0a0a]/90 text-gray-100 placeholder-gray-400 
                    focus:outline-none 
                    focus:border-transparent transition duration-200"
                    placeholder="you@example.com"
                    style={{
                        
                      borderColor: COLORS.NEON_GREEN,
                      borderWidth: '1px'
                    }}
                  />
                              </div>
                              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>} {/* Inline error */}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 px-3 py-3 border border-gray-600 rounded-xl 
                    bg-[#0a0a0a]/90 text-gray-100 placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-gray-500 
                    focus:border-transparent transition duration-200"
                    placeholder="••••••••"
                    style={{
                        
                      borderColor: COLORS.NEON_GREEN,
                      borderWidth: '1px'
                    }}
                  />
                </div>
                 {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>} {/* Inline error */}
              </div>

              {errors.general && <p className="text-red-500 text-sm text-center">{errors.general}</p>} {/* Centered error */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 flex justify-center items-center bg-gradient-to-r 
                from-green-600 to-gray-700 hover:from-green-700 hover:to-gray-800 
                text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl 
                transition duration-200 disabled:opacity-50"
                style={{
                  backgroundColor: COLORS.DARK_GRAY,
                 
                }}>
                {loading ? (
                  <>
                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign in to your account
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-gray-400 hover:text-green-300 
                  inline-flex items-center transition duration-200"
                  style={{
                    backgroundColor: COLORS.MEDIUM_GRAY,
                  }}> 
                  Create one now
                  <ArrowRight className="ml-1 h-4 w-4" />
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
