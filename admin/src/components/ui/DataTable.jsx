import React, { useState } from 'react';

export default function DataTable({ columns, data = [], onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = data.filter(item =>
    columns.some(col =>
      String(item[col.key]).toLowerCase().includes(search.toLowerCase())
    )
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-card">
            <tr className="border-b border-secondary">
              {columns.map(col => (
                <th key={col.key} className="px-6 py-3 text-left font-semibold text-text-primary">
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-3 text-left font-semibold text-text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((row, idx) => (
              <tr key={idx} className="border-b border-secondary hover:bg-card transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-6 py-4 text-text-secondary">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="text-accent hover:text-blue-400 text-sm font-medium"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row.id)}
                        className="text-danger hover:text-red-500 text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-text-secondary text-sm">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-card hover:bg-secondary text-text-primary rounded disabled:opacity-50"
          >
            â Prev
          </button>
          <span className="text-text-secondary text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-card hover:bg-secondary text-text-primary rounded disabled:opacity-50"
          >
            Next â
          </button>
        </div>
      </div>
    </div>
  );
}
