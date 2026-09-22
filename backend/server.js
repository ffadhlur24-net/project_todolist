import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './supabaseClient.js';

// Muat variabel environment dari .env (Updated with user credentials)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================
// Izinkan Cross-Origin Resource Sharing (CORS) untuk akses dari frontend React
app.use(cors({
  origin: '*', // Bisa dibatasi ke frontend origin seperti 'http://localhost:5173'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsing body request berformat JSON
app.use(express.json());

// ==========================================
// ROUTES / ENDPOINTS
// ==========================================

// Endpoint Root & Health Check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend To-Do List API aktif dan siap melayani permintaan.',
    endpoints: {
      getAllTodos: 'GET /api/todos',
      createTodo: 'POST /api/todos',
      updateTodo: 'PUT /api/todos/:id',
      deleteTodo: 'DELETE /api/todos/:id',
      health: 'GET /api/health'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/todos
 * @desc    Mengambil semua data todo (diurutkan dari yang paling baru)
 */
app.get('/api/todos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error Supabase saat mengambil todos:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data to-do dari database',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar to-do',
      data: data || []
    });
  } catch (err) {
    console.error('Internal server error pada GET /api/todos:', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan internal pada server',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/todos
 * @desc    Menambahkan to-do baru
 * @body    { title: string }
 */
app.post('/api/todos', async (req, res) => {
  try {
    const { title } = req.body;

    // Validasi input
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Field "title" wajib diisi dan tidak boleh kosong'
      });
    }

    const newTodo = {
      title: title.trim(),
      is_completed: false
    };

    const { data, error } = await supabase
      .from('todos')
      .insert([newTodo])
      .select()
      .single();

    if (error) {
      console.error('Error Supabase saat menambah todo:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Gagal menambahkan to-do ke database',
        error: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'To-do berhasil ditambahkan',
      data
    });
  } catch (err) {
    console.error('Internal server error pada POST /api/todos:', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan internal pada server',
      error: err.message
    });
  }
});

/**
 * @route   PUT /api/todos/:id
 * @desc    Memperbarui status selesai/belum atau mengubah judul to-do
 * @params  id (UUID)
 * @body    { title?: string, is_completed?: boolean }
 */
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, is_completed } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID to-do wajib disertakan pada parameter URL'
      });
    }

    // Bangun payload update secara dinamis berdasarkan field yang dikirimkan
    const updatePayload = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Field "title" tidak boleh bernilai string kosong'
        });
      }
      updatePayload.title = title.trim();
    }

    if (is_completed !== undefined) {
      if (typeof is_completed !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Field "is_completed" harus bernilai boolean (true/false)'
        });
      }
      updatePayload.is_completed = is_completed;
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Setidaknya salah satu field ("title" atau "is_completed") harus disediakan untuk update'
      });
    }

    const { data, error } = await supabase
      .from('todos')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error Supabase saat memperbarui todo ID ${id}:`, error.message);
      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui to-do di database',
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: `To-do dengan ID ${id} tidak ditemukan`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'To-do berhasil diperbarui',
      data
    });
  } catch (err) {
    console.error(`Internal server error pada PUT /api/todos/${req.params.id}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan internal pada server',
      error: err.message
    });
  }
});

/**
 * @route   DELETE /api/todos/:id
 * @desc    Menghapus to-do berdasarkan ID
 * @params  id (UUID)
 */
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID to-do wajib disertakan pada parameter URL'
      });
    }

    const { data, error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error Supabase saat menghapus todo ID ${id}:`, error.message);
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus to-do dari database',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'To-do berhasil dihapus',
      data: data || { id }
    });
  } catch (err) {
    console.error(`Internal server error pada DELETE /api/todos/${req.params.id}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan internal pada server',
      error: err.message
    });
  }
});

// Middleware 404 untuk rute yang tidak ditemukan
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Rute '${req.originalUrl}' dengan metode '${req.method}' tidak ditemukan`
  });
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log('--------------------------------------------------');
  console.log(`🚀 Server Backend berjalan di: http://localhost:${PORT}`);
  console.log(`📦 REST API To-Do: http://localhost:${PORT}/api/todos`);
  console.log('--------------------------------------------------');
});
