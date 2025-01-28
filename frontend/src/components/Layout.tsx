import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();

  // Don't show sidebar for non-authenticated users
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen bg-gray-50">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout; 