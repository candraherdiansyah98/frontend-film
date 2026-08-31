# 🎬 Modul Frontend CineVue — BAB 5
## Admin Panel — CRUD Film, Genre & Aktor

---

> 💡 **CRUD = Create, Read, Update, Delete**
> Ini adalah 4 operasi dasar yang hampir selalu ada di setiap aplikasi:
> - **C**reate → Tambah data baru (POST)
> - **R**ead   → Lihat/baca data (GET)
> - **U**pdate → Edit data (PUT)
> - **D**elete → Hapus data (DELETE)

---

## 5.1 Dashboard Admin — `src/views/Admin/DashboardView.vue`

Halaman ini adalah pusat navigasi admin, menampilkan menu-menu untuk mengelola data.

```vue
<template>
  <div class="dashboard-page">

    <!-- Header Dashboard -->
    <div class="dashboard-header">
      <div class="welcome-box">
        <h1>👋 Selamat Datang, {{ user?.name }}!</h1>
        <p>{{ user?.email }} · Admin Panel</p>
      </div>
    </div>

    <!-- Menu Card Grid -->
    <div class="menu-grid">
      <!-- Film -->
      <RouterLink to="/kelola-film" class="menu-card">
        <span class="menu-icon">🗂️</span>
        <h3>Kelola Film</h3>
        <p>Lihat, edit, dan hapus data film</p>
      </RouterLink>

      <RouterLink to="/tambah-film" class="menu-card menu-card--green">
        <span class="menu-icon">➕</span>
        <h3>Tambah Film</h3>
        <p>Input film baru ke database</p>
      </RouterLink>

      <!-- Genre -->
      <RouterLink to="/kelola-genre" class="menu-card menu-card--purple">
        <span class="menu-icon">🎭</span>
        <h3>Kelola Genre</h3>
        <p>Lihat, edit, dan hapus data genre</p>
      </RouterLink>

      <!-- Aktor -->
      <RouterLink to="/kelola-aktor" class="menu-card menu-card--orange">
        <span class="menu-icon">🌟</span>
        <h3>Kelola Aktor</h3>
        <p>Lihat, edit, dan hapus data aktor</p>
      </RouterLink>

      <RouterLink to="/" class="menu-card menu-card--blue">
        <span class="menu-icon">🎬</span>
        <h3>Lihat Katalog</h3>
        <p>Buka halaman publik film</p>
      </RouterLink>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted }        from 'vue'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()
const user   = ref(null)

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
})
</script>

<style scoped>
.dashboard-page { max-width: 1000px; margin: 0 auto; padding: 32px 24px; }

.dashboard-header {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  padding: 28px 32px;
  border-radius: 16px;
  margin-bottom: 32px;
  color: white;
}
.welcome-box h1 { font-size: 22px; margin-bottom: 6px; }
.welcome-box p  { color: #aaa; font-size: 14px; }

.menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }

.menu-card {
  display: block;
  background: white;
  padding: 28px 24px;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  text-decoration: none;
  color: inherit;
  border-left: 5px solid #e94560;
  transition: transform 0.2s, box-shadow 0.2s;
}
.menu-card--green  { border-left-color: #27ae60; }
.menu-card--blue   { border-left-color: #2980b9; }
.menu-card--purple { border-left-color: #8e44ad; }
.menu-card--orange { border-left-color: #f39c12; }

.menu-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(0,0,0,0.12); text-decoration: none; }

.menu-icon { font-size: 36px; display: block; margin-bottom: 12px; }
.menu-card h3 { font-size: 17px; color: #1a1a2e; margin-bottom: 6px; }
.menu-card p  { font-size: 13px; color: #888; }
</style>
```

---

## 5.2 CRUD Film

### A. `KelolaFilm.vue` — Tabel Daftar Film (Read + Delete)

```vue
<template>
  <div class="container">
    <div class="page-title">
      <RouterLink to="/dashboard" class="btn-back">← Dashboard</RouterLink>
      <div class="title-row">
        <h1>🗂️ Kelola Film</h1>
        <RouterLink to="/tambah-film" class="btn btn-primary">➕ Tambah Film</RouterLink>
      </div>
    </div>

    <div v-if="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>
    <p v-if="loading" class="loading-text">⏳ Memuat data film...</p>

    <div v-else class="table-wrapper">
      <table class="film-table">
        <thead>
          <tr>
            <th>No</th><th>Poster</th><th>Judul Film</th>
            <th>Genre</th><th>Sutradara</th><th>Durasi</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="films.length === 0">
            <td colspan="7" class="empty-row">Belum ada data film.</td>
          </tr>
          <tr v-for="(film, index) in films" :key="film.id">
            <td>{{ index + 1 }}</td>
            <td><img :src="film.poster" :alt="film.title" class="table-poster" /></td>
            <td class="film-title-cell">{{ film.title }}</td>
            <td><span class="badge-genre">{{ film.genre?.nama_genre }}</span></td>
            <td>{{ film.sutradara }}</td>
            <td>{{ film.durasi }} mnt</td>
            <td>
              <div class="action-btns">
                <RouterLink :to="'/edit-film/' + film.id" class="btn-action btn-edit">✏️ Edit</RouterLink>
                <button @click="hapusFilm(film.id, film.title)"
                  :disabled="deletingId === film.id" class="btn-action btn-delete">
                  <span v-if="deletingId === film.id">⏳</span>
                  <span v-else>🗑️ Hapus</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-box">
        <h3>⚠️ Konfirmasi Hapus</h3>
        <p>Yakin ingin menghapus film:</p>
        <p class="modal-film-name">❝ {{ filmToDelete?.title }} ❞</p>
        <p class="modal-warning">Tindakan ini tidak bisa dibatalkan!</p>
        <div class="modal-actions">
          <button @click="showModal = false" class="btn-modal-cancel">Batal</button>
          <button @click="konfirmasiHapus" class="btn-modal-delete">🗑️ Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted }        from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api                       from '../../../utils/api'

const router       = useRouter()
const films        = ref([])
const loading      = ref(true)
const successMsg   = ref('')
const deletingId   = ref(null)
const showModal    = ref(false)
const filmToDelete = ref(null)

onMounted(async () => {
  await ambilFilm()
})

const ambilFilm = async () => {
  try {
    loading.value = true
    const response = await api.get('/films')
    films.value = response.data.data
  } catch (err) {
    console.error('Error ambil film:', err)
  } finally {
    loading.value = false
  }
}

// Tampilkan modal konfirmasi sebelum hapus
const hapusFilm = (id, title) => {
  filmToDelete.value = { id, title }
  showModal.value    = true
}

// Eksekusi hapus setelah user klik "Hapus" di modal
const konfirmasiHapus = async () => {
  const id = filmToDelete.value.id
  showModal.value = false

  try {
    deletingId.value = id
    await api.delete(`/films/${id}`)

    // Hapus dari array lokal (tampilan update tanpa reload)
    films.value = films.value.filter(film => film.id !== id)

    successMsg.value = `Film "${filmToDelete.value.title}" berhasil dihapus!`
    setTimeout(() => { successMsg.value = '' }, 3000)

  } catch (err) {
    alert('Gagal menghapus film! ' + (err.response?.data?.message || ''))
  } finally {
    deletingId.value   = null
    filmToDelete.value = null
  }
}
</script>

<style scoped>
.page-title { margin-bottom: 24px; }
.title-row { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; flex-wrap: wrap; gap: 12px; }
.title-row h1 { font-size: 26px; color: #1a1a2e; }
.btn-back { color: #666; font-size: 14px; }
.btn-back:hover { color: #e94560; text-decoration: none; }

.table-wrapper { background: white; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.film-table { width: 100%; border-collapse: collapse; }
.film-table th { background: #1a1a2e; color: white; padding: 14px 16px; text-align: left; font-size: 13px; font-weight: 600; }
.film-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; vertical-align: middle; }
.film-table tr:last-child td { border-bottom: none; }
.film-table tr:hover td { background: #fafafa; }

.table-poster { width: 44px; height: 60px; object-fit: cover; border-radius: 6px; display: block; }
.film-title-cell { font-weight: 600; color: #1a1a2e; max-width: 200px; }
.badge-genre { background: #fee2e2; color: #e94560; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
.empty-row { text-align: center; color: #aaa; padding: 40px !important; }

.action-btns { display: flex; gap: 8px; align-items: center; }
.btn-action { padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; text-decoration: none; display: inline-block; transition: opacity 0.2s; }
.btn-edit   { background: #ebf5fb; color: #2980b9; }
.btn-delete { background: #fdedec; color: #e74c3c; }
.btn-action:hover { opacity: 0.75; }
.btn-action:disabled { opacity: 0.5; cursor: not-allowed; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-box { background: white; padding: 32px; border-radius: 16px; max-width: 400px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; }
.modal-box h3 { font-size: 20px; margin-bottom: 12px; }
.modal-box p  { color: #555; font-size: 14px; }
.modal-film-name { font-weight: 700; color: #1a1a2e; font-size: 15px !important; margin: 10px 0; }
.modal-warning { color: #e74c3c !important; font-size: 13px !important; margin-bottom: 20px; }
.modal-actions { display: flex; gap: 12px; justify-content: center; }
.btn-modal-cancel { padding: 10px 24px; background: #f0f0f0; color: #555; border: none; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit; }
.btn-modal-delete { padding: 10px 24px; background: #e74c3c; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit; transition: background 0.2s; }
.btn-modal-delete:hover { background: #c0392b; }
</style>
```

### B. `TambahFilm.vue` — Form Tambah Film (Create)

```vue
<template>
  <div class="container">
    <div class="page-title">
      <RouterLink to="/dashboard" class="btn-back">← Dashboard</RouterLink>
      <h1>➕ Tambah Film Baru</h1>
    </div>

    <div v-if="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>
    <div v-if="errorMsg"   class="alert alert-error">❌ {{ errorMsg }}</div>

    <form @submit.prevent="handleSubmit" class="form-card">
      <div class="form-group">
        <label>🎬 Judul Film <span class="required">*</span></label>
        <input v-model="form.title" type="text" placeholder="Contoh: Avengers Endgame" required />
      </div>

      <div class="form-group">
        <label>🎭 Genre <span class="required">*</span></label>
        <select v-model="form.id_genre" required>
          <option value="">-- Pilih Genre --</option>
          <!-- v-for untuk mengisi dropdown dari data API -->
          <option v-for="genre in genres" :key="genre.id" :value="genre.id">
            {{ genre.nama_genre }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>🎥 Sutradara <span class="required">*</span></label>
        <input v-model="form.sutradara" type="text" placeholder="Nama Sutradara" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>📅 Tanggal Rilis <span class="required">*</span></label>
          <input v-model="form.tanggal_rilis" type="date" required />
        </div>
        <div class="form-group">
          <label>⏱️ Durasi (menit) <span class="required">*</span></label>
          <input v-model="form.durasi" type="number" placeholder="120" min="1" required />
        </div>
      </div>

      <div class="form-group">
        <label>🖼️ URL Poster <span class="required">*</span></label>
        <input v-model="form.poster" type="text" placeholder="https://..." required />
        <!-- Preview gambar otomatis saat URL diisi -->
        <img v-if="form.poster" :src="form.poster" alt="Preview Poster" class="poster-preview" />
      </div>

      <div class="form-group">
        <label>🎭 Pilih Aktor <span class="required">*</span></label>
        <div class="checkbox-grid">
          <!-- v-model pada checkbox dengan array: nilai terpilih masuk ke id_aktor[] -->
          <label v-for="aktor in aktors" :key="aktor.id" class="checkbox-item">
            <input type="checkbox" :value="aktor.id" v-model="form.id_aktor" />
            <span>{{ aktor.nama_aktor }}</span>
          </label>
        </div>
        <p class="hint">Pilih minimal 1 aktor</p>
      </div>

      <div class="form-group">
        <label>📖 Sinopsis <span class="required">*</span></label>
        <textarea v-model="form.deskripsi" rows="5" placeholder="Tulis sinopsis film..." required></textarea>
      </div>

      <div class="form-actions">
        <RouterLink to="/kelola-film" class="btn-secondary">Batal</RouterLink>
        <button type="submit" :disabled="loading" class="btn btn-primary">
          <span v-if="loading">⏳ Menyimpan...</span>
          <span v-else>💾 Simpan Film</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { RouterLink, useRouter }    from 'vue-router'
import api                          from '../../../utils/api'

const router     = useRouter()
const loading    = ref(false)
const successMsg = ref('')
const errorMsg   = ref('')
const genres     = ref([])
const aktors     = ref([])

// reactive() untuk form dengan banyak field
const form = reactive({
  title:         '',
  id_genre:      '',
  sutradara:     '',
  tanggal_rilis: '',
  durasi:        '',
  poster:        '',
  deskripsi:     '',
  id_aktor:      [],   // Array karena bisa pilih BANYAK aktor
})

onMounted(async () => {
  await ambilDataAwal()
})

// Ambil genre & aktor secara PARALEL (lebih cepat dari satu per satu)
const ambilDataAwal = async () => {
  try {
    // Promise.all: jalankan beberapa request BERSAMAAN
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

const handleSubmit = async () => {
  if (form.id_aktor.length === 0) {
    errorMsg.value = 'Pilih minimal 1 aktor!'
    return
  }

  try {
    loading.value    = true
    errorMsg.value   = ''
    successMsg.value = ''

    // POST request ke /films (token otomatis dari api.js)
    await api.post('/films', form)

    successMsg.value = 'Film berhasil ditambahkan!'

    // Reset semua field form ke nilai awal
    Object.assign(form, {
      title: '', id_genre: '', sutradara: '',
      tanggal_rilis: '', durasi: '', poster: '',
      deskripsi: '', id_aktor: []
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })

  } catch (err) {
    if (err.response?.status === 422) {
      const errors = err.response.data.errors
      errorMsg.value = Object.values(errors)[0][0]
    } else {
      errorMsg.value = err.response?.data?.message || 'Gagal menyimpan film!'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-title { margin-bottom: 24px; }
.page-title h1 { font-size: 28px; color: #1a1a2e; margin-top: 12px; }
.btn-back { color: #666; font-size: 14px; }
.btn-back:hover { color: #e94560; text-decoration: none; }

.form-card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 20px; max-width: 720px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
label { font-size: 13px; font-weight: 600; color: #333; }
.required { color: #e94560; margin-left: 2px; }
input, select, textarea { padding: 11px 14px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s; }
input:focus, select:focus, textarea:focus { border-color: #e94560; box-shadow: 0 0 0 3px rgba(233,69,96,0.1); }
.poster-preview { margin-top: 10px; width: 120px; height: 160px; object-fit: cover; border-radius: 8px; border: 2px solid #e0e0e0; }
.checkbox-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.checkbox-item { display: flex; align-items: center; gap: 6px; background: #f4f4f8; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: normal; transition: background 0.2s; }
.checkbox-item:has(input:checked) { background: #fee2e2; color: #e94560; font-weight: 600; }
.hint { font-size: 12px; color: #999; margin-top: 4px; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid #f0f0f0; }
.btn-secondary { background: #f0f0f0; color: #555; padding: 10px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; }
</style>
```

### C. `EditFilm.vue` — Form Edit Film (Update)

```vue
<template>
  <div class="container">
    <div class="page-title">
      <RouterLink to="/kelola-film" class="btn-back">← Batal Edit</RouterLink>
      <h1>✏️ Edit Film</h1>
    </div>

    <div v-if="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>
    <div v-if="errorMsg"   class="alert alert-error">❌ {{ errorMsg }}</div>

    <div v-if="loadingData" class="loading-text">⏳ Memuat data film...</div>

    <form v-else @submit.prevent="handleUpdate" class="form-card">
      <!-- Field sama persis dengan TambahFilm.vue -->
      <div class="form-group">
        <label>🎬 Judul Film <span class="required">*</span></label>
        <input v-model="form.title" type="text" required />
      </div>

      <div class="form-group">
        <label>🎭 Genre <span class="required">*</span></label>
        <select v-model="form.id_genre" required>
          <option value="">-- Pilih Genre --</option>
          <option v-for="genre in genres" :key="genre.id" :value="genre.id">
            {{ genre.nama_genre }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>🎥 Sutradara <span class="required">*</span></label>
        <input v-model="form.sutradara" type="text" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>📅 Tanggal Rilis <span class="required">*</span></label>
          <input v-model="form.tanggal_rilis" type="date" required />
        </div>
        <div class="form-group">
          <label>⏱️ Durasi (menit) <span class="required">*</span></label>
          <input v-model="form.durasi" type="number" min="1" required />
        </div>
      </div>

      <div class="form-group">
        <label>🖼️ URL Poster <span class="required">*</span></label>
        <input v-model="form.poster" type="text" required />
        <img v-if="form.poster" :src="form.poster" alt="Preview" class="poster-preview" />
      </div>

      <div class="form-group">
        <label>🎭 Pilih Aktor <span class="required">*</span></label>
        <div class="checkbox-grid">
          <label v-for="aktor in aktors" :key="aktor.id" class="checkbox-item">
            <input type="checkbox" :value="aktor.id" v-model="form.id_aktor" />
            <span>{{ aktor.nama_aktor }}</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>📖 Sinopsis <span class="required">*</span></label>
        <textarea v-model="form.deskripsi" rows="5" required></textarea>
      </div>

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
import { ref, reactive, onMounted }           from 'vue'
import { RouterLink, useRouter, useRoute }    from 'vue-router'
import api                                    from '../../../utils/api'

const router = useRouter()
const route  = useRoute()
const filmId = route.params.id   // Ambil :id dari URL

const loadingData   = ref(true)
const loadingSubmit = ref(false)
const successMsg    = ref('')
const errorMsg      = ref('')
const genres        = ref([])
const aktors        = ref([])

const form = reactive({
  title: '', id_genre: '', sutradara: '',
  tanggal_rilis: '', durasi: '', poster: '',
  deskripsi: '', id_aktor: [],
})

onMounted(async () => {
  await ambilDataFilm()
})

const ambilDataFilm = async () => {
  try {
    loadingData.value = true

    // Panggil 3 API sekaligus secara paralel
    const [filmRes, genreRes, aktorRes] = await Promise.all([
      api.get(`/films/${filmId}`),
      api.get('/genre'),
      api.get('/aktor')
    ])

    genres.value = genreRes.data.data
    aktors.value = aktorRes.data.data

    const filmData   = filmRes.data.data

    // Pre-fill form dengan data film yang sudah ada
    form.title         = filmData.title
    form.id_genre      = filmData.id_genre
    form.sutradara     = filmData.sutradara
    form.tanggal_rilis = filmData.tanggal_rilis
    form.durasi        = filmData.durasi
    form.poster        = filmData.poster
    form.deskripsi     = filmData.deskripsi

    // Ekstrak ID aktor: [{id:1, nama:"A"},...] → [1, 2, ...]
    form.id_aktor = filmData.aktor.map(a => a.id)

  } catch (err) {
    errorMsg.value = 'Gagal memuat data film untuk diedit.'
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

    // PUT request untuk update data
    await api.put(`/films/${filmId}`, form)

    successMsg.value = 'Data film berhasil diupdate!'
    setTimeout(() => { router.push('/kelola-film') }, 2000)
    window.scrollTo({ top: 0, behavior: 'smooth' })

  } catch (err) {
    errorMsg.value = 'Gagal mengupdate film!'
  } finally {
    loadingSubmit.value = false
  }
}
</script>
```

---

## 5.3 CRUD Genre

### `KelolaGenre.vue` — Tabel + Hapus

```vue
<template>
  <div class="container">
    <div class="page-title">
      <RouterLink to="/dashboard" class="btn-back">← Dashboard</RouterLink>
      <div class="title-row">
        <h1>🎭 Kelola Genre</h1>
        <RouterLink to="/tambah-genre" class="btn btn-primary">➕ Tambah Genre</RouterLink>
      </div>
    </div>

    <div v-if="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>
    <p v-if="loading" class="loading-text">⏳ Memuat data genre...</p>

    <div v-else class="table-wrapper">
      <table class="film-table">
        <thead><tr><th>No</th><th>Nama Genre</th><th>Aksi</th></tr></thead>
        <tbody>
          <tr v-if="genres.length === 0">
            <td colspan="3" class="empty-row">Belum ada data genre.</td>
          </tr>
          <tr v-for="(genre, index) in genres" :key="genre.id">
            <td>{{ index + 1 }}</td>
            <td class="film-title-cell">{{ genre.nama_genre }}</td>
            <td>
              <div class="action-btns">
                <RouterLink :to="'/edit-genre/' + genre.id" class="btn-action btn-edit">✏️ Edit</RouterLink>
                <button @click="hapusGenre(genre.id, genre.nama_genre)"
                  :disabled="deletingId === genre.id" class="btn-action btn-delete">
                  <span v-if="deletingId === genre.id">⏳</span>
                  <span v-else>🗑️ Hapus</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Hapus -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-box">
        <h3>⚠️ Konfirmasi Hapus</h3>
        <p>Yakin menghapus genre: <strong>{{ genreToDelete?.nama_genre }}</strong>?</p>
        <p class="modal-warning">Tindakan ini tidak bisa dibatalkan!</p>
        <div class="modal-actions">
          <button @click="showModal = false" class="btn-modal-cancel">Batal</button>
          <button @click="konfirmasiHapus" class="btn-modal-delete">🗑️ Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted }        from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api                       from '../../../utils/api'

const router        = useRouter()
const genres        = ref([])
const loading       = ref(true)
const successMsg    = ref('')
const deletingId    = ref(null)
const showModal     = ref(false)
const genreToDelete = ref(null)

onMounted(async () => { await ambilGenre() })

const ambilGenre = async () => {
  try {
    loading.value = true
    const res = await api.get('/genre')
    genres.value = res.data.data
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

const hapusGenre = (id, nama_genre) => {
  genreToDelete.value = { id, nama_genre }
  showModal.value     = true
}

const konfirmasiHapus = async () => {
  const id = genreToDelete.value.id
  showModal.value = false
  try {
    deletingId.value = id
    await api.delete(`/genre/${id}`)
    genres.value = genres.value.filter(g => g.id !== id)
    successMsg.value = `Genre "${genreToDelete.value.nama_genre}" berhasil dihapus!`
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (err) {
    alert('Gagal menghapus genre!')
  } finally {
    deletingId.value = null
    genreToDelete.value = null
  }
}
</script>
```

### `TambahGenre.vue` — Form Tambah

```vue
<template>
  <div class="container">
    <RouterLink to="/kelola-genre" class="btn-back">← Kembali</RouterLink>
    <h1>➕ Tambah Genre Baru</h1>

    <div class="form-wrapper">
      <form @submit.prevent="submitGenre">
        <div class="form-group">
          <label>Nama Genre <span class="required">*</span></label>
          <input v-model="form.nama_genre" type="text" placeholder="Contoh: Action" required class="form-input" />
        </div>
        <button type="submit" :disabled="loading" class="btn-submit">
          <span v-if="loading">⏳ Menyimpan...</span>
          <span v-else>💾 Simpan Genre</span>
        </button>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref }               from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import api                   from '../../../utils/api'

const router   = useRouter()
const form     = ref({ nama_genre: '' })
const loading  = ref(false)
const errorMsg = ref('')

const submitGenre = async () => {
  try {
    loading.value  = true
    errorMsg.value = ''
    await api.post('/genre', form.value)
    router.push('/kelola-genre')
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Terjadi kesalahan.'
  } finally {
    loading.value = false
  }
}
</script>
```

### `EditGenre.vue` — Form Edit

```vue
<template>
  <div class="container">
    <RouterLink to="/kelola-genre" class="btn-back">← Kembali</RouterLink>
    <h1>✏️ Edit Genre</h1>

    <p v-if="loadingData" class="loading-text">⏳ Memuat data...</p>

    <div v-else class="form-wrapper">
      <form @submit.prevent="submitGenre">
        <div class="form-group">
          <label>Nama Genre <span class="required">*</span></label>
          <input v-model="form.nama_genre" type="text" required class="form-input" />
        </div>
        <button type="submit" :disabled="loading" class="btn-submit">
          <span v-if="loading">⏳ Menyimpan...</span>
          <span v-else>💾 Simpan Perubahan</span>
        </button>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted }            from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import api                           from '../../../utils/api'

const router  = useRouter()
const route   = useRoute()
const genreId = route.params.id

const form        = ref({ nama_genre: '' })
const loadingData = ref(true)
const loading     = ref(false)
const errorMsg    = ref('')

onMounted(async () => {
  try {
    // Karena tidak ada GET /genre/:id, ambil semua lalu filter
    const res     = await api.get('/genre')
    const current = res.data.data.find(g => g.id == genreId)
    if (current) { form.value.nama_genre = current.nama_genre }
    else { router.push('/kelola-genre') }
  } catch (err) { alert('Gagal memuat data') }
  finally { loadingData.value = false }
})

const submitGenre = async () => {
  try {
    loading.value  = true
    errorMsg.value = ''
    await api.put(`/genre/${genreId}`, form.value)
    router.push('/kelola-genre')
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Terjadi kesalahan.'
  } finally {
    loading.value = false
  }
}
</script>
```

---

## 5.4 CRUD Aktor

### `KelolaAktor.vue`

Strukturnya sama persis dengan `KelolaGenre.vue`, hanya beda data dan kolom tabel.

```vue
<template>
  <div class="container">
    <div class="page-title">
      <RouterLink to="/dashboard" class="btn-back">← Dashboard</RouterLink>
      <div class="title-row">
        <h1>🌟 Kelola Aktor</h1>
        <RouterLink to="/tambah-aktor" class="btn btn-primary">➕ Tambah Aktor</RouterLink>
      </div>
    </div>

    <div v-if="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>
    <p v-if="loading" class="loading-text">⏳ Memuat data aktor...</p>

    <div v-else class="table-wrapper">
      <table class="film-table">
        <thead>
          <tr><th>No</th><th>Nama Aktor</th><th>Gender</th><th>Tgl Lahir</th><th>Aksi</th></tr>
        </thead>
        <tbody>
          <tr v-if="aktors.length === 0">
            <td colspan="5" class="empty-row">Belum ada data aktor.</td>
          </tr>
          <tr v-for="(aktor, index) in aktors" :key="aktor.id">
            <td>{{ index + 1 }}</td>
            <td class="film-title-cell">{{ aktor.nama_aktor }}</td>
            <!-- Tampilkan teks lengkap, bukan kode L/P -->
            <td>{{ aktor.gender === 'L' ? 'Laki-laki' : 'Perempuan' }}</td>
            <td>{{ aktor.tanggal_lahir }}</td>
            <td>
              <div class="action-btns">
                <RouterLink :to="'/edit-aktor/' + aktor.id" class="btn-action btn-edit">✏️ Edit</RouterLink>
                <button @click="hapusAktor(aktor.id, aktor.nama_aktor)"
                  :disabled="deletingId === aktor.id" class="btn-action btn-delete">
                  <span v-if="deletingId === aktor.id">⏳</span>
                  <span v-else>🗑️ Hapus</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-box">
        <h3>⚠️ Konfirmasi Hapus</h3>
        <p>Yakin menghapus aktor: <strong>{{ aktorToDelete?.nama_aktor }}</strong>?</p>
        <p class="modal-warning">Tindakan ini tidak bisa dibatalkan!</p>
        <div class="modal-actions">
          <button @click="showModal = false" class="btn-modal-cancel">Batal</button>
          <button @click="konfirmasiHapus" class="btn-modal-delete">🗑️ Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted }        from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api                       from '../../../utils/api'

const router       = useRouter()
const aktors       = ref([])
const loading      = ref(true)
const successMsg   = ref('')
const deletingId   = ref(null)
const showModal    = ref(false)
const aktorToDelete = ref(null)

onMounted(async () => { await ambilAktor() })

const ambilAktor = async () => {
  try {
    loading.value = true
    const res = await api.get('/aktor')
    aktors.value = res.data.data
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

const hapusAktor = (id, nama_aktor) => {
  aktorToDelete.value = { id, nama_aktor }
  showModal.value     = true
}

const konfirmasiHapus = async () => {
  const id = aktorToDelete.value.id
  showModal.value = false
  try {
    deletingId.value = id
    await api.delete(`/aktor/${id}`)
    aktors.value = aktors.value.filter(a => a.id !== id)
    successMsg.value = `Aktor "${aktorToDelete.value.nama_aktor}" berhasil dihapus!`
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (err) { alert('Gagal menghapus aktor!') }
  finally { deletingId.value = null; aktorToDelete.value = null }
}
</script>
```

### `TambahAktor.vue` — Form Tambah

```vue
<template>
  <div class="container">
    <RouterLink to="/kelola-aktor" class="btn-back">← Kembali</RouterLink>
    <h1 style="margin: 12px 0 24px">➕ Tambah Aktor Baru</h1>

    <div class="form-wrapper">
      <form @submit.prevent="submitAktor">
        <div class="form-group">
          <label>Nama Aktor <span class="required">*</span></label>
          <input v-model="form.nama_aktor" type="text" placeholder="Contoh: Reza Rahadian" required class="form-input" />
        </div>

        <div class="form-group">
          <label>Gender <span class="required">*</span></label>
          <!-- Perhatikan: value pakai 'L' dan 'P' sesuai database ENUM -->
          <select v-model="form.gender" required class="form-input">
            <option value="" disabled>Pilih Gender</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>

        <div class="form-group">
          <label>Tanggal Lahir <span class="required">*</span></label>
          <input v-model="form.tanggal_lahir" type="date" required class="form-input" />
        </div>

        <button type="submit" :disabled="loading" class="btn-submit">
          <span v-if="loading">⏳ Menyimpan...</span>
          <span v-else>💾 Simpan Aktor</span>
        </button>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref }               from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import api                   from '../../../utils/api'

const router = useRouter()
const form   = ref({ nama_aktor: '', gender: '', tanggal_lahir: '' })
const loading  = ref(false)
const errorMsg = ref('')

const submitAktor = async () => {
  try {
    loading.value  = true
    errorMsg.value = ''
    await api.post('/aktor', form.value)
    router.push('/kelola-aktor')
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Terjadi kesalahan.'
  } finally {
    loading.value = false
  }
}
</script>
```

### `EditAktor.vue` — Form Edit

```vue
<template>
  <div class="container">
    <RouterLink to="/kelola-aktor" class="btn-back">← Kembali</RouterLink>
    <h1 style="margin: 12px 0 24px">✏️ Edit Aktor</h1>

    <p v-if="loadingData" class="loading-text">⏳ Memuat data...</p>

    <div v-else class="form-wrapper">
      <form @submit.prevent="submitAktor">
        <div class="form-group">
          <label>Nama Aktor <span class="required">*</span></label>
          <input v-model="form.nama_aktor" type="text" required class="form-input" />
        </div>

        <div class="form-group">
          <label>Gender <span class="required">*</span></label>
          <select v-model="form.gender" required class="form-input">
            <option value="" disabled>Pilih Gender</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>

        <div class="form-group">
          <label>Tanggal Lahir <span class="required">*</span></label>
          <input v-model="form.tanggal_lahir" type="date" required class="form-input" />
        </div>

        <button type="submit" :disabled="loading" class="btn-submit">
          <span v-if="loading">⏳ Menyimpan...</span>
          <span v-else>💾 Simpan Perubahan</span>
        </button>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted }            from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import api                           from '../../../utils/api'

const router  = useRouter()
const route   = useRoute()
const aktorId = route.params.id

const form        = ref({ nama_aktor: '', gender: '', tanggal_lahir: '' })
const loadingData = ref(true)
const loading     = ref(false)
const errorMsg    = ref('')

onMounted(async () => {
  try {
    const res     = await api.get('/aktor')
    const current = res.data.data.find(a => a.id == aktorId)
    if (current) {
      form.value.nama_aktor    = current.nama_aktor
      form.value.gender        = current.gender
      form.value.tanggal_lahir = current.tanggal_lahir
    } else { router.push('/kelola-aktor') }
  } catch (err) { alert('Gagal memuat data') }
  finally { loadingData.value = false }
})

const submitAktor = async () => {
  try {
    loading.value  = true
    errorMsg.value = ''
    await api.put(`/aktor/${aktorId}`, form.value)
    router.push('/kelola-aktor')
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Terjadi kesalahan.'
  } finally {
    loading.value = false
  }
}
</script>
```

---

## 5.5 Konsep Penting yang Dipelajari di Bab Ini

### A. `Promise.all()` — Request Paralel

```javascript
// ❌ Cara lama: berurutan (lambat, total = 300ms + 200ms = 500ms)
const genreRes = await api.get('/genre')   // tunggu 300ms
const aktorRes = await api.get('/aktor')   // tunggu 200ms

// ✅ Cara cepat: paralel (total = max(300ms, 200ms) = 300ms)
const [genreRes, aktorRes] = await Promise.all([
  api.get('/genre'),
  api.get('/aktor'),
])
```

### B. Hapus Data Lokal Tanpa Reload

```javascript
// Setelah DELETE request berhasil, hapus item dari array lokal
// Tampilan langsung update TANPA perlu reload halaman!
films.value = films.value.filter(film => film.id !== idYangDihapus)
```

### C. `Array.map()` untuk Ekstrak ID Aktor

```javascript
// Data dari API: [{id:1, nama_aktor:"Reza"}, {id:2, nama_aktor:"Luna"}]
// Yang kita butuhkan untuk checkbox: [1, 2]

form.id_aktor = filmData.aktor.map(a => a.id)
// .map() mengambil setiap elemen dan mengambil properti .id saja
```

### D. `@click.self` pada Modal

```vue
<!-- Modal menutup hanya jika user klik AREA GELAP (bukan konten modal) -->
<div class="modal-overlay" @click.self="showModal = false">
  <div class="modal-box">
    <!-- Klik di sini TIDAK menutup modal -->
  </div>
</div>
```

---

## 5.6 Struktur Folder Final

```
src/views/
├── Public/
│   ├── HomeView.vue       ← Daftar film (GET public)
│   └── DetailFilm.vue     ← Detail film (GET public)
├── Auth/
│   └── LoginView.vue      ← Form login
└── Admin/
    ├── DashboardView.vue  ← Menu navigasi admin
    ├── Film/
    │   ├── KelolaFilm.vue ← Tabel + Hapus (Read + Delete)
    │   ├── TambahFilm.vue ← Form tambah (Create)
    │   └── EditFilm.vue   ← Form edit (Update)
    ├── Genre/
    │   ├── KelolaGenre.vue
    │   ├── TambahGenre.vue
    │   └── EditGenre.vue
    └── Aktor/
        ├── KelolaAktor.vue
        ├── TambahAktor.vue
        └── EditAktor.vue
```

---

> 🎉 **Selamat! Kamu sudah menyelesaikan semua 5 Bab Modul Frontend CineVue!**
>
> Kamu sekarang sudah bisa membangun aplikasi web full-stack dengan:
> - ✅ Vue.js 3 + Vite
> - ✅ Vue Router (navigasi + middleware)
> - ✅ Axios + Bearer Token Authentication
> - ✅ CRUD lengkap (Film, Genre, Aktor)
> - ✅ Kondisional rendering yang reaktif
> - ✅ Modal konfirmasi hapus data

---

## Referensi Berguna
- 📚 [Dokumentasi Vue.js 3](https://vuejs.org/guide/introduction.html)
- 📚 [Dokumentasi Vue Router](https://router.vuejs.org/)
- 📚 [Dokumentasi Axios](https://axios-http.com/docs/intro)
- 📚 [Dokumentasi Laravel Sanctum](https://laravel.com/docs/sanctum)
