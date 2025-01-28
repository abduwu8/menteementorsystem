import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiRobot2Line, RiCloseLine } from 'react-icons/ri';

const AIChatPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial popup after 10-20 seconds
    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
      // Hide after 8 seconds if not interacted
      setTimeout(() => {
        setIsVisible(false);
        // Start recurring popups
        startRecurringPopups();
      }, 8000);
    }, Math.random() * (20000 - 10000) + 10000);

    const startRecurringPopups = () => {
      // Show popup every 45-90 seconds
      const interval = setInterval(() => {
        const shouldShow = Math.random() < 0.85; // 85% chance to show
        if (shouldShow) {
          setIsVisible(true);
          // Hide after 8 seconds if not interacted
          setTimeout(() => {
            setIsVisible(false);
          }, 8000);
        }
      }, Math.random() * (90000 - 45000) + 45000);

      return interval;
    };

    return () => {
      clearTimeout(initialTimeout);
    };
  }, []);

  const handleClick = () => {
    setIsVisible(false);
    navigate('/ai-chat');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-4 max-w-sm border border-indigo-100">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <RiCloseLine className="text-xl" />
        </button>
        
        <div className="flex items-start space-x-4">
          <div className="bg-indigo-100 p-3 rounded-full">
            <RiRobot2Line className="text-2xl text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Need Help? Ask Our AI Assistant!
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Get instant answers to your questions about mentoring and education.
            </p>
            <button
              onClick={handleClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 w-full"
            >
              Chat with AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPopup; 