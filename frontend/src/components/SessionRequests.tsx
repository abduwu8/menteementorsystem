import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../services/api/sessionService';
import { useAuth } from '../context/AuthContext';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface Mentee {
  _id: string;
  name: string;
  email: string;
  currentRole: string;
}

interface SessionRequest {
  _id: string;
  mentee: Mentee;
  date: string;
  timeSlot: TimeSlot;
  topic: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const SessionRequests = (): JSX.Element => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRequests();
  }, [user, navigate]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await sessionService.getSessionRequests();
      
      if (!Array.isArray(data)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

      // Filter out any invalid data
      const validRequests = data.filter((request): request is SessionRequest => {
        return Boolean(
          request &&
          request._id &&
          request.mentee &&
          request.mentee.name &&
          request.date &&
          request.timeSlot &&
          request.timeSlot.startTime &&
          request.timeSlot.endTime
        );
      });

      setRequests(validRequests);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      const errorMessage = err.message || 'Failed to fetch session requests';
      setError(errorMessage);
      
      if (err.response?.status === 401) {
        navigate('/login');
      }
      
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      setError('');
      setIsUpdating(requestId);
      console.log(`Attempting to ${status} session request:`, requestId);
      
      await sessionService.handleSessionRequest(requestId, status);
      
      // Remove the request from the list since it's no longer pending
      setRequests(prevRequests => prevRequests.filter(req => req._id !== requestId));

      // Show success message
      setSuccessMessage(`Session request ${status} successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err: any) {
      console.error('Error handling request:', err);
      
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      
      setError(err.message || `Failed to ${status} request`);
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>{error}</p>
        <button 
          onClick={() => fetchRequests()} 
          className="mt-4 text-indigo-600 hover:text-indigo-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-gray-500 text-center p-4">
        <p>No pending session requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-4">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      {requests.map((request) => (
        <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{request.mentee.name}</h3>
              <p className="text-gray-600">{request.mentee.currentRole}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500">
                {new Date(request.createdAt).toLocaleDateString()}
              </span>
              <span className="text-sm font-medium text-yellow-600">
                Pending
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Session Details</h4>
            <p className="text-gray-700">
              Date: {new Date(request.date).toLocaleDateString()}
            </p>
            <p className="text-gray-700">
              Time: {request.timeSlot.startTime} - {request.timeSlot.endTime}
            </p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Topic</h4>
            <p className="text-gray-700">{request.topic}</p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-gray-700">{request.description}</p>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => handleRequest(request._id, 'rejected')}
              disabled={isUpdating === request._id}
              className={`px-4 py-2 text-red-600 hover:text-red-800 border border-red-600 rounded-md hover:bg-red-50 
                ${isUpdating === request._id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUpdating === request._id ? 'Processing...' : 'Reject'}
            </button>
            <button
              onClick={() => handleRequest(request._id, 'approved')}
              disabled={isUpdating === request._id}
              className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700
                ${isUpdating === request._id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUpdating === request._id ? 'Processing...' : 'Accept'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionRequests; 