import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-app text-primary transition-colors duration-300">
      <Navbar />

      <div className="flex pt-16">
        {user && <Sidebar />}

        <main
          className={`
            flex-1 transition-all duration-300
            ${user ? 'lg:ml-0' : ''}
          `}
        >
          <div className="min-h-[calc(100vh-4rem)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
