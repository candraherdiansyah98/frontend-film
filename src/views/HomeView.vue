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

    <!-- Tampil saat terjadi error (misalnya server tidak jalan) -->
    <div v-else-if="error" class="alert alert-error">
      ❌ {{ error }}
    </div>

    <!-- Tampil grid film saat data sudah berhasil diambil -->
    <div v-else class="film-grid">
      <div
        v-for="film in films"
        :key="film.id"
        class="film-card"
      >
        <!-- Poster film -->
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
// ============================================================

import { ref, onMounted } from 'vue'
import { RouterLink }     from 'vue-router'
import api                from '../utils/api'

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

    // Kirim GET request ke endpoint public films via utils/api.js
    // api.js sudah punya baseURL, jadi kita cukup tulis path-nya saja
    const response = await api.get('/public/films')

    // Data film ada di response.data.data.data (karena paginated)
    films.value = response.data.data.data

  } catch (err) {
    // Tampilkan pesan error ke user (bukan hanya di console)
    error.value = 'Gagal mengambil data. Pastikan server Laravel sudah berjalan di localhost:8000!'
    console.error('Error:', err)
  } finally {
    // loading dimatikan baik saat sukses maupun error
    loading.value = false
  }
}

// ─── Fungsi Pencarian Film ────────────────────────────────
let searchTimeout = null
const cariFilm = () => {
  // Debounce: tunggu 500ms setelah user berhenti mengetik
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

      // Kirim GET ke endpoint pencarian via utils/api.js
      const response = await api.get('/public/search', {
        params: { keyword: keyword.value }
      })
      films.value = response.data.data.data

    } catch (err) {
      // Tampilkan error ke user agar tidak diam saja saat gagal
      error.value = 'Pencarian gagal. Pastikan server Laravel sedang berjalan!'
      console.error('Error cariFilm:', err)
    } finally {
      loading.value = false
    }
  }, 500)
}

// ─── Lifecycle Hook ───────────────────────────────────────
// onMounted: kode ini dijalankan SETELAH komponen tampil di browser
onMounted(() => {
  ambilDataFilm()
})
</script>

<style scoped>
/* ─── Header ─────────────────────────────────────────── */
.page-header {
  margin-bottom: 28px;
}

.page-header h1 {
  font-size: 32px;
  color: var(--color-dark);
  font-weight: 700;
}

.subtitle {
  color: #888;
  margin-top: 4px;
}

/* ─── Search Box ─────────────────────────────────────── */
.search-box {
  margin-bottom: 28px;
}

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

/* ─── Film Grid ──────────────────────────────────────── */
.film-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

/* ─── Film Card ──────────────────────────────────────── */
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

/* ─── Poster & Overlay ───────────────────────────────── */
.film-poster {
  position: relative;
  overflow: hidden;
  height: 270px;
}

.film-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.film-card:hover .film-poster img {
  transform: scale(1.05);
}

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

.film-card:hover .film-overlay {
  opacity: 1;
}

/* ─── Film Info ──────────────────────────────────────── */
.film-info {
  padding: 14px;
}

.film-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.film-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.badge {
  background: #fee2e2;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
}

.film-year, .film-director, .film-duration {
  font-size: 12px;
  color: #777;
}

/* ─── Empty State ────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 60px;
  color: #aaa;
  font-size: 18px;
}
</style>
