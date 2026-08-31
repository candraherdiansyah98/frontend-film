<template>
  <div class="container">
    <div class="page-title">
      <RouterLink to="/dashboard" class="btn-back">← Dashboard</RouterLink>
      <h1>➕ Tambah Film Baru</h1>
    </div>

    <!-- Alert Sukses -->
    <div v-if="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>
    <!-- Alert Error -->
    <div v-if="errorMsg" class="alert alert-error">❌ {{ errorMsg }}</div>

    <form @submit.prevent="handleSubmit" class="form-card">

      <!-- Judul Film -->
      <div class="form-group">
        <label for="title">🎬 Judul Film <span class="required">*</span></label>
        <input id="title" v-model="form.title" type="text"
          placeholder="Contoh: Avengers Endgame" required />
      </div>

      <!-- Genre -->
      <div class="form-group">
        <label for="genre">🎭 Genre <span class="required">*</span></label>
        <select id="genre" v-model="form.id_genre" required>
          <option value="">-- Pilih Genre --</option>
          <option v-for="genre in genres" :key="genre.id" :value="genre.id">
            {{ genre.nama_genre }}
          </option>
        </select>
      </div>

      <!-- Sutradara -->
      <div class="form-group">
        <label for="sutradara">🎥 Sutradara <span class="required">*</span></label>
        <input id="sutradara" v-model="form.sutradara" type="text"
          placeholder="Nama Sutradara" required />
      </div>

      <!-- 2 Kolom: Tanggal & Durasi -->
      <div class="form-row">
        <div class="form-group">
          <label for="tanggal">📅 Tanggal Rilis <span class="required">*</span></label>
          <input id="tanggal" v-model="form.tanggal_rilis" type="date" required />
        </div>
        <div class="form-group">
          <label for="durasi">⏱️ Durasi (menit) <span class="required">*</span></label>
          <input id="durasi" v-model="form.durasi" type="number"
            placeholder="120" min="1" required />
        </div>
      </div>

      <!-- URL Poster -->
      <div class="form-group">
        <label for="poster">🖼️ URL Poster <span class="required">*</span></label>
        <input id="poster" v-model="form.poster" type="text"
          placeholder="https://..." required />
        <!-- Preview poster jika URL diisi -->
        <img v-if="form.poster" :src="form.poster" alt="Preview Poster"
          class="poster-preview" @error="posterError = true" />
      </div>

      <!-- Pilih Aktor (Checkbox) -->
      <div class="form-group">
        <label>🎭 Pilih Aktor <span class="required">*</span></label>
        <p v-if="aktors.length === 0" class="hint">Memuat data aktor...</p>
        <div class="checkbox-grid">
          <label v-for="aktor in aktors" :key="aktor.id" class="checkbox-item">
            <input type="checkbox" :value="aktor.id" v-model="form.id_aktor" />
            <span>{{ aktor.nama_aktor }}</span>
          </label>
        </div>
        <p class="hint">Pilih minimal 1 aktor</p>
      </div>

      <!-- Deskripsi -->
      <div class="form-group">
        <label for="deskripsi">📖 Deskripsi / Sinopsis <span class="required">*</span></label>
        <textarea id="deskripsi" v-model="form.deskripsi" rows="5"
          placeholder="Tulis sinopsis film..." required></textarea>
      </div>

      <!-- Tombol Submit -->
      <div class="form-actions">
        <RouterLink to="/kelola-film" class="btn btn-secondary">Batal</RouterLink>
        <button type="submit" :disabled="loading" class="btn btn-primary">
          <span v-if="loading">⏳ Menyimpan...</span>
          <span v-else>💾 Simpan Film</span>
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
// ============================================================
// TambahFilm.vue — Form Tambah Film Baru (POST Request)
// ============================================================
// Konsep yang dipelajari:
//   - api.post()    : kirim data dengan Bearer Token otomatis
//   - Promise.all() : panggil 2 API sekaligus (paralel)
//   - v-model checkbox (array)
//   - <select> dengan v-for untuk opsi dropdown
// ============================================================

import { ref, reactive, onMounted } from 'vue'
import { RouterLink, useRouter }    from 'vue-router'
import api                          from '../utils/api'

const router     = useRouter()
const loading    = ref(false)
const successMsg = ref('')
const errorMsg   = ref('')
const genres     = ref([])
const aktors     = ref([])
const posterError = ref(false)

// Form data dengan reactive() karena banyak field
const form = reactive({
  title:        '',
  id_genre:     '',
  sutradara:    '',
  tanggal_rilis:'',
  durasi:       '',
  poster:       '',
  deskripsi:    '',
  id_aktor:     [],   // array karena bisa pilih banyak aktor
})

// ─── Proteksi halaman ─────────────────────────────────────
onMounted(async () => {
  if (!localStorage.getItem('token')) {
    router.push('/login')
    return
  }
  await ambilDataAwal()
})

// ─── Ambil genre & aktor secara paralel (lebih cepat) ──────
const ambilDataAwal = async () => {
  try {
    // Promise.all: jalankan 2 request BERSAMAAN (bukan satu per satu)
    const [genreRes, aktorRes] = await Promise.all([
      api.get('/genre'),
      api.get('/aktor'),
    ])

    genres.value = genreRes.data.data
    aktors.value = aktorRes.data.data

  } catch (err) {
    errorMsg.value = 'Gagal memuat data genre/aktor!'
    console.error(err)
  }
}

// ─── Submit Form: Tambah Film ─────────────────────────────
const handleSubmit = async () => {
  // Validasi minimal 1 aktor dipilih
  if (form.id_aktor.length === 0) {
    errorMsg.value = 'Pilih minimal 1 aktor!'
    return
  }

  try {
    loading.value  = true
    errorMsg.value = ''
    successMsg.value = ''

    // Kirim POST request ke /films dengan Bearer Token (otomatis dari api.js)
    await api.post('/films', form)

    successMsg.value = 'Film berhasil ditambahkan!'

    // Reset semua field form ke nilai awal
    Object.assign(form, {
      title: '', id_genre: '', sutradara: '',
      tanggal_rilis: '', durasi: '', poster: '',
      deskripsi: '', id_aktor: []
    })

    // Scroll ke atas untuk lihat pesan sukses
    window.scrollTo({ top: 0, behavior: 'smooth' })

  } catch (err) {
    if (err.response?.status === 422) {
      // Ambil pesan validasi pertama dari Laravel
      const errors = err.response.data.errors
      const firstError = Object.values(errors)[0][0]
      errorMsg.value = firstError
    } else if (err.response?.status === 401) {
      errorMsg.value = 'Sesi habis. Silakan login ulang.'
      router.push('/login')
    } else {
      errorMsg.value = err.response?.data?.message || 'Gagal menyimpan film!'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-title {
  margin-bottom: 24px;
}

.page-title h1 {
  font-size: 28px;
  color: #1a1a2e;
  margin-top: 12px;
}

.btn-back {
  color: #666;
  font-size: 14px;
  display: inline-block;
  margin-bottom: 6px;
}

.btn-back:hover { color: #e94560; text-decoration: none; }

/* Form Card */
.form-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 720px;
}

/* Form Groups */
.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.required { color: #e94560; margin-left: 2px; }

input, select, textarea {
  padding: 11px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus, select:focus, textarea:focus {
  border-color: #e94560;
  box-shadow: 0 0 0 3px rgba(233,69,96,0.1);
}

/* Poster preview */
.poster-preview {
  margin-top: 10px;
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

/* Checkbox Aktor */
.checkbox-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f4f4f8;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: normal;
  transition: background 0.2s;
}

.checkbox-item:has(input:checked) {
  background: #fee2e2;
  color: #e94560;
  font-weight: 600;
}

.hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* Actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.btn-secondary {
  background: #f0f0f0;
  color: #555;
  padding: 10px 24px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.btn-primary {
  padding: 10px 28px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
