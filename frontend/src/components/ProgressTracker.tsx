interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface ProgressTrackerProps {
  goals: Goal[];
}

const ProgressTracker = ({ goals }: ProgressTrackerProps): JSX.Element => {
  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Progress Tracker</h3>
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{goal.title}</h4>
                <p className="text-gray-600 text-sm">{goal.description}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(goal.status)}`}>
                {goal.status.replace('-', ' ')}
              </span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium">{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 rounded-full h-2"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker; 