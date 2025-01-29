import { useState, useEffect } from 'react';
import { sessionService, mentorService } from '../services/api';
import Toast from './Toast';

interface SessionBookingProps {
  mentorId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface MentorAvailability {
  date: Date;
  timeSlots: TimeSlot[];
}

interface MentorData {
  availableSlots?: MentorAvailability[];
}

interface BookedSlot {
  startTime: string;
  endTime: string;
}

const SessionBooking = ({ mentorId, onClose, onSuccess }: SessionBookingProps): JSX.Element => {
  const [date, setDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Fetch available time slots when date changes
  useEffect(() => {
    if (date) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedTimeSlot(null);
    }
  }, [date]);

  const fetchAvailableSlots = async () => {
    try {
      setIsFetchingSlots(true);
      setError('');
      
      // Get mentor's availability schedule
      const mentorData: MentorData = await mentorService.getMentorById(mentorId);
      console.log('Mentor data:', mentorData);
      
      if (!mentorData.availableSlots || mentorData.availableSlots.length === 0) {
        console.log('No available slots found');
        setAvailableSlots([]);
        return;
      }

      // Convert selected date to Date object for comparison
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      // Find available slots for this date
      const dateSchedule = mentorData.availableSlots.find(slot => {
        const slotDate = new Date(slot.date);
        slotDate.setHours(0, 0, 0, 0);
        
        console.log('Comparing dates:', {
          slotDate: slotDate.toISOString(),
          selectedDate: selectedDate.toISOString(),
          matches: slotDate.getTime() === selectedDate.getTime()
        });
        
        return slotDate.getTime() === selectedDate.getTime();
      });
      
      console.log('Found schedule:', dateSchedule);
      
      if (!dateSchedule || !dateSchedule.timeSlots.length) {
        console.log('No time slots found for the date');
        setAvailableSlots([]);
        return;
      }

      // Get already booked slots
      const bookedSlots: BookedSlot[] = await sessionService.getBookedSlots(mentorId, date);
      console.log('Booked slots:', bookedSlots);
      
      // Filter out booked slots
      const availableTimeSlots = dateSchedule.timeSlots.filter(
        (slot: TimeSlot) => 
          !bookedSlots.some(
            (bookedSlot: BookedSlot) => 
              bookedSlot.startTime === slot.startTime && 
              bookedSlot.endTime === slot.endTime
          )
      );

      console.log('Available time slots:', availableTimeSlots);
      setAvailableSlots(availableTimeSlots);
    } catch (err: any) {
      console.error('Error fetching available slots:', err);
      setError('Failed to fetch available time slots');
    } finally {
      setIsFetchingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTimeSlot) return;

    setError('');
    setIsLoading(true);

    try {
      await sessionService.requestSession({
        mentorId,
        date,
        timeSlot: selectedTimeSlot,
        topic,
        description
      });
      setShowToast(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Session booking error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to request session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Book a Session</h3>
        
        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Date
            </label>
            <input
              type="date"
              min={minDate}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSelectedTimeSlot(null);
              }}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Loading State for Time Slots */}
          {isFetchingSlots && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {/* Time Slot Selection */}
          {date && !isFetchingSlots && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Time Slots
              </label>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`p-2 text-sm rounded-md ${
                        selectedTimeSlot === slot
                          ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-500'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {slot.startTime} - {slot.endTime}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-yellow-600 text-sm">
                  No available time slots for this date. Please select another date.
                </p>
              )}
            </div>
          )}

          {/* Session Details */}
          {selectedTimeSlot && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  placeholder="e.g., React Hooks, Career Advice"
                  className="w-full p-2 border rounded-md"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Describe what you'd like to discuss in this session..."
                  className="w-full p-2 border rounded-md h-32"
                  maxLength={1000}
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedTimeSlot}
              className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400`}
            >
              {isLoading ? 'Requesting...' : 'Request Session'}
            </button>
          </div>
        </form>
      </div>

      {showToast && (
        <Toast
          message="Session request sent successfully!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default SessionBooking; 