import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function ProtectedLayout() {
  return (
    <div className="flex h-screen bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-secondary border-b border-card px-8 py-4">
          <h2 className="text-2xl font-bold text-text-primary">KCT Fitness Admin</h2>
        </header>
        <main className="flex-1 overflow-auto scrollbar">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
