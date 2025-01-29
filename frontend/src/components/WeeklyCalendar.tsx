import React, { useState, useEffect } from 'react';
import { mentorService } from '../services/api';
import { RiCloseLine, RiCalendarCheckLine, RiTimeLine, RiAlertLine } from 'react-icons/ri';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import Loader from './Loader';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface DateSchedule {
  date: string;
  timeSlots: TimeSlot[];
}

interface WeeklyCalendarProps {
  initialAvailability?: DateSchedule[];
  onAvailabilityChange?: (availability: DateSchedule[]) => void;
}

// For API compatibility
interface ApiDateSchedule {
  date: string;
  timeSlots: TimeSlot[];
}

const MAX_SLOTS_PER_DATE = 5;

// Generate hourly time slots from 12 PM to 12 AM
const generateTimeSlots = () => {
  const slots: TimeSlot[] = [];
  // Start from 12 PM (hour 12) to 11 PM (hour 23)
  for (let hour = 12; hour <= 23; hour++) {
    const startHour = hour.toString().padStart(2, '0');
    const endHour = (hour + 1).toString().padStart(2, '0');
    
    slots.push({
      startTime: `${startHour}:00`,
      endTime: `${hour === 23 ? '00' : endHour}:00`
    });
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ initialAvailability, onAvailabilityChange }) => {
  const [availability, setAvailability] = useState<DateSchedule[]>(initialAvailability || []);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (initialAvailability) {
      setAvailability(initialAvailability);
    }
  }, [initialAvailability]);

  // Reset selected slots when date changes
  useEffect(() => {
    if (selectedDate) {
      const dateSchedule = availability.find(d => d.date === selectedDate);
      setSelectedSlots(dateSchedule?.timeSlots || []);
    } else {
      setSelectedSlots([]);
    }
  }, [selectedDate, availability]);

  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    if (!selectedDate) return;

    setSelectedSlots(prev => {
      const slotIndex = prev.findIndex(
        slot => slot.startTime === timeSlot.startTime && slot.endTime === timeSlot.endTime
      );

      let newSelectedSlots: TimeSlot[];
      
      if (slotIndex === -1) {
        // Add new slot if under limit
        if (prev.length >= MAX_SLOTS_PER_DATE) {
          setError(`You can only select up to ${MAX_SLOTS_PER_DATE} time slots per date`);
          setTimeout(() => setError(''), 3000);
          return prev;
        }
        newSelectedSlots = [...prev, timeSlot].sort((a, b) => 
          a.startTime.localeCompare(b.startTime)
        );
      } else {
        // Remove slot
        newSelectedSlots = prev.filter((_, index) => index !== slotIndex);
      }

      // Update availability
      setAvailability(prevAvail => {
        const newAvailability = [...prevAvail];
        const dateIndex = newAvailability.findIndex(d => d.date === selectedDate);

        if (newSelectedSlots.length === 0) {
          // Remove date if no slots selected
          if (dateIndex !== -1) {
            newAvailability.splice(dateIndex, 1);
          }
        } else {
          const dateSchedule = {
            date: selectedDate,
            timeSlots: newSelectedSlots
          };

          if (dateIndex === -1) {
            // Add new date schedule
            newAvailability.push(dateSchedule);
          } else {
            // Update existing date schedule
            newAvailability[dateIndex] = dateSchedule;
          }
        }

        onAvailabilityChange?.(newAvailability);
        return newAvailability;
      });

      return newSelectedSlots;
    });
  };

  const saveAvailability = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      setSuccessMessage('');

      // Convert dates to ISO string format
      const apiAvailability: ApiDateSchedule[] = availability.map(schedule => {
        const dateObj = new Date(schedule.date);
        dateObj.setHours(0, 0, 0, 0);

        return {
          date: dateObj.toISOString(),
          timeSlots: schedule.timeSlots
        };
      });

      await mentorService.updateProfile({
        availableSlots: apiAvailability
      });

      setSuccessMessage('Your availability has been updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error saving availability:', err);
      setError(err.response?.data?.message || 'Failed to save availability');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSlotSelected = (timeSlot: TimeSlot) => {
    return selectedSlots.some(
      slot => slot.startTime === timeSlot.startTime && slot.endTime === timeSlot.endTime
    );
  };

  const getRemainingSlots = () => {
    return MAX_SLOTS_PER_DATE - selectedSlots.length;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-start space-x-3">
          <RiAlertLine className="text-xl text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={() => setError('')}
            className="text-red-600 hover:text-red-800"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 rounded-xl flex items-start space-x-3">
          <RiCalendarCheckLine className="text-xl text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-800 font-medium">Success</p>
            <p className="text-green-600 text-sm mt-1">{successMessage}</p>
          </div>
          <button 
            onClick={() => setSuccessMessage('')}
            className="text-green-600 hover:text-green-800"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>
      )}

      {/* Date Selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Select Date</h3>
            <p className="text-sm text-gray-500 mt-1">Choose a date to set your availability</p>
          </div>
          {selectedDate && (
            <span className="text-sm font-medium text-indigo-600">
              {formatDate(selectedDate)}
            </span>
          )}
        </div>
        <input
          type="date"
          min={minDate}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
        />
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Available Time Slots</h3>
              <p className="text-sm text-gray-500 mt-1">Select up to {MAX_SLOTS_PER_DATE} slots</p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
              {getRemainingSlots()} slots remaining
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {TIME_SLOTS.map((timeSlot, index) => (
              <button
                key={index}
                onClick={() => handleTimeSlotClick(timeSlot)}
                disabled={!isSlotSelected(timeSlot) && getRemainingSlots() === 0}
                className={`
                  relative p-4 rounded-xl text-sm font-medium transition-all duration-200
                  ${isSlotSelected(timeSlot)
                    ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-500 shadow-sm'
                    : getRemainingSlots() === 0
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600'
                  }
                `}
              >
                <div className="flex items-center justify-center space-x-2">
                  <RiTimeLine className={isSlotSelected(timeSlot) ? 'text-indigo-600' : 'text-gray-400'} />
                  <span>{timeSlot.startTime} - {timeSlot.endTime}</span>
                </div>
                {isSlotSelected(timeSlot) && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                    <RiCloseLine className="text-white text-sm" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Slots Summary */}
      {selectedDate && selectedSlots.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Time Slots</h3>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="space-y-2">
              {selectedSlots.map((slot, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-50 rounded-md">
                      <RiTimeLine className="text-indigo-600" />
                    </div>
                    <span className="text-gray-700">{slot.startTime} - {slot.endTime}</span>
                  </div>
                  <button
                    onClick={() => handleTimeSlotClick(slot)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <RiCloseLine className="text-xl" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveAvailability}
          disabled={isSubmitting || availability.length === 0}
          className={`
            px-6 py-3 rounded-xl font-medium flex items-center space-x-2
            ${isSubmitting || availability.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md'
            }
            transition-all duration-200
          `}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <>
              <RiCalendarCheckLine className="text-xl" />
              <span>Save Availability</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WeeklyCalendar; 