import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { groupAPI } from '../services/api';

export default function GroupManagerPage() {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupAPI.getAll().then(res => res.data),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['groupMembers', selectedGroup?.id],
    queryFn: () => selectedGroup ? groupAPI.getMembers(selectedGroup.id).then(res => res.data) : Promise.resolve([]),
    enabled: !!selectedGroup,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Manage Groups</h1>

      <div className="bg-card p-6 rounded-lg border border-secondary">
        <h2 className="text-lg font-bold text-text-primary mb-4">All Groups</h2>
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'description', label: 'Description' },
            { key: 'memberCount', label: 'Members' },
            { key: 'status', label: 'Status' },
          ]}
          data={groups}
          onEdit={(group) => setSelectedGroup(group)}
        />
      </div>

      <Modal isOpen={!!selectedGroup} onClose={() => setSelectedGroup(null)} title={selectedGroup?.name}>
        {selectedGroup && (
          <div className="space-y-4">
            <div>
              <p className="text-text-secondary text-sm">Description</p>
              <p className="text-text-primary font-medium">{selectedGroup.description}</p>
            </div>
            <div>
              <p className="text-text-secondary text-sm mb-3">Members ({members.length})</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {members.length > 0 ? (
                  members.map(member => (
                    <div key={member.id} className="flex justify-between items-center p-2 bg-primary rounded">
                      <span className="text-text-primary text-sm">{member.name}</span>
                      <span className="text-text-secondary text-xs">{member.email}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-text-secondary text-sm">No members yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
