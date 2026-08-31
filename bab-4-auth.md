# 🎬 Modul Frontend CineVue — BAB 4
## Autentikasi — Login & Logout

---

> 💡 **Apa itu Token-Based Authentication?**
> Saat user login, server memberikan sebuah **token** (kode unik panjang).
> Token ini disimpan di browser, lalu dikirim di setiap request ke API yang membutuhkan login.
> Ini seperti kartu akses — tanpa kartu, kamu tidak bisa masuk ke ruangan tertentu.

---

## 4.1 Alur Autentikasi

```
User isi form login (email + password)
        │
        ▼
POST /api/login dikirim ke Laravel
        │
        ├─── Berhasil ──► Server kirim token
        │                     │
        │                     ▼
        │               Token disimpan di localStorage
        │                     │
        │                     ▼
        │               GET /api/profile (ambil data user)
        │                     │
        │                     ▼
        │               Data user disimpan di localStorage
        │                     │
        │                     ▼
        │               Redirect ke /dashboard ✅
        │
        └─── Gagal ────► Tampilkan pesan error ❌
```

---

## 4.2 Halaman Login — `src/views/Auth/LoginView.vue`

```vue
<template>
  <div class="login-page">
    <div class="login-card">

      <!-- Logo / Header -->
      <div class="login-header">
        <h1>🎬 CineVue</h1>
        <h2>Login Admin</h2>
        <p>Masuk untuk mengelola data film</p>
      </div>

      <!-- Alert Error -->
      <div v-if="errorMsg" class="alert alert-error">
        ❌ {{ errorMsg }}
      </div>

      <!-- Form Login -->
      <!-- @submit.prevent mencegah halaman reload saat form disubmit -->
      <form @submit.prevent="handleLogin" class="login-form">

        <div class="form-group">
          <label for="email">📧 Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="admin@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">🔑 Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <!-- Tombol submit dengan loading state -->
        <button type="submit" :disabled="loading" class="btn-login">
          <span v-if="loading">⏳ Memproses...</span>
          <span v-else>🚀 Login</span>
        </button>

      </form>

      <div class="login-footer">
        <RouterLink to="/">← Kembali ke Home</RouterLink>
      </div>

    </div>
  </div>
</template>

<script setup>
// ============================================================
// LoginView.vue — Halaman Login Admin
// ============================================================
// Konsep yang dipelajari:
//   - reactive()       : state untuk objek multi-field (form)
//   - @submit.prevent  : tangani submit form tanpa reload
//   - axios.post()     : kirim data ke API tanpa token
//   - localStorage     : simpan token & data user di browser
// ============================================================

import { ref, reactive, onMounted } from 'vue'
import { useRouter, RouterLink }    from 'vue-router'
import axios                        from 'axios'

const router = useRouter()

// reactive() dipakai untuk form dengan banyak field
// (berbeda dengan ref() yang biasanya untuk satu nilai)
const form = reactive({
  email:    '',
  password: ''
})

const loading  = ref(false)
const errorMsg = ref('')

// URL dasar API — bisa juga dipindah ke utils/api.js
const BASE_URL = 'http://localhost:8000/api'

// Jika sudah login (token ada), langsung redirect ke dashboard
onMounted(() => {
  if (localStorage.getItem('token')) {
    router.push('/dashboard')
  }
})

// ─── Fungsi Login ──────────────────────────────────────────
const handleLogin = async () => {
  try {
    loading.value  = true
    errorMsg.value = ''

    // Kirim POST ke /api/login
    // Untuk login, kita pakai axios langsung (bukan api.js)
    // karena belum ada token saat login
    const response = await axios.post(`${BASE_URL}/login`, {
      email:    form.email,
      password: form.password,
    })

    // Ambil token dari response
    const token = response.data.token

    // Simpan token ke localStorage
    localStorage.setItem('token', token)

    // Ambil data user dari endpoint /profile
    // (endpoint login tidak langsung return data user)
    const profileRes = await axios.get(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const user = profileRes.data.data

    // Simpan data user ke localStorage sebagai JSON string
    localStorage.setItem('user', JSON.stringify(user))

    // Arahkan ke dashboard setelah login berhasil
    router.push('/dashboard')

  } catch (err) {
    // Tampilkan pesan error yang sesuai berdasarkan status HTTP
    if (err.response?.status === 404) {
      errorMsg.value = 'Email tidak terdaftar!'
    } else if (err.response?.status === 401) {
      errorMsg.value = 'Password salah!'
    } else if (err.response?.status === 422) {
      errorMsg.value = 'Format email tidak valid!'
    } else {
      errorMsg.value = 'Terjadi kesalahan. Pastikan server Laravel berjalan!'
    }
  } finally {
    // loading selalu dimatikan, baik sukses maupun error
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 24px;
}

.login-card {
  background: white;
  padding: 48px 40px;
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
}

.login-header { text-align: center; margin-bottom: 32px; }
.login-header h1 { font-size: 28px; color: #e94560; margin-bottom: 8px; }
.login-header h2 { font-size: 20px; color: #1a1a2e; margin-bottom: 6px; }
.login-header p  { color: #888; font-size: 14px; }

.login-form { display: flex; flex-direction: column; gap: 18px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

label { font-size: 13px; font-weight: 600; color: #444; }

input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}
input:focus {
  border-color: #e94560;
  box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.12);
}

.btn-login {
  margin-top: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #e94560, #c73652);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}
.btn-login:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

.login-footer { text-align: center; margin-top: 24px; font-size: 13px; }
</style>
```

---

## 4.3 Cara Kerja `localStorage`

`localStorage` adalah tempat penyimpanan data di browser yang persisten (tidak hilang saat halaman di-refresh).

```javascript
// Simpan data
localStorage.setItem('token', 'abc123xyz')
localStorage.setItem('user', JSON.stringify({ name: 'Admin', email: 'a@b.com' }))

// Baca data
const token = localStorage.getItem('token')         // 'abc123xyz'
const user  = JSON.parse(localStorage.getItem('user'))  // { name: 'Admin', ... }

// Hapus data (saat logout)
localStorage.removeItem('token')
localStorage.removeItem('user')
```

> ⚠️ **Penting:** `localStorage` hanya bisa menyimpan teks (string). Kalau mau simpan objek/array, gunakan `JSON.stringify()` saat menyimpan dan `JSON.parse()` saat membaca.

---

## 4.4 Cara Kerja Interceptor di `utils/api.js`

Setiap request yang memakai `api.get()`, `api.post()`, dll., akan otomatis melewati interceptor yang menambahkan token:

```
Komponen panggil: api.get('/films')
        │
        ▼
  Interceptor berjalan:
  "Hei, ada request ke /films, saya cek token dulu..."
        │
        ├─ Token ada? → Tambahkan header: Authorization: Bearer abc123xyz
        │
        └─ Token tidak ada? → Kirim request tanpa header Authorization
        │
        ▼
  Request dikirim ke Laravel API
        │
        ▼
  Laravel cek token → valid → izinkan akses data ✅
```

---

## 4.5 `ref()` vs `reactive()` — Kapan Pakai Yang Mana?

| | `ref()` | `reactive()` |
|---|---|---|
| **Cocok untuk** | Satu nilai (string, number, boolean) | Objek dengan banyak field |
| **Cara ubah** | `nilai.value = 'baru'` | `objek.field = 'baru'` |
| **Di template** | `{{ nilai }}` | `{{ objek.field }}` |
| **Contoh** | `const loading = ref(false)` | `const form = reactive({ email: '', password: '' })` |

---

## 4.6 Penjelasan `@submit.prevent`

```vue
<!-- Tanpa .prevent → browser akan reload halaman saat form disubmit ❌ -->
<form @submit="handleLogin">

<!-- Dengan .prevent → halaman TIDAK reload, Vue yang handle submit ✅ -->
<form @submit.prevent="handleLogin">
```

`.prevent` adalah shorthand dari `event.preventDefault()` di JavaScript biasa.

---

> ✅ **Bab 4 Selesai!**
> Kamu sudah bisa membuat sistem login yang menyimpan token dan data user, serta logout yang membersihkan semua data session. Di bab terakhir, kita akan membangun Admin Panel dengan fitur CRUD lengkap!

**➡️ Lanjut ke [BAB 5 — Admin Panel CRUD](./bab-5-crud.md)**
