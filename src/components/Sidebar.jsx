import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="flex">
      <div className="flex flex-col h-screen p-3 bg-white shadow w-60">
        <div className="space-y-3">
          <div className="flex items-center">
            <h2 className="text-xl font-bold">Dashboard</h2>
          </div>
          <div className="flex-1">
            <ul className="pt-2 pb-4 space-y-1 text-sm">
              <li className="rounded-sm">
                <Link
                  to="/mentor/dashboard"
                  className="flex items-center p-2 space-x-3 rounded-md"
                >
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="rounded-sm">
                <Link
                  to="/mentor/profile"
                  className="flex items-center p-2 space-x-3 rounded-md"
                >
                  <span>Profile</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar; 