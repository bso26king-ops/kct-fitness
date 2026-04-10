import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { userAPI } from '../services/api';

export default function UserManagerPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [extendDays, setExtendDays] = useState('7');
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['users', subscriptionFilter],
    queryFn: () => userAPI.getAll({ subscriptionStatus: subscriptionFilter }).then(res => res.data),
  });

  const extendTrialMutation = useMutation({
    mutationFn: (data) => userAPI.extendTrial(data.id, data.days),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setSelectedUser(null); },
  });

  const suspendMutation = useMutation({
    mutationFn: (id) => userAPI.suspend(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">User Management</h1>
      <div className="bg-card p-6 rounded-lg border border-secondary">
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'subscriptionStatus', label: 'Status' },
          ]}
          data={users}
          onEdit={(user) => setSelectedUser(user)}
        />
      </div>
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={selectedUser?.name}>
        {selectedUser && (
          <div className="space-y-4">
            <Input type="number" label="Extend Trial (days)" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} />
            <Button variant="primary" onClick={() => extendTrialMutation.mutate({ id: selectedUser.id, days: parseInt(extendDays) })}>Extend Trial</Button>
            <Button variant="danger" onClick={() => suspendMutation.mutate(selectedUser.id)}>Suspend</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
