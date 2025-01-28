import React from 'react';
import { RiRobot2Line } from 'react-icons/ri';

const ChatbotIcon: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg flex items-center space-x-2 group transition-all duration-300 hover:pr-6"
      >
        <RiRobot2Line className="text-2xl" />
        <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap text-sm font-medium transition-opacity duration-300">
          AI Assistant
        </span>
      </button>
    </div>
  );
};

export default ChatbotIcon; 