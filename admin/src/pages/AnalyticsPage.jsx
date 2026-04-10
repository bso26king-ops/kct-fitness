import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../services/api';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');

  const { data: metrics } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: () => analyticsAPI.getMetrics({ range: dateRange }),
  });

  const sampleData = [
    { date: 'Apr 1', activeUsers: 240, newUsers: 120, workouts: 340 },
    { date: 'Apr 2', activeUsers: 280, newUsers: 150, workouts: 420 },
    { date: 'Apr 3', activeUsers: 320, newUsers: 200, workouts: 380 },
    { date: 'Apr 4', activeUsers: 380, newUsers: 180, workouts: 450 },
    { date: 'Apr 5', activeUsers: 420, newUsers: 220, workouts: 520 },
    { date: 'Apr 6', activeUsers: 480, newUsers: 250, workouts: 580 },
    { date: 'Apr 7', activeUsers: 520, newUsers: 280, workouts: 620 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-primary">Analytics</h1>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-accent text-primary'
                  : 'bg-card text-text-primary hover:bg-secondary'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-lg border border-secondary">
          <h2 className="text-lg font-bold text-text-primary mb-4">Active Users Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#A0A0A0" />
              <YAxis stroke="#A0A0A0" />
              <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: 'none' }} />
              <Line type="monotone" dataKey="activeUsers" stroke="#0080FF" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-6 rounded-lg border border-secondary">
          <h2 className="text-lg font-bold text-text-primary mb-4">New Users</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#A0A0A0" />
              <YAxis stroke="#A0A0A0" />
              <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: 'none' }} />
              <Bar dataKey="newUsers" fill="#00C853" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-6 rounded-lg border border-secondary lg:col-span-2">
          <h2 className="text-lg font-bold text-text-primary mb-4">Workouts Completed</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#A0A0A0" />
              <YAxis stroke="#A0A0A0" />
              <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: 'none' }} />
              <Area type="monotone" dataKey="workouts" fill="#FF6D00" stroke="#FF6D00" opacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-6 rounded-lg border border-secondary">
          <p className="text-text-secondary text-sm mb-2">Avg Session Duration</p>
          <p className="text-3xl font-bold text-accent">42 min</p>
          <p className="text-text-secondary text-xs mt-2">↑ 8% from last week</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-secondary">
          <p className="text-text-secondary text-sm mb-2">Completion Rate</p>
          <p className="text-3xl font-bold text-success">87%</p>
          <p className="text-text-secondary text-xs mt-2">↑ 3% from last week</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-secondary">
          <p className="text-text-secondary text-sm mb-2">Churn Rate</p>
          <p className="text-3xl font-bold text-danger">2.1%</p>
          <p className="text-text-secondary text-xs mt-2">↓ 0.5% from last week</p>
        </div>
      </div>
    </div>
  );
}
