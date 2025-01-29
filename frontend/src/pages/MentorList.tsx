import { useState, useEffect } from 'react';
import { mentorService } from '../services/api';
import {
  RiUserStarLine,
  RiBriefcaseLine,
  RiTimeLine,
  RiLightbulbLine,
  RiFileTextLine,
  RiSearchLine,
  RiFilterLine,
  RiUserHeartLine,
  RiLinkedinBoxLine,
  RiMailLine,
  RiErrorWarningLine,
  RiStarLine,
  RiMessage3Line,
} from 'react-icons/ri';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  expertise: string[];
  bio: string;
  yearsOfExperience: number;
  currentRole: string;
  company: string;
  linkedIn?: string;
  rating?: number;
  totalSessions?: number;
}

const MentorList = (): JSX.Element => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [experienceFilter, setExperienceFilter] = useState<string>('all');

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const data = await mentorService.getAllMentors();
      setMentors(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mentors');
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique expertise areas from all mentors
  const allExpertiseAreas = Array.from(
    new Set(
      mentors.flatMap(mentor => mentor.expertise || [])
    )
  ).sort();

  const toggleExpertise = (expertise: string) => {
    setSelectedExpertise(prev =>
      prev.includes(expertise)
        ? prev.filter(e => e !== expertise)
        : [...prev, expertise]
    );
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = 
      (mentor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mentor.currentRole || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mentor.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mentor.expertise || []).some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesExpertise = 
      selectedExpertise.length === 0 ||
      selectedExpertise.some(expertise => 
        mentor.expertise?.includes(expertise)
      );

    const matchesExperience = 
      experienceFilter === 'all' ||
      (experienceFilter === '0-2' && mentor.yearsOfExperience <= 2) ||
      (experienceFilter === '3-5' && mentor.yearsOfExperience > 2 && mentor.yearsOfExperience <= 5) ||
      (experienceFilter === '5+' && mentor.yearsOfExperience > 5);

    return matchesSearch && matchesExpertise && matchesExperience;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <RiErrorWarningLine className="mx-auto text-5xl mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <RiUserHeartLine className="text-3xl text-indigo-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Find Your Mentor</h1>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Mentors</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <RiSearchLine className="text-gray-400 text-lg" />
              </div>
              <input
                type="text"
                placeholder="Search by name, expertise, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Experience Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="all">All Experience Levels</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-end space-x-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{mentors.length}</p>
              <p className="text-sm text-gray-500 whitespace-nowrap">Total Mentors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{filteredMentors.length}</p>
              <p className="text-sm text-gray-500 whitespace-nowrap">Matching Results</p>
            </div>
          </div>
        </div>

        {/* Expertise Filter */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <RiFilterLine className="mr-2 text-lg text-gray-400" />
            Filter by Expertise
          </h3>
          <div className="flex flex-wrap gap-2">
            {allExpertiseAreas.map((expertise) => (
              <button
                key={expertise}
                onClick={() => toggleExpertise(expertise)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedExpertise.includes(expertise)
                    ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {expertise}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mentor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <div key={mentor._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
            {/* Mentor Header */}
            <div className="flex items-start space-x-4 mb-4">
              <div className="bg-indigo-100 rounded-full p-3 flex-shrink-0">
                <RiUserStarLine className="text-2xl text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold truncate">{mentor.name || 'Anonymous Mentor'}</h3>
                <div className="flex items-center text-gray-600 mt-1">
                  <RiBriefcaseLine className="mr-2 flex-shrink-0" />
                  <p className="truncate">
                    {mentor.currentRole ? `${mentor.currentRole}${mentor.company ? ` at ${mentor.company}` : ''}` : 'Role not specified'}
                  </p>
                </div>
                <div className="flex items-center text-gray-600 mt-1">
                  <RiTimeLine className="mr-2 flex-shrink-0" />
                  <p className="truncate">
                    {mentor.yearsOfExperience ? `${mentor.yearsOfExperience} years of experience` : 'Experience not specified'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-2">
                <RiLightbulbLine className="text-indigo-600 mr-2 flex-shrink-0" />
                <h4 className="font-semibold">Expertise</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {(mentor.expertise || []).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center"
                  >
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2 flex-shrink-0"></span>
                    <span className="truncate">{skill}</span>
                  </span>
                ))}
                {(!mentor.expertise || mentor.expertise.length === 0) && (
                  <span className="text-gray-500 text-sm">No expertise specified</span>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mb-auto">
              <div className="flex items-center mb-2">
                <RiFileTextLine className="text-indigo-600 mr-2 flex-shrink-0" />
                <h4 className="font-semibold">About</h4>
              </div>
              <p className="text-gray-700 line-clamp-3">{mentor.bio || 'No bio available'}</p>
            </div>

            {/* Stats & Contact */}
            <div className="flex items-center justify-between text-sm text-gray-500 mt-4 mb-4">
              <div className="flex items-center space-x-4">
                {mentor.rating && (
                  <span className="flex items-center">
                    <RiStarLine className="text-yellow-400 mr-1 flex-shrink-0" />
                    {mentor.rating.toFixed(1)}
                  </span>
                )}
                {mentor.totalSessions && (
                  <span className="flex items-center">
                    <RiMessage3Line className="mr-1 flex-shrink-0" />
                    {mentor.totalSessions} sessions
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {mentor.linkedIn && (
                  <a
                    href={mentor.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                  >
                    <RiLinkedinBoxLine className="text-xl" />
                  </a>
                )}
                <a
                  href={`mailto:${mentor.email}`}
                  className="text-indigo-600 hover:text-indigo-800 flex-shrink-0"
                >
                  <RiMailLine className="text-xl" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="text-center py-12">
          <RiSearchLine className="mx-auto text-5xl text-gray-400 mb-4" />
          <p className="text-gray-500">No mentors found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default MentorList; 