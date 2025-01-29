import { useState, useEffect } from 'react';
import { mentorService } from '../services/api';
import SessionBooking from '../components/SessionBooking';
import {
  RiUserStarLine,
  RiBriefcaseLine,
  RiTimeLine,
  RiLightbulbLine,
  RiFileTextLine,
  RiCalendarCheckLine,
  RiSearchLine,
  RiUserHeartLine,
  RiErrorWarningLine
} from 'react-icons/ri';

interface Mentor {
  _id: string;
  name: string;
  expertise: string[];
  bio: string;
  yearsOfExperience: number;
  currentRole: string;
  company: string;
}

const SessionRequestPage = (): JSX.Element => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleRequestSuccess = () => {
    setSelectedMentor(null);
  };

  const filteredMentors = mentors.filter(mentor => 
    (mentor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mentor.expertise || []).some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (mentor.currentRole || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mentor.company || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="flex items-center mb-4 md:mb-0">
          <RiUserHeartLine className="text-3xl text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Request a Session</h1>
        </div>
        
        <div className="relative w-full md:w-96">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, expertise, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <div key={mentor._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4 mb-4">
              <div className="bg-indigo-100 rounded-full p-3">
                <RiUserStarLine className="text-2xl text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{mentor.name || 'Anonymous Mentor'}</h3>
                <div className="flex items-center text-gray-600 mt-1">
                  <RiBriefcaseLine className="mr-2" />
                  <p>
                    {mentor.currentRole ? `${mentor.currentRole}${mentor.company ? ` at ${mentor.company}` : ''}` : 'Role not specified'}
                  </p>
                </div>
                <div className="flex items-center text-gray-600 mt-1">
                  <RiTimeLine className="mr-2" />
                  <p>{mentor.yearsOfExperience ? `${mentor.yearsOfExperience} years of experience` : 'Experience not specified'}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <RiLightbulbLine className="text-indigo-600 mr-2" />
                <h4 className="font-semibold">Expertise</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {(mentor.expertise || []).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center"
                  >
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                    {skill}
                  </span>
                ))}
                {(!mentor.expertise || mentor.expertise.length === 0) && (
                  <span className="text-gray-500 text-sm">No expertise specified</span>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <RiFileTextLine className="text-indigo-600 mr-2" />
                <h4 className="font-semibold">About</h4>
              </div>
              <p className="text-gray-700">{mentor.bio || 'No bio available'}</p>
            </div>
            
            <button
              onClick={() => setSelectedMentor(mentor._id)}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
            >
              <RiCalendarCheckLine />
              <span>Request Session</span>
            </button>
          </div>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="text-center py-12">
          <RiSearchLine className="mx-auto text-5xl text-gray-400 mb-4" />
          <p className="text-gray-500">No mentors found matching your search criteria.</p>
        </div>
      )}

      {selectedMentor && (
        <SessionBooking
          mentorId={selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};

export default SessionRequestPage; 