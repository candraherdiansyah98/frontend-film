// ============================================================
// utils/api.js — Helper Axios dengan Token Otomatis
// ============================================================
// Setiap request yang menggunakan "api" ini akan OTOMATIS
// menambahkan Bearer Token dari localStorage di header-nya.
// Kita tidak perlu tulis token berulang kali di setiap halaman.
// ============================================================

import axios from 'axios'

// Buat instance axios dengan base URL API Laravel kita
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})

// Interceptor = "petugas" yang berjalan sebelum setiap request dikirim
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  // Jika token ada, tambahkan ke header Authorization
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
