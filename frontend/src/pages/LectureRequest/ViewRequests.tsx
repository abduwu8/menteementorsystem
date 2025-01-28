import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Divider,
  Stack
} from '@mui/material';
import { format } from 'date-fns';
import { lectureService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface LectureRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  subject: string;
  description: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const ViewRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LectureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await lectureService.getLectureRequests();
        setRequests(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch lecture requests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleUpdateStatus = async (requestId: string, status: string) => {
    try {
      await lectureService.updateLectureRequest(requestId, status);
      // Refresh the requests list
      const updatedData = await lectureService.getLectureRequests();
      setRequests(updatedData);
    } catch (err: any) {
      setError(err.message || 'Failed to update request status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Lecture Requests</h1>
      
      <div className="grid gap-6">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">{request.subject}</h2>
                <p className="text-gray-600 mb-4">{request.description}</p>
                <p className="text-sm text-gray-500">
                  Scheduled for: {new Date(request.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {user?.role === 'mentor' && request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'accepted')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'rejected')}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </>
                )}
                {request.status !== 'pending' && (
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    request.status === 'accepted' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No lecture requests found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewRequests; 