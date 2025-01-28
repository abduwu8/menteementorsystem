import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MenteeRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    interests: [] as string[],
    goals: '',
    currentRole: '',
    education: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const interests = e.target.value.split(',').map(item => item.trim());
    setFormData(prev => ({ ...prev, interests }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        ...formData,
        role: 'mentee'
      });
      navigate('/mentee-dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Join as a Mentee</h1>
          <p className="text-lg text-gray-600">Start your journey of growth with expert guidance</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-200 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Information Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>

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
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
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
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="Min. 6 characters"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="Confirm password"
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              {/* Learning Profile Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Profile</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                      Areas of Interest
                    </label>
                    <input
                      id="interests"
                      name="interests"
                      type="text"
                      required
                      value={formData.interests.join(', ')}
                      onChange={handleInterestsChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="e.g., Web Development, Machine Learning (comma-separated)"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="goals" className="block text-sm font-medium text-gray-700">
                      Learning Goals
                    </label>
                    <textarea
                      id="goals"
                      name="goals"
                      required
                      value={formData.goals}
                      onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="What do you want to achieve through mentorship?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label htmlFor="currentRole" className="block text-sm font-medium text-gray-700">
                      Current Role <span className="text-gray-500">(optional)</span>
                    </label>
                    <input
                      id="currentRole"
                      name="currentRole"
                      type="text"
                      value={formData.currentRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentRole: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="e.g., Student, Junior Developer"
                    />
                  </div>

                  <div>
                    <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                      Education <span className="text-gray-500">(optional)</span>
                    </label>
                    <input
                      id="education"
                      name="education"
                      type="text"
                      value={formData.education}
                      onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="Your educational background"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/login/mentee"
                  className="font-medium text-black hover:text-gray-500 transition-colors duration-200"
                >
                  Already have an account? Sign in
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  to="/register/mentor"
                  className="text-sm font-medium text-black hover:text-gray-500 transition-colors duration-200"
                >
                  Register as a mentor instead?
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors duration-200"
                >
                  {isLoading ? 'Registering...' : 'Register as Mentee'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MenteeRegister; 