import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionService } from '../services/api';
import AIChatPopup from '../components/AIChatPopup';
import { RiCalendarEventLine } from 'react-icons/ri';

interface Session {
  _id: string;
  mentor: {
    _id: string;
    name: string;
    email: string;
    currentRole: string;
    expertise?: string[];
  };
  date: string;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  topic: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const MenteeDashboard = (): JSX.Element => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await sessionService.getMySessions();
      console.log('Fetched sessions:', JSON.stringify(data, null, 2));
      setSessions(data || []);
    } catch (err: any) {
      console.error('Error fetching sessions:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || err.message || 'Failed to fetch sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    // Add confirmation dialog
    const confirmed = window.confirm('Are you sure you want to cancel this session?');
    if (!confirmed) return;

    try {
      setError('');
      console.log('Attempting to cancel session:', sessionId);
      await sessionService.completeSession(sessionId);
      console.log('Session cancelled successfully');
      // Refresh sessions after cancellation
      await fetchSessions();
    } catch (err: any) {
      console.error('Error cancelling session:', err);
      setError(err.response?.data?.message || err.message || 'Failed to cancel session');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Filter sessions by status
  const upcomingSessions = sessions.filter(session => session.status === 'approved' && new Date(session.date) >= new Date());
  const pendingSessions = sessions.filter(session => session.status === 'pending');
  const pastSessions = sessions.filter(session => session.status === 'approved' && new Date(session.date) < new Date());
  const rejectedSessions = sessions.filter(session => session.status === 'rejected');

  const renderSessionCard = (session: Session, showCancelButton: boolean = true) => (
    <div key={session._id} className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Session with {session.mentor.name}</h3>
          <div>
            <p className="text-gray-600 font-medium">{session.topic}</p>
            <p className="text-sm text-gray-500">Mentor: {session.mentor.currentRole} at {session.mentor.email}</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="font-medium text-indigo-600">
            {new Date(session.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="text-gray-600 font-medium">
            {session.timeSlot.startTime} - {session.timeSlot.endTime}
          </p>
          <p className="text-xs text-gray-500">
            Created: {new Date(session.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Session Description:</h4>
        <p className="text-gray-700">{session.description}</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </span>
          {session.status === 'approved' && (
            <span className="text-sm text-gray-500">
              Last updated: {new Date(session.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        {showCancelButton && session.status !== 'rejected' && (
          <button
            onClick={() => handleCancelSession(session._id)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
          >
            {session.status === 'pending' ? 'Cancel Request' : 'Cancel Session'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mentee Dashboard</h1>
        <div className="space-x-4">
          <Link
            to="/find-mentors"
            className="px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
          >
            Find Mentors
          </Link>
          <Link
            to="/mentee-sessions"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Request New Session
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map(session => renderSessionCard(session))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <RiCalendarEventLine className="mx-auto text-4xl text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Sessions</h3>
              <p className="text-gray-600 mb-4">You don't have any sessions scheduled. Find a mentor and book your first session!</p>
              <div className="flex justify-center space-x-4">
                {/* <Link
                  to="/find-mentors"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Find a Mentor
                </Link>
                <Link
                  to="/mentee-sessions"
                  className="px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                >
                  Request Session
                </Link> */}
              </div>
            </div>
          )}
        </section>

        {pendingSessions.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Pending Session Requests</h2>
            <div className="space-y-4">
              {pendingSessions.map(session => renderSessionCard(session))}
            </div>
          </section>
        )}

        {rejectedSessions.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Rejected Requests</h2>
            <div className="space-y-4">
              {rejectedSessions.map(session => renderSessionCard(session, false))}
            </div>
          </section>
        )}

        {pastSessions.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Past Sessions</h2>
            <div className="space-y-4">
              {pastSessions.map(session => renderSessionCard(session, false))}
            </div>
          </section>
        )}

        {sessions.length === 0 && (
          <div className="text-center py-8">
          </div>
        )}
      </div>

      <AIChatPopup />
    </div>
  );
};

export default MenteeDashboard; 