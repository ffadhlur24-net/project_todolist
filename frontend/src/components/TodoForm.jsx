import React, { useState } from 'react';

export default function TodoForm({ onAddTodo, disabled }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || disabled) return;
    onAddTodo(title.trim());
    setTitle('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <span className="input-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </span>
        <input
          type="text"
          className="todo-input"
          placeholder="Tuliskan tugas atau rencana baru..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={disabled}
          maxLength={200}
        />
        <button
          type="submit"
          className="btn-add"
          disabled={disabled || !title.trim()}
          title="Tambah Tugas (Enter)"
        >
          <span>Tambah</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </form>
  );
}
