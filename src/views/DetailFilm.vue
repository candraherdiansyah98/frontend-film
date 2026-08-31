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
//   - api.get()   : ambil data dari API via utils/api.js
// ============================================================

import { ref, onMounted }       from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import api                      from '../utils/api'

// useRoute() digunakan untuk membaca URL saat ini
// Misal URL = /film/5  →  route.params.id = "5"
const route  = useRoute()
const filmId = route.params.id

const film    = ref(null)
const actors  = ref([])
const loading = ref(true)
const error   = ref(null)

const ambilDetailFilm = async () => {
  try {
    // Kirim GET request ke endpoint public films via utils/api.js
    // api.js sudah punya baseURL, jadi kita cukup tulis path-nya saja
    const response = await api.get(`/public/films/${filmId}`)

    film.value   = response.data.film
    actors.value = response.data.actors

  } catch (err) {
    // Tampilkan pesan error yang sesuai ke user
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
.btn-back {
  display: inline-block;
  margin-bottom: 24px;
  color: #555;
  font-size: 14px;
}

.btn-back:hover { color: var(--color-primary); text-decoration: none; }

/* ─── Layout Detail ──────────────────────────────────── */
.detail-wrapper {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  flex-wrap: wrap;
}

/* ─── Poster ─────────────────────────────────────────── */
.detail-poster {
  position: relative;
  flex-shrink: 0;
}

.detail-poster img {
  width: 260px;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  display: block;
}

.genre-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: var(--color-primary);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

/* ─── Info ───────────────────────────────────────────── */
.detail-info {
  flex: 1;
  min-width: 280px;
}

.detail-info h1 {
  font-size: 30px;
  color: var(--color-dark);
  margin-bottom: 20px;
  line-height: 1.3;
}

.meta-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.meta-item {
  display: flex;
  gap: 12px;
  font-size: 14px;
}

.meta-label {
  font-weight: 600;
  color: #555;
  min-width: 130px;
}

/* ─── Deskripsi ──────────────────────────────────────── */
.deskripsi {
  margin-bottom: 24px;
}

.deskripsi h3, .aktor-section h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--color-dark);
}

.deskripsi p {
  font-size: 14px;
  color: #555;
  line-height: 1.8;
}

/* ─── Aktor ──────────────────────────────────────────── */
.aktor-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.aktor-chip {
  background: #f0f0f8;
  color: #444;
  font-size: 13px;
  padding: 5px 14px;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
}
</style>
