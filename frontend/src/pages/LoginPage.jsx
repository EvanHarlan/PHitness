import { useState } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../App';
import { Mail, Lock } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for future authentication logic
    console.log("Login attempt");
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
              Welcome Back
            </h2>
            <p 
              className="mt-2"
              style={{ 
                color: COLORS.LIGHT_GRAY 
              }}
            >
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                Sign in to your account
              </button>
            </form>

            <div className="mt-8 text-center">
              <p 
                className="text-sm"
                style={{ 
                  color: COLORS.LIGHT_GRAY 
                }}
              >
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="transition duration-200"
                  style={{ 
                    color: COLORS.NEON_GREEN,
                    ':hover': {
                      color: COLORS.BALANCED_GREEN
                    }
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