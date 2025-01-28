import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = (): JSX.Element => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
              Mentor Portal
            </Link>
            {user && (
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <Link
                    to={user.role === 'mentor' ? '/mentor-dashboard' : '/mentee-dashboard'}
                    className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  {user.role === 'mentee' && (
                    <>
                      <Link
                        to="/mentors"
                        className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Find Mentors
                      </Link>
                      <Link
                        to="/request-lecture"
                        className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Request Lecture
                      </Link>
                    </>
                  )}
                  <Link
                    to="/lecture-requests"
                    className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {user.role === 'mentor' ? 'Lecture Requests' : 'My Requests'}
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-white text-sm">{user.name}</span>
                <button
                  onClick={logout}
                  className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-indigo-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {user && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to={user.role === 'mentor' ? '/mentor-dashboard' : '/mentee-dashboard'}
              className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
            >
              Dashboard
            </Link>
            {user.role === 'mentee' && (
              <>
                <Link
                  to="/mentors"
                  className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Find Mentors
                </Link>
                <Link
                  to="/request-lecture"
                  className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Request Lecture
                </Link>
              </>
            )}
            <Link
              to="/lecture-requests"
              className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
            >
              {user.role === 'mentor' ? 'Lecture Requests' : 'My Requests'}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 