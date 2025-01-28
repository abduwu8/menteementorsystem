import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Container, MenuItem, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { mentorService, lectureService } from '../../services/api';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Mentor {
  _id: string;
  name: string;
  expertise: string[];
}

const RequestLecture = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    mentorId: '',
    subject: '',
    description: '',
    date: ''
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setIsLoading(true);
        const data = await mentorService.getAllMentors();
        setMentors(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch mentors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await lectureService.createLectureRequest(formData);
      navigate('/lecture-requests');
    } catch (err: any) {
      setError(err.message || 'Failed to create lecture request');
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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Request a Lecture</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Select Mentor</label>
          <select
            className="w-full p-2 border rounded-md"
            value={formData.mentorId}
            onChange={(e) => setFormData({ ...formData, mentorId: e.target.value })}
            required
          >
            <option value="">Select a mentor</option>
            {mentors.map((mentor) => (
              <option key={mentor._id} value={mentor._id}>
                {mentor.name} - {mentor.expertise.join(', ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Subject</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            className="w-full p-2 border rounded-md"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Preferred Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded-md"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {isLoading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default RequestLecture; 