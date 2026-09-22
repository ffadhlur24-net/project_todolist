-- ==============================================================================
-- SKRIP DATABASE SUPABASE (POSTGRESQL) - TO-DO LIST APPLICATION
-- Jalankan skrip ini langsung di Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. Buat Tabel 'todos' jika belum ada
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tambahkan komentar untuk dokumentasi kolom
COMMENT ON TABLE public.todos IS 'Tabel untuk menyimpan daftar tugas (to-do items)';
COMMENT ON COLUMN public.todos.id IS 'ID unik to-do bertipe UUID';
COMMENT ON COLUMN public.todos.title IS 'Judul atau deskripsi to-do';
COMMENT ON COLUMN public.todos.is_completed IS 'Status apakah to-do sudah diselesaikan';
COMMENT ON COLUMN public.todos.created_at IS 'Waktu pembuatan to-do';

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 3. Hapus policy lama jika ada (untuk idempotency / aman dijalankan berulang kali)
DROP POLICY IF EXISTS "Public can view todos" ON public.todos;
DROP POLICY IF EXISTS "Public can insert todos" ON public.todos;
DROP POLICY IF EXISTS "Public can update todos" ON public.todos;
DROP POLICY IF EXISTS "Public can delete todos" ON public.todos;

-- 4. Buat Kebijakan RLS (Public Access untuk testing CRUD tanpa auth login)
-- Kebijakan SELECT: Siapa saja (anon & authenticated) dapat membaca todos
CREATE POLICY "Public can view todos"
ON public.todos
FOR SELECT
TO public
USING (true);

-- Kebijakan INSERT: Siapa saja dapat menambahkan todo baru
CREATE POLICY "Public can insert todos"
ON public.todos
FOR INSERT
TO public
WITH CHECK (true);

-- Kebijakan UPDATE: Siapa saja dapat memperbarui todo (status / title)
CREATE POLICY "Public can update todos"
ON public.todos
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Kebijakan DELETE: Siapa saja dapat menghapus todo
CREATE POLICY "Public can delete todos"
ON public.todos
FOR DELETE
TO public
USING (true);

-- 5. Data Awal (Opsional / Seed Data untuk verifikasi langsung)
INSERT INTO public.todos (title, is_completed)
VALUES 
    ('Selamat datang di To-Do List Modern! 🎉', false),
    ('Pelajari integrasi Express dan Supabase', true),
    ('Bangun antarmuka React dengan visual memukau 🚀', false)
ON CONFLICT DO NOTHING;
