import WeeklyCalendar from '../../components/WeeklyCalendar';
import { RiCalendarLine, RiTimeLine, RiInformationLine } from 'react-icons/ri';

const WeeklyAvailabilityPage = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <RiCalendarLine className="text-2xl text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Set Your Weekly Availability</h1>
              <p className="text-gray-600 mt-1">Manage your mentoring schedule and time slots</p>
            </div>
          </div>
          
          {/* Quick Tips */}
          <div className="mt-6 bg-blue-50 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <RiInformationLine className="text-xl text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800 mb-2">Quick Tips</h3>
                <ul className="text-blue-700 space-y-2 text-sm">
                  <li className="flex items-center">
                    <RiTimeLine className="mr-2" />
                    Sessions are scheduled in 1-hour blocks between 12 PM to 12 AM
                  </li>
                  <li>• You can select up to 5 time slots per day</li>
                  <li>• Mentees will only be able to request sessions during your available times</li>
                  <li>• You can update your availability at any time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <WeeklyCalendar />
      </div>
    </div>
  );
};

export default WeeklyAvailabilityPage; 