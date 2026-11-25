import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import DisasterMap from '../map/DisasterMap';

export default function AppLayout() {
  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden relative">
      {/* Global Background Map */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <DisasterMap />
      </div>
      
      {/* Floating Overlay Content */}
      <div className="z-10 flex w-full h-full pointer-events-none">
        <div className="pointer-events-auto">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden relative pointer-events-none">
          <div className="pointer-events-auto">
            <TopNavbar />
          </div>
          <main className="flex-1 overflow-auto p-4 relative pointer-events-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
