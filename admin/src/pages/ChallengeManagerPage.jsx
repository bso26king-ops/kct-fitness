import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import DataTable from '../components/ui/DataTable';
import { challengeAPI, workoutAPI } from '../services/api';

export default function ChallengeManagerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', workoutId: '', startDate: '', endDate: '' });
  const queryClient = useQueryClient();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => challengeAPI.getAll().then(res => res.data),
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => workoutAPI.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => challengeAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      setIsModalOpen(false);
      setFormData({ name: '', description: '', workoutId: '', startDate: '', endDate: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => challengeAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-primary">Challenges</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Create Challenge
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Challenge">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Challenge Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., 30-Day Strength"
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Challenge details"
          />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Workout</label>
            <select
              value={formData.workoutId}
              onChange={(e) => setFormData({ ...formData, workoutId: e.target.value })}
              className="w-full"
            >
              <option>Select a workout</option>
              {workouts.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
          <Input
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
          <Button variant="primary" type="submit" className="w-full">
            Create Challenge
          </Button>
        </form>
      </Modal>

      <div className="bg-card p-6 rounded-lg border border-secondary">
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'description', label: 'Description' },
            { key: 'participantCount', label: 'Participants' },
            { key: 'status', label: 'Status' },
          ]}
          data={challenges}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      </div>
    </div>
  );
}
