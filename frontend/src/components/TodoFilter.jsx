import React from 'react';

export default function TodoFilter({ filter, onFilterChange, counts, onClearCompleted }) {
  const tabs = [
    { key: 'all', label: 'Semua', count: counts.all },
    { key: 'active', label: 'Aktif', count: counts.active },
    { key: 'completed', label: 'Selesai', count: counts.completed }
  ];

  return (
    <div className="todo-filter-container">
      <div className="filter-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={filter === tab.key}
            className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
            onClick={() => onFilterChange(tab.key)}
          >
            <span>{tab.label}</span>
            <span className="filter-badge">{tab.count}</span>
          </button>
        ))}
      </div>

      {counts.completed > 0 && onClearCompleted && (
        <button
          type="button"
          className="btn-clear-completed"
          onClick={onClearCompleted}
          title="Hapus semua tugas yang telah diselesaikan"
        >
          Bersihkan Selesai ({counts.completed})
        </button>
      )}
    </div>
  );
}
