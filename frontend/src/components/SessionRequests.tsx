import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface SessionRequest {
  _id: string;
  mentee: {
    name: string;
    email: string;
    currentRole: string;
  };
  date: string;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
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

  useEffect(() => {
    // Check if user is a mentor
    if (!user || user.role !== 'mentor') {
      console.log('Unauthorized access attempt:', { userRole: user?.role });
      navigate('/mentee-dashboard'); // Redirect mentees to their dashboard
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

      setRequests(data);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      const errorMessage = err.message || 'Failed to fetch session requests';
      setError(errorMessage);
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 403) {
        navigate('/mentee-dashboard'); // Redirect on permission error
      }
      
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      // Verify user is a mentor before proceeding
      if (!user || user.role !== 'mentor') {
        throw new Error('Only mentors can approve or reject session requests');
      }

      setError(''); // Clear any previous errors
      setIsUpdating(requestId); // Show loading state for this request
      console.log(`Attempting to ${status} session request:`, requestId);
      
      const updatedRequest = await sessionService.handleSessionRequest(requestId, status);
      console.log('Request updated successfully:', updatedRequest);
      
      // Update the UI with the returned data
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req._id === requestId 
            ? { ...req, ...updatedRequest }
            : req
        )
      );

      // Refresh the data immediately
      await fetchRequests();

      // Show success message
      console.log(`Session request ${status} successfully`);
      
    } catch (err: any) {
      console.error('Error handling request:', err);
      
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      } else if (err.response?.status === 403) {
        navigate('/mentee-dashboard'); // Redirect on permission error
        return;
      }
      
      setError(err.message || `Failed to ${status} request`);
    } finally {
      setIsUpdating(null); // Clear loading state
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
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      {requests.map((request) => {
        // Skip rendering if essential data is missing
        if (!request || !request.mentee) {
          return null;
        }

        return (
          <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{request.mentee?.name || 'Unknown Mentee'}</h3>
                <p className="text-gray-600">{request.mentee?.currentRole || 'Role not specified'}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>
                <span className={`text-sm font-medium mt-1 ${
                  request.status === 'approved' ? 'text-green-600' :
                  request.status === 'rejected' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Session Details</h4>
              <p className="text-gray-700">
                Date: {request.date ? new Date(request.date).toLocaleDateString() : 'Date not specified'}
              </p>
              <p className="text-gray-700">
                Time: {request.timeSlot?.startTime || '--:--'} - {request.timeSlot?.endTime || '--:--'}
              </p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Topic</h4>
              <p className="text-gray-700">{request.topic || 'No topic specified'}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700">{request.description || 'No description provided'}</p>
            </div>
            
            {request.status === 'pending' && (
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
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SessionRequests; 