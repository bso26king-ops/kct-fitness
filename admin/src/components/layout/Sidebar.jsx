import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Overview', icon: '📊' },
    { path: '/exercises', label: 'Exercise Library', icon: '🏋️' },
    { path: '/workouts', label: 'Workout Builder', icon: '💪' },
    { path: '/challenges', label: 'Challenges', icon: '🎯' },
    { path: '/groups', label: 'Groups', icon: '👥' },
    { path: '/users', label: 'Users', icon: '👤' },
    { path: '/sessions', label: 'Sessions', icon: '📅' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/subscriptions', label: 'Subscriptions', icon: '💳' },
  ];

  return (
    <div className="w-64 bg-secondary border-r border-card h-screen flex flex-col">
      <div className="p-6 border-b border-card">
        <h1 className="text-2xl font-bold text-text-primary">KCT</h1>
        <p className="text-xs text-text-secondary">Admin Dashboard</p>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-accent text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-card'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-card">
        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-danger hover:bg-red-700 text-primary rounded-lg font-medium text-sm transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
