import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Muat konfigurasi dari file .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Validasi keberadaan konfigurasi Supabase
if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-ref') || supabaseKey.includes('your-anon-or-service-role-key')) {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  PERINGATAN: Variabel SUPABASE_URL atau SUPABASE_KEY belum dikonfigurasi dengan benar di backend/.env.');
  console.warn('\x1b[33m%s\x1b[0m', '   Silakan buka Supabase Dashboard -> Project Settings -> API, lalu perbarui backend/.env.');
}

// Inisialisasi client Supabase
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);
