import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import DataTable from '../components/ui/DataTable';
import { workoutAPI, exerciseAPI } from '../services/api';

export default function WorkoutBuilderPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', duration: '', difficulty: '', exercises: [] });
  const [draggedExercises, setDraggedExercises] = useState([]);
  const queryClient = useQueryClient();

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => workoutAPI.getAll().then(res => res.data),
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => exerciseAPI.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => workoutAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      setIsModalOpen(false);
      setFormData({ name: '', duration: '', difficulty: '', exercises: [] });
      setDraggedExercises([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => workoutAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ ...formData, exercises: draggedExercises });
  };

  const addExerciseToBuilder = (exercise) => {
    if (!draggedExercises.find(e => e.id === exercise.id)) {
      setDraggedExercises([...draggedExercises, exercise]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-primary">Workout Builder</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Create Workout
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Workout">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Workout Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Upper Body Strength"
          />
          <Input
            label="Duration (minutes)"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          />
          <Input
            label="Difficulty"
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Selected Exercises</label>
            <div className="bg-primary border border-secondary rounded p-3 min-h-24 space-y-2">
              {draggedExercises.length > 0 ? (
                draggedExercises.map(ex => (
                  <div key={ex.id} className="flex justify-between items-center bg-card p-2 rounded">
                    <span className="text-text-primary text-sm">{ex.name}</span>
                    <button
                      type="button"
                      onClick={() => setDraggedExercises(draggedExercises.filter(e => e.id !== ex.id))}
                      className="text-danger text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-text-secondary text-sm">Select exercises below</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Available Exercises</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {exercises.slice(0, 5).map(ex => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => addExerciseToBuilder(ex)}
                  className="w-full text-left px-3 py-2 bg-card hover:bg-secondary rounded text-text-primary text-sm"
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>
          <Button variant="primary" type="submit" className="w-full">
            Create Workout
          </Button>
        </form>
      </Modal>

      <div className="bg-card p-6 rounded-lg border border-secondary">
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'duration', label: 'Duration' },
            { key: 'difficulty', label: 'Difficulty' },
            {
              key: 'exerciseCount',
              label: 'Exercises',
              render: (count) => count || 0,
            },
          ]}
          data={workouts}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      </div>
    </div>
  );
}
