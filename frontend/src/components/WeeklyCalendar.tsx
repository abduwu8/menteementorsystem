import React, { useState, useEffect } from 'react';
import { mentorService } from '../services/api';
import { RiCloseLine, RiCalendarCheckLine, RiTimeLine, RiAlertLine } from 'react-icons/ri';

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
const DAYS_TO_SHOW = 14; // Show next 14 days

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
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Generate array of next DAYS_TO_SHOW days
  const generateDateOptions = () => {
    const dates: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= DAYS_TO_SHOW; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const dateOptions = generateDateOptions();

  useEffect(() => {
    if (initialAvailability) {
      setAvailability(initialAvailability);
    }
  }, [initialAvailability]);

  const handleDateSelect = (date: string) => {
    setSelectedDates(prev => {
      const isSelected = prev.includes(date);
      if (isSelected) {
        return prev.filter(d => d !== date);
      } else {
        return [...prev, date];
      }
    });
  };

  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
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

      // Update availability for all selected dates
      setAvailability(prevAvail => {
        const newAvailability = [...prevAvail];
        
        selectedDates.forEach(date => {
          const dateIndex = newAvailability.findIndex(d => d.date === date);

          if (newSelectedSlots.length === 0) {
            // Remove date if no slots selected
            if (dateIndex !== -1) {
              newAvailability.splice(dateIndex, 1);
            }
          } else {
            const dateSchedule = {
              date,
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
        });

        onAvailabilityChange?.(newAvailability);
        return newAvailability;
      });

      return newSelectedSlots;
    });
  };

  const saveAvailability = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const isSlotSelected = (timeSlot: TimeSlot) => {
    return selectedSlots.some(
      slot => slot.startTime === timeSlot.startTime && slot.endTime === timeSlot.endTime
    );
  };

  const getExistingTimeSlotsForDate = (date: string) => {
    const dateSchedule = availability.find(schedule => schedule.date === date);
    return dateSchedule?.timeSlots || [];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Set Your Weekly Availability</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <RiAlertLine className="mr-2" />
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
          <RiCalendarCheckLine className="mr-2" />
          {successMessage}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Select Days</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {dateOptions.map(date => (
            <button
              key={date}
              onClick={() => handleDateSelect(date)}
              className={`p-3 rounded-lg text-sm ${
                selectedDates.includes(date)
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {formatDate(date)}
            </button>
          ))}
        </div>
      </div>

      {selectedDates.length > 0 && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Select Time Slots</h3>
            <p className="text-sm text-gray-600 mb-3">
              These time slots will be applied to all selected days.
              You can select up to {MAX_SLOTS_PER_DATE} slots per day.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeSlotClick(slot)}
                  className={`p-3 rounded-lg text-sm flex items-center justify-center ${
                    isSlotSelected(slot)
                      ? 'bg-green-100 text-green-700 border-2 border-green-500'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <RiTimeLine className="mr-2" />
                  {slot.startTime} - {slot.endTime}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveAvailability}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg text-white ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isLoading ? 'Saving...' : 'Save Availability'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WeeklyCalendar; 