import React, { useState, useEffect, useMemo, useCallback } from 'react';
import TodoForm from './components/TodoForm.jsx';
import TodoItem from './components/TodoItem.jsx';
import TodoFilter from './components/TodoFilter.jsx';

// Endpoint Backend API (Bisa disesuaikan lewat variabel environment VITE_API_URL jika di-deploy)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/todos';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  // Helper untuk menampilkan notifikasi toast sementara
  const showToast = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // 1. GET ALL TODOS
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_URL);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Gagal memuat to-do (Status: ${res.status})`);
      }

      const result = await res.json();
      setTodos(result.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(
        err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
          ? 'Tidak dapat terhubung ke server backend di http://localhost:5000. Pastikan server Express aktif dan kredensial Supabase sudah terkonfigurasi di backend/.env.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // 2. ADD TODO
  const handleAddTodo = async (title) => {
    try {
      setSubmitting(true);
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Gagal menambahkan to-do');
      }

      // Masukkan item baru ke posisi paling atas
      setTodos((prev) => [result.data, ...prev]);
      showToast('Tugas baru berhasil ditambahkan! 🎯');
    } catch (err) {
      console.error('Add todo error:', err);
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. TOGGLE COMPLETED
  const handleToggleTodo = async (id, is_completed) => {
    // Simpan state sebelumnya untuk rollback jika gagal
    const previousTodos = [...todos];

    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_completed } : t))
    );

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Gagal memperbarui status');
      }

      showToast(
        is_completed ? 'Tugas diselesaikan! Mantap! 🎉' : 'Tugas diaktifkan kembali'
      );
    } catch (err) {
      console.error('Toggle error:', err);
      setTodos(previousTodos); // Rollback
      showToast(err.message, 'error');
    }
  };

  // 4. UPDATE TITLE
  const handleUpdateTitle = async (id, newTitle) => {
    const previousTodos = [...todos];

    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
    );

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Gagal memperbarui judul');
      }

      showToast('Judul tugas berhasil diperbarui ✨');
    } catch (err) {
      console.error('Update title error:', err);
      setTodos(previousTodos); // Rollback
      showToast(err.message, 'error');
    }
  };

  // 5. DELETE TODO
  const handleDeleteTodo = async (id) => {
    const previousTodos = [...todos];

    // Optimistic UI update
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Gagal menghapus to-do');
      }

      showToast('Tugas berhasil dihapus 🗑️', 'info');
    } catch (err) {
      console.error('Delete error:', err);
      setTodos(previousTodos); // Rollback
      showToast(err.message, 'error');
    }
  };

  // 6. CLEAR ALL COMPLETED
  const handleClearCompleted = async () => {
    const completedTodos = todos.filter((t) => t.is_completed);
    if (completedTodos.length === 0) return;

    if (!window.confirm(`Hapus ${completedTodos.length} tugas yang telah selesai?`)) {
      return;
    }

    try {
      // Jalankan penghapusan untuk setiap item selesai
      await Promise.all(
        completedTodos.map((item) =>
          fetch(`${API_URL}/${item.id}`, { method: 'DELETE' })
        )
      );

      setTodos((prev) => prev.filter((t) => !t.is_completed));
      showToast(`${completedTodos.length} tugas selesai berhasil dibersihkan`);
    } catch (err) {
      console.error('Clear completed error:', err);
      fetchTodos(); // Re-sync
      showToast('Terjadi kesalahan saat membersihkan tugas', 'error');
    }
  };

  // Perhitungan statistik task
  const counts = useMemo(() => {
    const all = todos.length;
    const completed = todos.filter((t) => t.is_completed).length;
    const active = all - completed;
    const percent = all > 0 ? Math.round((completed / all) * 100) : 0;
    return { all, active, completed, percent };
  }, [todos]);

  // Filter daftar to-do berdasarkan tab aktif
  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.is_completed);
    if (filter === 'completed') return todos.filter((t) => t.is_completed);
    return todos;
  }, [todos, filter]);

  return (
    <div className="app-container">
      {/* Background Decorative Glows */}
      <div className="bg-glow glow-1" aria-hidden="true" />
      <div className="bg-glow glow-2" aria-hidden="true" />

      {/* Floating Toast Notification */}
      {notification && (
        <div className={`toast-notification toast-${notification.type}`} role="alert">
          <span className="toast-dot" />
          <span>{notification.message}</span>
        </div>
      )}

      <main className="todo-card">
        {/* Header Section */}
        <header className="todo-header">
          <div className="header-badge">
            <span className="badge-pulse" />
            <span>Productivity Suite</span>
          </div>
          <h1 className="header-title">TaskMaster</h1>
          <p className="header-subtitle">
            Kelola kegiatan harian Anda dengan cepat, bersih, dan efisien.
          </p>

          {/* Progress Bar & Counter */}
          <div className="progress-section">
            <div className="progress-info">
              <span className="progress-label">Progres Penyelesaian</span>
              <span className="progress-value">{counts.percent}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${counts.percent}%` }}
              />
            </div>
            <div className="stats-quick-row">
              <span>{counts.active} tugas aktif tersisa</span>
              <span>{counts.completed} dari {counts.all} selesai</span>
            </div>
          </div>
        </header>

        {/* Input Form Section */}
        <section className="form-section">
          <TodoForm onAddTodo={handleAddTodo} disabled={submitting} />
        </section>

        {/* Filter Tabs Section */}
        <section className="filter-section">
          <TodoFilter
            filter={filter}
            onFilterChange={setFilter}
            counts={counts}
            onClearCompleted={handleClearCompleted}
          />
        </section>

        {/* Todo List / States Section */}
        <section className="list-section">
          {loading ? (
            <div className="loading-state">
              <div className="skeleton-item" />
              <div className="skeleton-item" />
              <div className="skeleton-item" />
              <p className="loading-text">Menghubungkan ke database Supabase...</p>
            </div>
          ) : error ? (
            <div className="error-card" role="alert">
              <div className="error-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div className="error-content">
                <h3>Terjadi Kesalahan</h3>
                <p>{error}</p>
                <button type="button" className="btn-retry" onClick={fetchTodos}>
                  Coba Muat Ulang
                </button>
              </div>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="empty-title">
                {filter === 'all'
                  ? 'Belum ada tugas tercatat'
                  : filter === 'active'
                  ? 'Tidak ada tugas aktif'
                  : 'Belum ada tugas yang diselesaikan'}
              </h3>
              <p className="empty-desc">
                {filter === 'all'
                  ? 'Ketik rencana Anda di atas dan tekan Tambah untuk memulai hari produktif!'
                  : filter === 'active'
                  ? 'Semua tugas telah Anda selesaikan dengan sangat baik!'
                  : 'Selesaikan beberapa tugas untuk melihat riwayat di sini.'}
              </p>
            </div>
          ) : (
            <ul className="todo-list">
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onUpdateTitle={handleUpdateTitle}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </ul>
          )}
        </section>

        {/* Footer info */}
        <footer className="todo-footer">
          <span>Teknologi: React (Vite) • Node.js Express • Supabase (PostgreSQL)</span>
        </footer>
      </main>
    </div>
  );
}
