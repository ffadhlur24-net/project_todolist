import React, { useState } from 'react';

export default function TodoItem({ todo, onToggle, onUpdateTitle, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditTitle(todo.title);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle.trim() !== todo.title) {
      onUpdateTitle(todo.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(todo.title);
    }
  };

  // Format tanggal ramah pengguna
  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return '';
    }
  };

  return (
    <li className={`todo-item ${todo.is_completed ? 'completed' : ''}`}>
      <div className="todo-item-content">
        {/* Custom Checkbox */}
        <label className="checkbox-wrapper" title={todo.is_completed ? 'Tandai belum selesai' : 'Tandai selesai'}>
          <input
            type="checkbox"
            checked={Boolean(todo.is_completed)}
            onChange={() => onToggle(todo.id, !todo.is_completed)}
          />
          <span className="checkbox-custom">
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1.5 5.5 4.5 8.5 10.5 1.5"></polyline>
            </svg>
          </span>
        </label>

        {/* Text Title atau Inline Edit Input */}
        {isEditing ? (
          <div className="inline-edit-wrapper">
            <input
              type="text"
              className="inline-edit-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              maxLength={200}
            />
            <button className="btn-icon btn-save" onClick={handleSaveEdit} title="Simpan (Enter)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <button className="btn-icon btn-cancel" onClick={() => setIsEditing(false)} title="Batal (Esc)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ) : (
          <div className="todo-text-group" onDoubleClick={handleStartEdit}>
            <span className="todo-title" title="Klik 2x untuk mengedit teks">{todo.title}</span>
            {todo.created_at && (
              <span className="todo-timestamp">
                {formatDate(todo.created_at)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="todo-actions">
        {!isEditing && (
          <button
            type="button"
            className="btn-action btn-edit"
            onClick={handleStartEdit}
            title="Edit teks tugas"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        )}

        <button
          type="button"
          className="btn-action btn-delete"
          onClick={() => onDelete(todo.id)}
          title="Hapus tugas"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </li>
  );
}
