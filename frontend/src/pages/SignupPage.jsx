import { useState } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../App';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for future signup logic
    console.log("Signup attempt");
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        backgroundColor: COLORS.BLACK 
      }}
    >
      <div className="w-full max-w-md">
        <div 
          className="rounded-2xl overflow-hidden shadow-lg"
          style={{ 
            backgroundColor: COLORS.MEDIUM_GRAY 
          }}
        >
          {/* Header Section */}
          <div 
            className="px-8 py-12 text-center"
            style={{ 
              backgroundColor: COLORS.DARK_GRAY 
            }}
          >
            <h2 
              className="text-3xl font-bold"
              style={{ 
                color: COLORS.NEON_GREEN 
              }}
            >
              Create Account
            </h2>
            <p 
              className="mt-2"
              style={{ 
                color: COLORS.LIGHT_GRAY 
              }}
            >
              Join us to start your journey
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Input */}
              <div className="space-y-2">
                <label 
                  htmlFor="name" 
                  className="text-sm font-medium"
                  style={{ 
                    color: COLORS.WHITE 
                  }}
                >
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User 
                      className="h-5 w-5" 
                      color={COLORS.LIGHT_GRAY} 
                    />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full pl-10 px-3 py-3 rounded-xl transition duration-200"
                    style={{
                      backgroundColor: COLORS.DARK_GRAY,
                      color: COLORS.WHITE,
                      borderColor: COLORS.NEON_GREEN,
                      borderWidth: '1px'
                    }}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="text-sm font-medium"
                  style={{ 
                    color: COLORS.WHITE 
                  }}
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail 
                      className="h-5 w-5" 
                      color={COLORS.LIGHT_GRAY} 
                    />
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
                      borderWidth: '1px'
                    }}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="text-sm font-medium"
                  style={{ 
                    color: COLORS.WHITE 
                  }}
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock 
                      className="h-5 w-5" 
                      color={COLORS.LIGHT_GRAY} 
                    />
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
                      borderWidth: '1px'
                    }}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label 
                  htmlFor="confirmPassword" 
                  className="text-sm font-medium"
                  style={{ 
                    color: COLORS.WHITE 
                  }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock 
                      className="h-5 w-5" 
                      color={COLORS.LIGHT_GRAY} 
                    />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="block w-full pl-10 px-3 py-3 rounded-xl transition duration-200"
                    style={{
                      backgroundColor: COLORS.DARK_GRAY,
                      color: COLORS.WHITE,
                      borderColor: COLORS.NEON_GREEN,
                      borderWidth: '1px'
                    }}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl transition duration-200"
                style={{
                  backgroundColor: COLORS.NEON_GREEN,
                  color: COLORS.BLACK,
                  ':hover': {
                    backgroundColor: COLORS.BALANCED_GREEN
                  }
                }}
              >
                <UserPlus className="mr-2 h-5 w-5 inline-block" />
                Create account
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p 
                className="text-sm"
                style={{ 
                  color: COLORS.LIGHT_GRAY 
                }}
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="transition duration-200"
                  style={{ 
                    color: COLORS.NEON_GREEN,
                    ':hover': {
                      color: COLORS.BALANCED_GREEN
                    }
                  }}
                >
                  Sign in now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;