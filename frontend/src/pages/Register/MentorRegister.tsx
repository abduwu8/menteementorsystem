import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MentorRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    expertise: [] as string[],
    bio: '',
    yearsOfExperience: '',
    currentRole: '',
    company: '',
    linkedIn: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExpertiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const expertise = e.target.value.split(',').map(item => item.trim());
    setFormData(prev => ({ ...prev, expertise }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.expertise.length === 0) {
      setError('Please enter at least one area of expertise');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        ...formData,
        role: 'mentor',
        yearsOfExperience: parseInt(formData.yearsOfExperience)
      });
      navigate('/mentor-dashboard');
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Join as a Mentor</h1>
          <p className="text-lg text-gray-600">Share your expertise and make a difference in someone's career</p>
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

              {/* Professional Information Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label htmlFor="expertise" className="block text-sm font-medium text-gray-700">
                      Areas of Expertise
                    </label>
                    <input
                      id="expertise"
                      name="expertise"
                      type="text"
                      required
                      value={formData.expertise.join(', ')}
                      onChange={handleExpertiseChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="e.g., React, Node.js, Python (comma-separated)"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      required
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="Tell us about yourself"
                      maxLength={500}
                      rows={3}
                    />
                    <p className="mt-1 text-xs text-gray-500 text-right">{formData.bio.length}/500</p>
                  </div>

                  <div>
                    <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
                      Years of Experience
                    </label>
                    <input
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      type="number"
                      required
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="Years"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="currentRole" className="block text-sm font-medium text-gray-700">
                      Current Role
                    </label>
                    <input
                      id="currentRole"
                      name="currentRole"
                      type="text"
                      required
                      value={formData.currentRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentRole: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="e.g., Senior Engineer"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      Company
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label htmlFor="linkedIn" className="block text-sm font-medium text-gray-700">
                      LinkedIn <span className="text-gray-500">(optional)</span>
                    </label>
                    <input
                      id="linkedIn"
                      name="linkedIn"
                      type="url"
                      value={formData.linkedIn}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedIn: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="LinkedIn profile URL"
                      pattern="^https?:\/\/([a-zA-Z0-9-]+\.)?linkedin\.com\/.*$"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/login/mentor"
                  className="font-medium text-black hover:text-gray-500 transition-colors duration-200"
                >
                  Already have an account? Sign in
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  to="/register/mentee"
                  className="text-sm font-medium text-black hover:text-gray-500 transition-colors duration-200"
                >
                  Register as a mentee instead?
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors duration-200"
                >
                  {isLoading ? 'Registering...' : 'Register as Mentor'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MentorRegister; 