import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from '../components/ui/StatCard';
import DataTable from '../components/ui/DataTable';
import { analyticsAPI } from '../services/api';

export default function OverviewPage() {
  const { data: metrics } = useQuery({
    queryKey: ['analytics', 'metrics'],
    queryFn: () => analyticsAPI.getMetrics(),
  });

  const { data: growth } = useQuery({
    queryKey: ['analytics', 'growth'],
    queryFn: () => analyticsAPI.getUserGrowth(),
  });

  const { data: workouts } = useQuery({
    queryKey: ['analytics', 'workouts'],
    queryFn: () => analyticsAPI.getWorkoutStats(),
  });

  const userGrowthData = growth?.data || [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 180 },
    { month: 'Mar', users: 240 },
    { month: 'Apr', users: 320 },
    { month: 'May', users: 450 },
    { month: 'Jun', users: 580 },
  ];

  const workoutData = workouts?.data || [
    { name: 'Mon', workouts: 240 },
    { name: 'Tue', workouts: 320 },
    { name: 'Wed', workouts: 200 },
    { name: 'Thu', workouts: 290 },
    { name: 'Fri', workouts: 380 },
    { name: 'Sat', workouts: 450 },
    { name: 'Sun', workouts: 290 },
  ];

  const recentSignups = [
    { id: 1, name: 'John Doe', email: 'john@example.com', date: '2024-04-05', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', date: '2024-04-04', status: 'active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', date: '2024-04-03', status: 'trial' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-text-primary">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon="👥"
          label="Total Users"
          value="2,450"
          trend={12}
          trendLabel="vs last month"
        />
        <StatCard
          icon="💪"
          label="Total Workouts"
          value="12,340"
          trend={28}
          trendLabel="vs last month"
        />
        <StatCard
          icon="⭐"
          label="Avg. Rating"
          value="4.8"
          trend={2}
          trendLabel="user satisfaction"
        />
        <StatCard
          icon="💰"
          label="MRR"
          value="$24,500"
          trend={18}
          trendLabel="vs last month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-lg border border-secondary">
          <h2 className="text-lg font-bold text-text-primary mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#A0A0A0" />
              <YAxis stroke="#A0A0A0" />
              <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="users" stroke="#0080FF" strokeWidth={2} dot={{ fill: '#0080FF' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-6 rounded-lg border border-secondary">
          <h2 className="text-lg font-bold text-text-primary mb-4">Weekly Workouts</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workoutData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#A0A0A0" />
              <YAxis stroke="#A0A0A0" />
              <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="workouts" fill="#00C853" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border border-secondary">
        <h2 className="text-lg font-bold text-text-primary mb-4">Recent Signups</h2>
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'date', label: 'Signup Date' },
            {
              key: 'status',
              label: 'Status',
              render: (status) => (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  status === 'active' ? 'bg-success text-primary' : 'bg-warning text-primary'
                }`}>
                  {status}
                </span>
              ),
            },
          ]}
          data={recentSignups}
        />
      </div>
    </div>
  );
}
