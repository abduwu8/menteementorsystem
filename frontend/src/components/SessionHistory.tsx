interface Session {
  _id: string;
  mentor: {
    name: string;
    expertise: string[];
  };
  date: string;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  topic: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
}

interface SessionHistoryProps {
  sessions: Session[];
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions }) => {
  // Filter for past sessions only
  const pastSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessionDate < today;
  });

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

  if (pastSessions.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Session History</h2>
      <div className="space-y-4">
        {pastSessions.map((session) => (
          <div key={session._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Session with {session.mentor.name}</h3>
                <p className="text-gray-600">{session.topic}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{new Date(session.date).toLocaleDateString()}</p>
                <p className="text-gray-600">
                  {session.timeSlot.startTime} - {session.timeSlot.endTime}
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{session.description}</p>
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(session.status)}`}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SessionHistory; 