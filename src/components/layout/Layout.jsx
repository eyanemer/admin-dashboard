import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * Layout principal - Structure propre et professionnelle.
 */
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Fixe */}
      <Sidebar />
      
      {/* Zone de contenu principale */}
      <div className="flex-1 flex flex-col min-h-screen pl-64">
        {/* Topbar - Fixe */}
        <Topbar />
        
        {/* Main Content Area */}
        <main className="flex-1 p-8 mt-16 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
