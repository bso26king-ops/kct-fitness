import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import DataTable from '../components/ui/DataTable';
import { sessionAPI, workoutAPI, groupAPI } from '../services/api';

export default function ScheduledSessionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ workoutId: '', groupId: '', scheduledAt: '' });
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionAPI.getAll().then(res => res.data),
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => workoutAPI.getAll().then(res => res.data),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupAPI.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => sessionAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setIsModalOpen(false);
      setFormData({ workoutId: '', groupId: '', scheduledAt: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => sessionAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-primary">Scheduled Sessions</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Schedule Session
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Session">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Workout</label>
            <select
              value={formData.workoutId}
              onChange={(e) => setFormData({ ...formData, workoutId: e.target.value })}
              className="w-full"
              required
            >
              <option>Select workout</option>
              {workouts.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Group</label>
            <select
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="w-full"
              required
            >
              <option>Select group</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Date & Time"
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
            required
          />
          <Button variant="primary" type="submit" className="w-full">
            Schedule Session
          </Button>
        </form>
      </Modal>

      <div className="bg-card p-6 rounded-lg border border-secondary">
        <DataTable
          columns={[
            { key: 'workout.name', label: 'Workout' },
            { key: 'group.name', label: 'Group' },
            {
              key: 'scheduledAt',
              label: 'Scheduled',
              render: (date) => new Date(date).toLocaleString(),
            },
            { key: 'participantCount', label: 'Participants' },
          ]}
          data={sessions}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      </div>
    </div>
  );
}
