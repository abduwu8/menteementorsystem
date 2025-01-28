import { useState } from 'react';

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  isAvailable: boolean;
}

interface SessionSchedulerProps {
  availableSlots: TimeSlot[];
  onSchedule: (slotId: string) => void;
}

const SessionScheduler = ({ availableSlots, onSchedule }: SessionSchedulerProps): JSX.Element => {
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  const handleSchedule = () => {
    if (selectedSlot) {
      onSchedule(selectedSlot);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Schedule a Session</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {availableSlots.map((slot) => (
          <div
            key={slot.id}
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedSlot === slot.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => setSelectedSlot(slot.id)}
          >
            <p className="font-medium">{slot.date}</p>
            <p className="text-gray-600">{slot.time}</p>
          </div>
        ))}
      </div>
      <button
        onClick={handleSchedule}
        disabled={!selectedSlot}
        className={`w-full py-2 px-4 rounded-md ${
          selectedSlot
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
            : 'bg-gray-300 cursor-not-allowed text-gray-500'
        }`}
      >
        Schedule Session
      </button>
    </div>
  );
};

export default SessionScheduler; 