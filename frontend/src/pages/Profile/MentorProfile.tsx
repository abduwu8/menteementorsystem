import React, { useState, useEffect } from 'react';
import { mentorService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  RiUser3Line,
  RiMailLine,
  RiLightbulbLine,
  RiFileTextLine,
  RiTimeLine,
  RiBriefcaseLine,
  RiBuildingLine,
  RiLinkedinBoxLine,
  RiSaveLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine
} from 'react-icons/ri';
import Loader from '../../components/Loader';


interface MentorProfileData {
  name: string;
  email: string;
  expertise: string[];
  bio: string;
  yearsOfExperience: number;
  currentRole: string;
  company: string;
  linkedIn?: string;
}

const MentorProfile = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [profileData, setProfileData] = useState<MentorProfileData>({
    name: '',
    email: '',
    expertise: [],
    bio: '',
    yearsOfExperience: 0,
    currentRole: '',
    company: '',
    linkedIn: ''
  });

  useEffect(() => {
    if (user && 'id' in user) {
      fetchProfileData(user.id);
    }
  }, [user]);

  const fetchProfileData = async (userId: string) => {
    try {
      setIsLoading(true);
      const data = await mentorService.getMentorById(userId);
      setProfileData({
        name: data?.name || '',
        email: data?.email || '',
        expertise: Array.isArray(data?.expertise) ? data.expertise : [],
        bio: data?.bio || '',
        yearsOfExperience: data?.yearsOfExperience || 0,
        currentRole: data?.currentRole || '',
        company: data?.company || '',
        linkedIn: data?.linkedIn || ''
      });
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
      [name]: name === 'yearsOfExperience' ? parseInt(value) || 0 : value
    }));
  };

  const handleExpertiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const expertise = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
    setProfileData(prev => ({
      ...prev,
      expertise
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      
      // First update the profile in the backend
      await mentorService.updateProfile({
        expertise: profileData.expertise,
        bio: profileData.bio,
        yearsOfExperience: profileData.yearsOfExperience,
        currentRole: profileData.currentRole,
        company: profileData.company,
        linkedIn: profileData.linkedIn
      });

      // Then update the user data in the auth context
      updateUser({
        expertise: profileData.expertise,
        bio: profileData.bio,
        yearsOfExperience: profileData.yearsOfExperience,
        currentRole: profileData.currentRole,
        company: profileData.company
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
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <RiUser3Line className="text-3xl text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">Mentor Profile</h1>
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
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <RiMailLine className="mr-2" />
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>
        </div>

        {/* Expertise and Bio Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <RiLightbulbLine className="mr-2" />
              Expertise (comma-separated)
            </label>
            <input
              type="text"
              value={profileData.expertise?.join(', ') || ''}
              onChange={handleExpertiseChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500 flex items-center">
              <RiLightbulbLine className="mr-2 text-gray-400" />
              Enter your areas of expertise, separated by commas
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <RiFileTextLine className="mr-2" />
              Bio
            </label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500 flex items-center">
              <RiFileTextLine className="mr-2 text-gray-400" />
              Write a brief description about yourself and your experience
            </p>
          </div>
        </div>

        {/* Professional Information */}
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <RiTimeLine className="mr-2" />
                Years of Experience
              </label>
              <input
                type="number"
                name="yearsOfExperience"
                value={profileData.yearsOfExperience}
                onChange={handleInputChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

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
                <RiBuildingLine className="mr-2" />
                Company
              </label>
              <input
                type="text"
                name="company"
                value={profileData.company}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <RiLinkedinBoxLine className="mr-2" />
                LinkedIn Profile
              </label>
              <input
                type="url"
                name="linkedIn"
                value={profileData.linkedIn}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="https://linkedin.com/in/your-profile"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <RiSaveLine className="mr-2" />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MentorProfile; 