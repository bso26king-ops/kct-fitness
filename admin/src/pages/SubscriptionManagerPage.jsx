import React from 'react';
import { useQuery } from '@tanstack/react-query';
import StatCard from '../components/ui/StatCard';
import DataTable from '../components/ui/DataTable';
import { subscriptionAPI } from '../services/api';

export default function SubscriptionManagerPage() {
  const { data: revenue } = useQuery({
    queryKey: ['subscriptions', 'revenue'],
    queryFn: () => subscriptionAPI.getRevenue(),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionAPI.getSubscriptions().then(res => res.data),
  });

  const { data: failedPayments = [] } = useQuery({
    queryKey: ['subscriptions', 'failed'],
    queryFn: () => subscriptionAPI.getFailedPayments().then(res => res.data),
  });

  const revenueData = revenue?.data || {
    mrr: 24500,
    arr: 294000,
    mrrGrowth: 18,
    activeSubscriptions: 450,
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-text-primary">Subscription Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon="💰"
          label="Monthly Recurring Revenue"
          value={`$${(revenueData.mrr / 1000).toFixed(1)}k`}
          trend={revenueData.mrrGrowth}
          trendLabel="vs last month"
        />
        <StatCard
          icon="📈"
          label="Annual Recurring Revenue"
          value={`$${(revenueData.arr / 1000).toFixed(0)}k`}
          trend={18}
          trendLabel="annual projection"
        />
        <StatCard
          icon="👥"
          label="Active Subscriptions"
          value={revenueData.activeSubscriptions}
          trend={12}
          trendLabel="month over month"
        />
        <StatCard
          icon="⚠️"
          label="Failed Payments"
          value={failedPayments.length}
          trend={-5}
          trendLabel="requires attention"
        />
      </div>

      <div className="bg-card p-6 rounded-lg border border-secondary">
        <h2 className="text-lg font-bold text-text-primary mb-4">Active Subscriptions</h2>
        <DataTable
          columns={[
            { key: 'userName', label: 'User' },
            { key: 'userEmail', label: 'Email' },
            { key: 'plan', label: 'Plan' },
            {
              key: 'renewalDate',
              label: 'Renewal',
              render: (date) => new Date(date).toLocaleDateString(),
            },
            { key: 'status', label: 'Status' },
          ]}
          data={subscriptions}
        />
      </div>

      {failedPayments.length > 0 && (
        <div className="bg-danger bg-opacity-10 border border-danger rounded-lg p-6">
          <h2 className="text-lg font-bold text-danger mb-4">Failed Payments ({failedPayments.length})</h2>
          <div className="space-y-3">
            {failedPayments.slice(0, 5).map((payment, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-primary rounded">
                <div>
                  <p className="text-text-primary font-medium">{payment.userName}</p>
                  <p className="text-text-secondary text-sm">{payment.userEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-text-primary font-medium">${payment.amount}</p>
                  <p className="text-danger text-sm">{payment.attemptCount} attempts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
