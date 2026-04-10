import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import DataTable from '../components/ui/DataTable';
import { notificationAPI } from '../services/api';

export default function NotificationCenterPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ targetAudience: 'all', title: '', body: '' });
  const queryClient = useQueryClient();

  const { data: history = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getHistory().then(res => res.data),
  });

  const sendMutation = useMutation({
    mutationFn: (data) => notificationAPI.send(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setIsModalOpen(false);
      setFormData({ targetAudience: 'all', title: '', body: '' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-primary">Notifications</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Send Notification
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Send Notification">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Target Audience</label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full"
            >
              <option value="all">All Users</option>
              <option value="trial">Trial Users</option>
              <option value="premium">Premium Users</option>
              <option value="inactive">Inactive Users</option>
            </select>
          </div>
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Notification title"
            required
          />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Message</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Notification message"
              rows="4"
              className="w-full"
              required
            />
          </div>
          <Button variant="primary" type="submit" className="w-full">
            Send Notification
          </Button>
        </form>
      </Modal>

      <div className="bg-card p-6 rounded-lg border border-secondary">
        <h2 className="text-lg font-bold text-text-primary mb-4">Notification History</h2>
        <DataTable
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'targetAudience', label: 'Audience' },
            { key: 'recipientCount', label: 'Recipients' },
            {
              key: 'sentAt',
              label: 'Sent',
              render: (date) => new Date(date).toLocaleString(),
            },
          ]}
          data={history}
        />
      </div>
    </div>
  );
}
