import React, { useState } from 'react';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface SessionRequestFormProps {
  mentorName: string;
  selectedDay: string;
  selectedTimeSlot: TimeSlot;
  onSubmit: (data: { topic: string; description: string }) => void;
  onCancel: () => void;
}

const SessionRequestForm: React.FC<SessionRequestFormProps> = ({
  mentorName,
  selectedDay,
  selectedTimeSlot,
  onSubmit,
  onCancel
}) => {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ topic, description });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Request Session</h2>
        
        <div className="mb-6">
          <p className="text-gray-600">
            Session with <span className="font-semibold">{mentorName}</span>
          </p>
          <p className="text-gray-600">
            {selectedDay}, {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g., React Development, Career Guidance"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows={4}
              placeholder="Describe what you'd like to discuss in this session..."
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Request Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionRequestForm; 