# 🎬 Modul Frontend CineVue — BAB 3
## Halaman Publik & Fetch Data dari API

---

> 💡 **Yang akan kita buat di bab ini:**
> - `utils/api.js` — helper Axios dengan token otomatis
> - `HomeView.vue` — halaman daftar film + fitur pencarian
> - `DetailFilm.vue` — halaman detail film berdasarkan ID

---

## 3.1 Apa itu Axios?

**Axios** adalah library JavaScript untuk mengirim HTTP request (GET, POST, PUT, DELETE) ke server/API dengan mudah.

```bash
# Install axios
npm install axios
```

Perbandingan fetch biasa vs axios:

```javascript
// ❌ Cara biasa dengan fetch (lebih panjang)
const response = await fetch('http://localhost:8000/api/public/films')
const data = await response.json()

// ✅ Dengan Axios (lebih ringkas dan ada fitur interceptor)
const response = await axios.get('/public/films')
const data = response.data
```

---

## 3.2 File `src/utils/api.js` — Helper Axios

File ini membuat satu "instance" axios yang sudah dikonfigurasi dengan:
- `baseURL` → tidak perlu tulis URL lengkap di setiap request
- **Interceptor** → token Bearer otomatis ditambahkan ke setiap request

```javascript
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
```

**Cara pakai:**
```javascript
// Di komponen manapun, cukup import api dan langsung pakai
import api from '../../utils/api'

// GET — ambil data
const response = await api.get('/public/films')

// POST — kirim data baru
await api.post('/films', formData)

// PUT — update data
await api.put('/films/1', formData)

// DELETE — hapus data
await api.delete('/films/1')
```

---

## 3.3 Halaman Utama — `src/views/Public/HomeView.vue`

Halaman ini menampilkan daftar semua film dalam format grid, lengkap dengan fitur pencarian.

```vue
<template>
  <div class="container">
    <div class="page-header">
      <h1>🎬 Daftar Film</h1>
      <p class="subtitle">Temukan film favoritmu</p>
    </div>

    <!-- Kotak pencarian -->
    <div class="search-box">
      <input
        v-model="keyword"
        type="text"
        placeholder="🔍 Cari judul film..."
        @input="cariFilm"
      />
    </div>

    <!-- Tampil saat data sedang dimuat -->
    <p v-if="loading" class="loading-text">⏳ Memuat data film...</p>

    <!-- Tampil saat terjadi error -->
    <div v-else-if="error" class="alert alert-error">
      ❌ {{ error }}
    </div>

    <!-- Grid film saat data berhasil diambil -->
    <div v-else class="film-grid">
      <div
        v-for="film in films"
        :key="film.id"
        class="film-card"
      >
        <!-- Poster film dengan overlay -->
        <div class="film-poster">
          <img :src="film.poster" :alt="film.title" />
          <div class="film-overlay">
            <RouterLink :to="'/film/' + film.id" class="btn btn-primary">
              Lihat Detail
            </RouterLink>
          </div>
        </div>

        <!-- Info film -->
        <div class="film-info">
          <h3 class="film-title">{{ film.title }}</h3>
          <div class="film-meta">
            <span class="badge">{{ film.nama_genre }}</span>
            <span class="film-year">📅 {{ film.tanggal_rilis?.substring(0, 4) }}</span>
          </div>
          <p class="film-director">🎬 {{ film.sutradara }}</p>
          <p class="film-duration">⏱️ {{ film.durasi }} menit</p>
        </div>
      </div>
    </div>

    <!-- Pesan jika tidak ada film ditemukan -->
    <div v-if="!loading && films.length === 0 && !error" class="empty-state">
      <p>😕 Tidak ada film yang ditemukan.</p>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// HomeView.vue — Halaman utama: Daftar Film (GET Public)
// ============================================================
// Konsep yang dipelajari:
//   - ref()       : variabel reaktif
//   - onMounted() : jalankan kode saat halaman dimuat
//   - v-for       : loop data di template
//   - v-if/v-else : tampil kondisional
//   - api.get()   : ambil data dari API via utils/api.js
//   - Debounce    : tunda eksekusi saat user masih mengetik
// ============================================================

import { ref, onMounted } from 'vue'
import { RouterLink }     from 'vue-router'
import api                from '../../utils/api'

// ─── Variabel Reaktif ─────────────────────────────────────
const films   = ref([])    // Array film yang akan ditampilkan
const loading = ref(true)  // Status loading (true = masih memuat)
const error   = ref(null)  // Pesan error jika gagal ambil data
const keyword = ref('')    // Kata kunci pencarian

// ─── Fungsi Ambil Data Film ───────────────────────────────
const ambilDataFilm = async () => {
  try {
    loading.value = true
    error.value   = null

    // Kirim GET request ke endpoint public films
    const response = await api.get('/public/films')

    // Data film ada di response.data.data.data (karena paginated)
    films.value = response.data.data.data

  } catch (err) {
    error.value = 'Gagal mengambil data. Pastikan server Laravel sudah berjalan!'
    console.error('Error:', err)
  } finally {
    // loading dimatikan baik saat sukses maupun error
    loading.value = false
  }
}

// ─── Fungsi Pencarian Film dengan Debounce ─────────────────
// Debounce = tunggu 500ms setelah user berhenti mengetik
// Tujuannya: tidak spam request API setiap ketik 1 huruf
let searchTimeout = null
const cariFilm = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    if (keyword.value.trim() === '') {
      // Jika search kosong, tampilkan semua film
      ambilDataFilm()
      return
    }

    try {
      loading.value = true
      error.value   = null

      const response = await api.get('/public/search', {
        params: { keyword: keyword.value }
      })
      films.value = response.data.data.data

    } catch (err) {
      error.value = 'Pencarian gagal. Pastikan server Laravel sedang berjalan!'
      console.error('Error cariFilm:', err)
    } finally {
      loading.value = false
    }
  }, 500)  // Tunggu 500ms setelah ketikan terakhir
}

// ─── Lifecycle Hook ───────────────────────────────────────
// onMounted: kode ini dijalankan SETELAH komponen tampil di browser
onMounted(() => {
  ambilDataFilm()
})
</script>

<style scoped>
.page-header { margin-bottom: 28px; }
.page-header h1 { font-size: 32px; color: var(--color-dark); font-weight: 700; }
.subtitle { color: #888; margin-top: 4px; }

/* Search Box */
.search-box { margin-bottom: 28px; }
.search-box input {
  width: 100%;
  max-width: 480px;
  padding: 12px 18px;
  border: 2px solid #e0e0e0;
  border-radius: 50px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-box input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.15);
}

/* Film Grid */
.film-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

/* Film Card */
.film-card {
  background: white;
  border-radius: 14px;
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: transform 0.25s, box-shadow 0.25s;
}
.film-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
}

/* Poster & Overlay */
.film-poster { position: relative; overflow: hidden; height: 270px; }
.film-poster img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.film-card:hover .film-poster img { transform: scale(1.05); }

.film-overlay {
  position: absolute;
  inset: 0;
  background: rgba(26, 26, 46, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}
.film-card:hover .film-overlay { opacity: 1; }

/* Film Info */
.film-info { padding: 14px; }
.film-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.film-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
.badge { background: #fee2e2; color: var(--color-primary); font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; }
.film-year, .film-director, .film-duration { font-size: 12px; color: #777; }

/* Empty State */
.empty-state { text-align: center; padding: 60px; color: #aaa; font-size: 18px; }
</style>
```

---

## 3.4 Halaman Detail Film — `src/views/Public/DetailFilm.vue`

Halaman ini menampilkan detail satu film berdasarkan ID dari URL.

```vue
<template>
  <div class="container">
    <RouterLink to="/" class="btn-back">← Kembali ke Home</RouterLink>

    <!-- Loading state -->
    <p v-if="loading" class="loading-text">⏳ Memuat detail film...</p>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-error">❌ {{ error }}</div>

    <!-- Konten detail film -->
    <div v-else-if="film" class="detail-wrapper">

      <!-- Kolom Kiri: Poster -->
      <div class="detail-poster">
        <img :src="film.poster" :alt="film.title" />
        <span class="genre-badge">{{ film.nama_genre }}</span>
      </div>

      <!-- Kolom Kanan: Info -->
      <div class="detail-info">
        <h1>{{ film.title }}</h1>

        <div class="meta-list">
          <div class="meta-item">
            <span class="meta-label">🎬 Sutradara</span>
            <span>{{ film.sutradara }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">⏱️ Durasi</span>
            <span>{{ film.durasi }} menit</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">📅 Tanggal Rilis</span>
            <span>{{ film.tanggal_rilis }}</span>
          </div>
        </div>

        <div class="deskripsi">
          <h3>📖 Sinopsis</h3>
          <p>{{ film.deskripsi }}</p>
        </div>

        <!-- Daftar pemeran (aktor) -->
        <div class="aktor-section" v-if="actors.length > 0">
          <h3>🎭 Pemeran</h3>
          <div class="aktor-chips">
            <span
              v-for="aktor in actors"
              :key="aktor.id"
              class="aktor-chip"
            >
              {{ aktor.nama_aktor }}
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// ============================================================
// DetailFilm.vue — Halaman Detail Film (GET Public)
// ============================================================
// Konsep yang dipelajari:
//   - useRoute()  : ambil parameter dari URL (/film/:id)
//   - Conditional rendering dengan v-if / v-else-if / v-else
//   - api.get()   : ambil data dari API
// ============================================================

import { ref, onMounted }       from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import api                      from '../../utils/api'

// useRoute() membaca informasi URL saat ini
// Contoh URL = /film/5  →  route.params.id = "5"
const route  = useRoute()
const filmId = route.params.id   // Ambil nilai :id dari URL

const film    = ref(null)   // Data film (null = belum dimuat)
const actors  = ref([])     // Daftar aktor
const loading = ref(true)
const error   = ref(null)

const ambilDetailFilm = async () => {
  try {
    // Kirim GET request dengan filmId dari URL
    const response = await api.get(`/public/films/${filmId}`)

    film.value   = response.data.film    // Data film
    actors.value = response.data.actors  // Data aktor-aktor

  } catch (err) {
    // Tampilkan pesan error yang sesuai
    error.value = err.response?.status === 404
      ? 'Film tidak ditemukan!'
      : 'Gagal memuat data film. Pastikan server Laravel sudah berjalan!'
    console.error('Error ambilDetailFilm:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  ambilDetailFilm()
})
</script>

<style scoped>
.btn-back { display: inline-block; margin-bottom: 24px; color: #555; font-size: 14px; }
.btn-back:hover { color: var(--color-primary); text-decoration: none; }

/* Layout Detail */
.detail-wrapper { display: flex; gap: 40px; align-items: flex-start; flex-wrap: wrap; }

/* Poster */
.detail-poster { position: relative; flex-shrink: 0; }
.detail-poster img { width: 260px; border-radius: 14px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); display: block; }
.genre-badge {
  position: absolute; top: 12px; left: 12px;
  background: var(--color-primary); color: white;
  font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px;
}

/* Info */
.detail-info { flex: 1; min-width: 280px; }
.detail-info h1 { font-size: 30px; color: var(--color-dark); margin-bottom: 20px; line-height: 1.3; }

.meta-list {
  display: flex; flex-direction: column; gap: 10px;
  margin-bottom: 24px; background: white; padding: 16px 20px;
  border-radius: 12px; box-shadow: var(--shadow);
}
.meta-item { display: flex; gap: 12px; font-size: 14px; }
.meta-label { font-weight: 600; color: #555; min-width: 130px; }

.deskripsi { margin-bottom: 24px; }
.deskripsi h3, .aktor-section h3 { font-size: 16px; font-weight: 700; margin-bottom: 10px; color: var(--color-dark); }
.deskripsi p { font-size: 14px; color: #555; line-height: 1.8; }

/* Aktor */
.aktor-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.aktor-chip {
  background: #f0f0f8; color: #444;
  font-size: 13px; padding: 5px 14px;
  border-radius: 20px; border: 1px solid #e0e0e0;
}
</style>
```

---

## 3.5 Rangkuman Alur Kerja Fetch Data

```
Komponen tampil di browser
        │
        ▼
   onMounted() dipanggil
        │
        ▼
   loading = true (tampilkan spinner)
        │
        ▼
   api.get('/public/films') dikirim ke Laravel
        │
        ├─── Berhasil ──► films = response.data.data.data
        │                 loading = false
        │                 v-else aktif → tampilkan grid film ✅
        │
        └─── Gagal ────► error = 'Pesan error...'
                          loading = false
                          v-else-if="error" aktif → tampilkan pesan error ❌
```

---

> ✅ **Bab 3 Selesai!**
> Kamu sudah bisa mengambil dan menampilkan data dari API Laravel di halaman Vue.js. Di bab berikutnya kita akan belajar sistem login dan autentikasi.

**➡️ Lanjut ke [BAB 4 — Autentikasi (Login & Logout)](./bab-4-auth.md)**
