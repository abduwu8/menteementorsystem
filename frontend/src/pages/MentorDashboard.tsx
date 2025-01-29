import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/api/dashboardService';
import {
  RiCalendarEventLine,
  RiArrowRightLine,
  RiCalendarCheckLine,
  RiSettings4Line,
  RiUserLine
} from 'react-icons/ri';
import AIChatPopup from '../components/AIChatPopup';

interface Session {
  _id: string;
  mentee: {
    _id: string;
    name: string;
    email: string;
    currentRole: string;
  };
  mentor: {
    _id: string;
    name: string;
    email: string;
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

const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingSession, setCompletingSession] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const sessions = await dashboardService.getUpcomingSessions();
      setUpcomingSessions(sessions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      setCompletingSession(sessionId);
      setError(null);
      console.log('Attempting to complete session:', sessionId);
      
      await dashboardService.completeSession(sessionId);
      console.log('Session completed successfully');
      
      // Remove the completed session from the list
      setUpcomingSessions(prev => prev.filter(session => session._id !== sessionId));
      
    } catch (err: any) {
      console.error('Error completing session:', err);
      // Show error message to user
      setError(err.message || 'Failed to complete session. Please try again.');
      
      // Refresh the sessions list to ensure UI is in sync with backend
      await fetchDashboardData();
    } finally {
      setCompletingSession(null);
    }
  };

  const quickActions = [
    {
      title: 'Set Availability',
      description: 'Manage your available time slots',
      icon: RiCalendarCheckLine,
      path: '/set-availability',
      color: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      hoverColor: 'hover:bg-indigo-100'
    },
    {
      title: 'Update Profile',
      description: 'Keep your profile information current',
      icon: RiSettings4Line,
      path: '/mentor-profile',
      color: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      hoverColor: 'hover:bg-emerald-100'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-red-500 text-center mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 p-6 w-full">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-600">
              Track your mentoring impact and manage upcoming sessions from your personalized dashboard.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Upcoming Sessions</h2>
                <p className="text-sm text-gray-500 mt-1">Your scheduled mentoring sessions</p>
              </div>
            </div>
            <div className="space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <RiCalendarEventLine className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-500">No upcoming sessions scheduled</p>
                  <button
                    onClick={() => navigate('/set-availability')}
                    className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                  >
                    Set your availability →
                  </button>
                </div>
              ) : (
                upcomingSessions
                  .filter(session => session && session.mentee)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((session) => (
                    <div 
                      key={session._id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <RiUserLine className="text-xl text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {session.mentee?.name || 'Unknown Mentee'}
                          </h3>
                          <p className="text-sm text-gray-600">{session.topic || 'No Topic'}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {session.mentee?.currentRole || 'Role not specified'}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">
                              {new Date(session.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">
                              {session.timeSlot?.startTime || '--:--'} - {session.timeSlot?.endTime || '--:--'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          session.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : session.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                        {session.status === 'approved' && (
                          <button
                            onClick={() => handleCompleteSession(session._id)}
                            disabled={completingSession === session._id}
                            className={`px-3 py-1 text-xs rounded-lg font-medium 
                              ${completingSession === session._id
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                              } transition-colors duration-200 flex items-center space-x-1`}
                          >
                            {completingSession === session._id ? (
                              <>
                                <span>Completing...</span>
                                <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                              </>
                            ) : (
                              <span>Complete</span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Quick Actions</h2>
            <p className="text-sm text-gray-500 mb-6">Manage your mentoring activities</p>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className={`w-full p-4 ${action.color} ${action.textColor} rounded-xl ${action.hoverColor} transition-colors duration-200 text-left group`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <action.icon className="text-2xl" />
                      <div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm opacity-75">{action.description}</p>
                      </div>
                    </div>
                    <RiArrowRightLine className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AIChatPopup />
    </div>
  );
}

export { MentorDashboard };
export default MentorDashboard; 