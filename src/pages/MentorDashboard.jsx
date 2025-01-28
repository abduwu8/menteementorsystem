import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MenteeList from '../components/MenteeList';

function MentorDashboard() {
  const [mentees, setMentees] = useState([]);

  useEffect(() => {
    // Fetch mentees data
    fetchMentees();
  }, []);

  const fetchMentees = async () => {
    try {
      const response = await fetch('/api/mentees');
      const data = await response.json();
      setMentees(data);
    } catch (error) {
      console.error('Error fetching mentees:', error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div className="container mx-auto px-6 py-8">
          <h3 className="text-gray-700 text-3xl font-medium">Dashboard</h3>
          
          <div className="mt-8">
            <MenteeList mentees={mentees} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard; 