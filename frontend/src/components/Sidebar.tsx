import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  RiDashboardLine,
  RiUserSettingsLine,
  RiCalendarEventLine,
  RiTeamLine,
  RiTimeLine,
  RiLogoutBoxLine,
  RiRobot2Line
} from 'react-icons/ri';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const mentorLinks = [
    { to: '/mentor-dashboard', icon: RiDashboardLine, text: 'Dashboard' },
    { to: '/mentor-profile', icon: RiUserSettingsLine, text: 'Profile' },
    { to: '/mentor-sessions', icon: RiCalendarEventLine, text: 'Sessions' },
    { to: '/set-availability', icon: RiTimeLine, text: 'Set Availability' },
    { to: '/ai-chat', icon: RiRobot2Line, text: 'AI Assistant' },
  ];

  const menteeLinks = [
    { to: '/mentee-dashboard', icon: RiDashboardLine, text: 'Dashboard' },
    { to: '/mentee-profile', icon: RiUserSettingsLine, text: 'Profile' },
    { to: '/find-mentors', icon: RiTeamLine, text: 'Find Mentors' },
    { to: '/mentee-sessions', icon: RiCalendarEventLine, text: 'Sessions' },
    { to: '/ai-chat', icon: RiRobot2Line, text: 'AI Assistant' },
  ];

  const links = user?.role === 'mentor' ? mentorLinks : menteeLinks;

  return (
    <div className="h-screen w-64 bg-black text-white fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-8">OviEdu</h1>
        
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive(link.to)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="text-xl" />
                <span>{link.text}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-6">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200"
          >
            <RiLogoutBoxLine className="text-xl" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 