interface MentorCardProps {
  mentor: {
    id: string;
    name: string;
    expertise: string[];
    yearsOfExperience: number;
    bio: string;
    imageUrl?: string;
  };
  onConnect?: (mentorId: string) => void;
}

const MentorCard = ({ mentor, onConnect }: MentorCardProps): JSX.Element => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
          {mentor.imageUrl ? (
            <img src={mentor.imageUrl} alt={mentor.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xl font-bold">
              {mentor.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold">{mentor.name}</h3>
          <p className="text-gray-600">{mentor.yearsOfExperience} years of experience</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {mentor.expertise.map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
        <p className="text-gray-700">{mentor.bio}</p>
      </div>
      {onConnect && (
        <button
          onClick={() => onConnect(mentor.id)}
          className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Connect
        </button>
      )}
    </div>
  );
};

export default MentorCard; 