interface MenteeCardProps {
  mentee: {
    id: string;
    name: string;
    interests: string[];
    goals: string;
    currentRole: string;
    imageUrl?: string;
  };
  onAccept?: (menteeId: string) => void;
}

const MenteeCard = ({ mentee, onAccept }: MenteeCardProps): JSX.Element => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
          {mentee.imageUrl ? (
            <img src={mentee.imageUrl} alt={mentee.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xl font-bold">
              {mentee.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold">{mentee.name}</h3>
          <p className="text-gray-600">{mentee.currentRole}</p>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Interests</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {mentee.interests.map((interest, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
            >
              {interest}
            </span>
          ))}
        </div>
        <h4 className="font-semibold mb-2">Goals</h4>
        <p className="text-gray-700">{mentee.goals}</p>
      </div>
      {onAccept && (
        <button
          onClick={() => onAccept(mentee.id)}
          className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Accept Mentee
        </button>
      )}
    </div>
  );
};

export default MenteeCard; 