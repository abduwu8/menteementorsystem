import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SquaresBackground from '../../components/SquaresBackground';

const MenteeLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      await login(email, password, 'mentee');
      navigate('/mentee-dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Black background with image */}
      <div className="hidden lg:flex lg:w-1/2 bg-black items-center justify-center relative">
        <SquaresBackground />
        <div className="w-full max-w-md text-white text-center relative z-10">
          {/* Image placeholder - Replace src with your actual image */}
          <div className="mb-8">
            {/* <div className="w-48 h-48 mx-auto bg-gray-800 rounded-full flex items-center justify-center text-white text-xl font-medium">
              Image Placeholder
            </div> */}
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Welcome Back, Mentee!</h1>
          <p className="text-lg text-gray-300 leading-relaxed font-medium">
            Continue your learning journey with expert guidance
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Mentee Login
            </h2>
            <p className="mt-2 text-base text-gray-600 font-medium">
              Access your learning dashboard
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black text-base font-normal"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black text-base font-normal"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400 transition-colors duration-200"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/register/mentee"
                  className="font-semibold text-black hover:text-gray-700 transition-colors duration-200"
                >
                  Don't have an account? Register
                </Link>
              </div>
              <div className="text-sm">
                <Link
                  to="/login/mentor"
                  className="font-semibold text-black hover:text-gray-700 transition-colors duration-200"
                >
                  Login as a mentor?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MenteeLogin; 
