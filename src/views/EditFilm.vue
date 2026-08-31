<template>
  <div class="container">
    <div class="page-title">
      <RouterLink to="/kelola-film" class="btn-back">← Batal Edit</RouterLink>
      <h1>✏️ Edit Film</h1>
    </div>

    <!-- Alert Sukses -->
    <div v-if="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>
    <!-- Alert Error -->
    <div v-if="errorMsg" class="alert alert-error">❌ {{ errorMsg }}</div>

    <div v-if="loadingData" class="loading-state">
      ⏳ Memuat data film...
    </div>

    <form v-else @submit.prevent="handleUpdate" class="form-card">

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
        <!-- Preview poster -->
        <img v-if="form.poster" :src="form.poster" alt="Preview Poster" class="poster-preview" />
      </div>

      <!-- Pilih Aktor (Checkbox) -->
      <div class="form-group">
        <label>🎭 Pilih Aktor <span class="required">*</span></label>
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
        <textarea id="deskripsi" v-model="form.deskripsi" rows="5" required></textarea>
      </div>

      <!-- Tombol Submit -->
      <div class="form-actions">
        <button type="submit" :disabled="loadingSubmit" class="btn btn-primary">
          <span v-if="loadingSubmit">⏳ Mengupdate...</span>
          <span v-else>💾 Update Film</span>
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
// ============================================================
// EditFilm.vue — Form Edit Film (PUT Request)
// ============================================================
// Konsep yang dipelajari:
//   - Ambil ID dari URL (useRoute)
//   - GET data spesifik untuk mengisi form (Pre-fill)
//   - api.put() : kirim update data
//   - Array map() : ekstrak array of object jadi array of ID
// ============================================================

import { ref, reactive, onMounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import api from '../utils/api'

const router = useRouter()
const route  = useRoute()

const filmId        = route.params.id
const loadingData   = ref(true)
const loadingSubmit = ref(false)
const successMsg    = ref('')
const errorMsg      = ref('')

const genres = ref([])
const aktors = ref([])

const form = reactive({
  title:         '',
  id_genre:      '',
  sutradara:     '',
  tanggal_rilis: '',
  durasi:        '',
  poster:        '',
  deskripsi:     '',
  id_aktor:      [],
})

onMounted(async () => {
  if (!localStorage.getItem('token')) {
    router.push('/login')
    return
  }
  await ambilDataFilm()
})

const ambilDataFilm = async () => {
  try {
    loadingData.value = true
    
    // Panggil 3 API sekaligus: Data Film Spesifik, Semua Genre, Semua Aktor
    const [filmRes, genreRes, aktorRes] = await Promise.all([
      api.get(`/films/${filmId}`),
      api.get('/genre'),
      api.get('/aktor')
    ])

    genres.value = genreRes.data.data
    aktors.value = aktorRes.data.data

    const filmData = filmRes.data.data

    // Isi data form (Pre-fill)
    form.title         = filmData.title
    form.id_genre      = filmData.id_genre
    form.sutradara     = filmData.sutradara
    form.tanggal_rilis = filmData.tanggal_rilis
    form.durasi        = filmData.durasi
    form.poster        = filmData.poster
    form.deskripsi     = filmData.deskripsi

    // Ekstrak ID aktor yang sudah terpilih
    // API mereturn array of object: [{id: 1, nama: "A"}, {id: 2, nama: "B"}]
    // Kita cuma butuh array ID: [1, 2]
    form.id_aktor = filmData.aktor.map(a => a.id)

  } catch (err) {
    errorMsg.value = 'Gagal memuat data film untuk diedit.'
    console.error(err)
  } finally {
    loadingData.value = false
  }
}

const handleUpdate = async () => {
  if (form.id_aktor.length === 0) {
    errorMsg.value = 'Pilih minimal 1 aktor!'
    return
  }

  try {
    loadingSubmit.value = true
    errorMsg.value      = ''
    successMsg.value    = ''

    // Kirim PUT request ke API
    await api.put(`/films/${filmId}`, form)

    successMsg.value = 'Data film berhasil diupdate!'
    
    // Redirect kembali ke halaman kelola film setelah 2 detik
    setTimeout(() => {
      router.push('/kelola-film')
    }, 2000)

    window.scrollTo({ top: 0, behavior: 'smooth' })

  } catch (err) {
    if (err.response?.status === 422) {
      const errors = err.response.data.errors
      errorMsg.value = Object.values(errors)[0][0]
    } else {
      errorMsg.value = 'Gagal mengupdate film!'
    }
  } finally {
    loadingSubmit.value = false
  }
}
</script>

<style scoped>
/* Style sama seperti TambahFilm.vue */
.page-title { margin-bottom: 24px; }
.page-title h1 { font-size: 28px; color: #1a1a2e; margin-top: 12px; }

.btn-back {
  color: #666;
  font-size: 14px;
  display: inline-block;
  margin-bottom: 6px;
}
.btn-back:hover { color: #e94560; text-decoration: none; }

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

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

label { font-size: 13px; font-weight: 600; color: #333; }
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

.poster-preview {
  margin-top: 10px;
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

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

.hint { font-size: 12px; color: #999; margin-top: 4px; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.btn-primary {
  padding: 10px 28px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #e94560, #c73652);
  color: white;
  transition: opacity 0.2s;
}

.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.loading-state { text-align: center; padding: 40px; color: #777; font-size: 16px; }
</style>
