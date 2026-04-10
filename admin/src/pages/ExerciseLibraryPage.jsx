import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import DataTable from '../components/ui/DataTable';
import { exerciseAPI } from '../services/api';

export default function ExerciseLibraryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', muscleGroup: '', equipment: '', difficulty: '' });
  const queryClient = useQueryClient();

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => exerciseAPI.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => exerciseAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      setIsModalOpen(false);
      setFormData({ name: '', muscleGroup: '', equipment: '', difficulty: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => exerciseAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-primary">Exercise Library</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Add Exercise
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Exercise">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Exercise Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Bench Press"
          />
          <Input
            label="Muscle Group"
            value={formData.muscleGroup}
            onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
            placeholder="e.g., Chest"
          />
          <Input
            label="Equipment"
            value={formData.equipment}
            onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
            placeholder="e.g., Barbell"
          />
          <Input
            label="Difficulty"
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            placeholder="e.g., Intermediate"
          />
          <Button variant="primary" type="submit" className="w-full">
            Add Exercise
          </Button>
        </form>
      </Modal>

      <div className="bg-card p-6 rounded-lg border border-secondary">
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'muscleGroup', label: 'Muscle Group' },
            { key: 'equipment', label: 'Equipment' },
            { key: 'difficulty', label: 'Difficulty' },
          ]}
          data={exercises}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      </div>
    </div>
  );
}
