import { useState, useEffect } from 'react';
import { sessionService } from '../services/api';
import Loader from './Loader';

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
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
      // Remove the request from the list if rejected, or update status if approved
      setRequests(requests.map(req => 
        req._id === requestId 
          ? { ...req, status } 
          : req
      ).filter(req => req.status !== 'rejected'));
    } catch (err: any) {
      setError(err.message || `Failed to ${status} request`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>{error}</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-gray-500 text-center p-4">
        <p>No pending session requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{request.mentee.name}</h3>
              <p className="text-gray-600">{request.mentee.currentRole}</p>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(request.createdAt).toLocaleDateString()}
            </span>
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
          
          {request.status === 'approved' && (
            <div className="text-green-600 font-semibold text-right">
              Approved
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SessionRequests; 