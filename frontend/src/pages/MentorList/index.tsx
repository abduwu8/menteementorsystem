import React, { useState, useEffect } from 'react';
import { mentorService, sessionService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import SessionRequestForm from '../../components/SessionRequestForm';
import MentorCard from '../../components/MentorCard';
import SessionBooking from '../../components/SessionBooking';
import Loader from '../../components/Loader';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  day: string;
  timeSlots: TimeSlot[];
}

interface Mentor {
  _id: string;
  name: string;
  expertise: string[];
  bio: string;
  currentRole: string;
  company: string;
  availableSlots: DaySchedule[];
}

const MentorList = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setIsLoading(true);
      const data = await mentorService.getAllMentors();
      setMentors(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch mentors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMentorSelect = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    if (mentor.availableSlots?.length > 0) {
      setSelectedDay(mentor.availableSlots[0].day);
    }
    setSelectedTimeSlot(null);
  };

  const handleBookSession = async (formData: { topic: string; description: string }) => {
    if (!selectedMentor || !selectedDay || !selectedTimeSlot) return;

    try {
      await sessionService.requestSession({
        mentorId: selectedMentor._id,
        date: selectedDay,
        timeSlot: selectedTimeSlot,
        topic: formData.topic,
        description: formData.description
      });
      
      setShowRequestForm(false);
      navigate('/mentee-dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book session');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Mentors</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mentor List */}
        <div className="space-y-6">
          {mentors.map((mentor) => (
            <div
              key={mentor._id}
              className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all ${
                selectedMentor?._id === mentor._id ? 'ring-2 ring-indigo-500' : ''
              }`}
              onClick={() => handleMentorSelect(mentor)}
            >
              <h2 className="text-xl font-semibold text-gray-900">{mentor.name}</h2>
              <p className="text-gray-600 mt-1">{mentor.currentRole} at {mentor.company}</p>
              <p className="text-gray-700 mt-2">{mentor.bio}</p>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700">Expertise</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {mentor.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Availability and Booking Section */}
        {selectedMentor && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Book a Session with {selectedMentor.name}</h2>
            
            {/* Day Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Select Day</h3>
              <div className="flex space-x-2">
                {selectedMentor.availableSlots.map((daySchedule) => (
                  <button
                    key={daySchedule.day}
                    onClick={() => setSelectedDay(daySchedule.day)}
                    className={`px-4 py-2 rounded-md ${
                      selectedDay === daySchedule.day
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {daySchedule.day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            {selectedDay && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Select Time</h3>
                <div className="grid grid-cols-3 gap-2">
                  {selectedMentor.availableSlots
                    .find(d => d.day === selectedDay)
                    ?.timeSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-2 rounded-md text-sm ${
                          selectedTimeSlot === slot
                            ? 'bg-green-100 text-green-800 border-2 border-green-500'
                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={() => setShowRequestForm(true)}
              disabled={!selectedTimeSlot}
              className={`w-full py-2 px-4 rounded-md ${
                selectedTimeSlot
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Book Session
            </button>
          </div>
        )}
      </div>

      {/* Session Request Form Modal */}
      {showRequestForm && selectedMentor && selectedDay && selectedTimeSlot && (
        <SessionRequestForm
          mentorName={selectedMentor.name}
          selectedDay={selectedDay}
          selectedTimeSlot={selectedTimeSlot}
          onSubmit={handleBookSession}
          onCancel={() => setShowRequestForm(false)}
        />
      )}
    </div>
  );
};

export default MentorList; 
