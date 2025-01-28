import React, { useState, useEffect } from 'react';
import { menteeService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  RiUser3Line,
  RiMailLine,
  RiHeartLine,
  RiFlag2Line,
  RiBriefcaseLine,
  RiGraduationCapLine,
  RiSaveLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
  RiStarLine
} from 'react-icons/ri';

interface MenteeProfileData {
  name: string;
  email: string;
  interests: string[];
  goals: string;
  currentRole: string;
  education: string;
}

const MenteeProfile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [profileData, setProfileData] = useState<MenteeProfileData>({
    name: '',
    email: '',
    interests: [],
    goals: '',
    currentRole: '',
    education: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const data = await menteeService.getMenteeProfile();
      setProfileData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const interests = e.target.value.split(',').map(item => item.trim());
    setProfileData(prev => ({
      ...prev,
      interests
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await menteeService.updateProfile({
        name: profileData.name,
        interests: profileData.interests,
        goals: profileData.goals,
        currentRole: profileData.currentRole,
        education: profileData.education
      });
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <RiUser3Line className="text-3xl text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">Mentee Profile</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 flex items-center">
          <RiErrorWarningLine className="text-xl mr-2" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 flex items-center">
          <RiCheckboxCircleLine className="text-xl mr-2" />
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <RiUser3Line className="mr-2" />
              Name
            </label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <RiMailLine className="mr-2" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>
        </div>

        {/* Interests and Goals Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <RiHeartLine className="mr-2" />
              Interests (comma-separated)
            </label>
            <input
              type="text"
              name="interests"
              value={profileData.interests.join(', ')}
              onChange={handleInterestsChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500 flex items-center">
              <RiStarLine className="mr-2 text-gray-400" />
              Enter your areas of interest, separated by commas
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <RiFlag2Line className="mr-2" />
              Goals
            </label>
            <textarea
              name="goals"
              value={profileData.goals}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500 flex items-center">
              <RiFlag2Line className="mr-2 text-gray-400" />
              Describe your learning goals and what you want to achieve
            </p>
          </div>
        </div>

        {/* Professional Information */}
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <RiBriefcaseLine className="mr-2" />
                Current Role
              </label>
              <input
                type="text"
                name="currentRole"
                value={profileData.currentRole}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <RiGraduationCapLine className="mr-2" />
                Education
              </label>
              <input
                type="text"
                name="education"
                value={profileData.education}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center space-x-2 transition-colors"
            disabled={isLoading}
          >
            <RiSaveLine className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenteeProfile; 