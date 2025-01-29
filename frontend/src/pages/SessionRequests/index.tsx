import { useState, useEffect } from 'react';
import { sessionService } from '../../services/api';

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
}

const SessionRequestsPage = (): JSX.Element => {
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await sessionService.getSessionRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch session requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await sessionService.handleSessionRequest(requestId, status);
      setSuccessMessage(`Session request ${status} successfully`);
      // Update the requests list
      setRequests(requests.map(req => 
        req._id === requestId 
          ? { ...req, status } 
          : req
      ));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || `Failed to ${status} request`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Session Requests</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-gray-500 text-center p-8">
          No pending session requests
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{request.mentee.name}</h3>
                  <p className="text-gray-600">{request.mentee.currentRole}</p>
                  <p className="text-gray-600">{request.mentee.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{new Date(request.date).toLocaleDateString()}</p>
                  <p className="text-gray-600">
                    {request.timeSlot.startTime} - {request.timeSlot.endTime}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Topic</h4>
                <p className="text-gray-700">{request.topic}</p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700">{request.description}</p>
              </div>

              {request.status === 'pending' && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => handleRequest(request._id, 'rejected')}
                    className="px-4 py-2 text-red-600 hover:text-red-800"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleRequest(request._id, 'approved')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Accept
                  </button>
                </div>
              )}

              {request.status !== 'pending' && (
                <div className={`text-right font-semibold ${
                  request.status === 'approved' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionRequestsPage; 