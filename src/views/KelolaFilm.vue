<template>
  <div class="container">
    <div class="page-title">
      <RouterLink to="/dashboard" class="btn-back">← Dashboard</RouterLink>
      <div class="title-row">
        <h1>🗂️ Kelola Film</h1>
        <RouterLink to="/tambah-film" class="btn btn-primary">➕ Tambah Film</RouterLink>
      </div>
    </div>

    <!-- Alert Sukses (hapus berhasil) -->
    <div v-if="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>

    <!-- Loading -->
    <p v-if="loading" class="loading-text">⏳ Memuat data film...</p>

    <!-- Tabel Film -->
    <div v-else class="table-wrapper">
      <table class="film-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Poster</th>
            <th>Judul Film</th>
            <th>Genre</th>
            <th>Sutradara</th>
            <th>Durasi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="films.length === 0">
            <td colspan="7" class="empty-row">Belum ada data film.</td>
          </tr>
          <tr v-for="(film, index) in films" :key="film.id">
            <td>{{ index + 1 }}</td>
            <td>
              <img :src="film.poster" :alt="film.title" class="table-poster" />
            </td>
            <td class="film-title-cell">{{ film.title }}</td>
            <td>
              <span class="badge-genre">{{ film.genre?.nama_genre }}</span>
            </td>
            <td>{{ film.sutradara }}</td>
            <td>{{ film.durasi }} mnt</td>
            <td>
              <div class="action-btns">
                <RouterLink :to="'/edit-film/' + film.id" class="btn-action btn-edit">
                  ✏️ Edit
                </RouterLink>
                <button
                  @click="hapusFilm(film.id, film.title)"
                  :disabled="deletingId === film.id"
                  class="btn-action btn-delete"
                >
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
// ============================================================
// KelolaFilm.vue — Tabel kelola film (Lihat & Hapus)
// ============================================================
// Konsep yang dipelajari:
//   - api.delete()  : hapus data dengan Bearer Token
//   - Modal konfirmasi sederhana (tanpa library eksternal)
//   - Hapus item dari array lokal (tanpa reload halaman)
//   - Conditional loading per baris (deletingId)
// ============================================================

import { ref, onMounted }        from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api                       from '../utils/api'

const router     = useRouter()
const films      = ref([])
const loading    = ref(true)
const successMsg = ref('')
const deletingId = ref(null)    // ID film yang sedang dihapus
const showModal  = ref(false)   // kontrol tampil/sembunyi modal
const filmToDelete = ref(null)  // data film yang akan dihapus

// ─── Proteksi halaman ─────────────────────────────────────
onMounted(async () => {
  if (!localStorage.getItem('token')) {
    router.push('/login')
    return
  }
  await ambilFilm()
})

// ─── Ambil semua film (endpoint private) ──────────────────
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

// ─── Tampilkan modal konfirmasi sebelum hapus ─────────────
const hapusFilm = (id, title) => {
  // Simpan data film yang akan dihapus
  filmToDelete.value = { id, title }
  showModal.value    = true
}

// ─── Eksekusi hapus setelah konfirmasi ────────────────────
const konfirmasiHapus = async () => {
  const id = filmToDelete.value.id
  showModal.value = false

  try {
    deletingId.value = id  // Tandai baris yang sedang dihapus

    // Kirim DELETE request ke API
    await api.delete(`/films/${id}`)

    // Hapus dari array lokal (tampilan langsung update tanpa reload)
    films.value = films.value.filter(film => film.id !== id)

    successMsg.value = `Film "${filmToDelete.value.title}" berhasil dihapus!`

    // Sembunyikan pesan sukses setelah 3 detik
    setTimeout(() => { successMsg.value = '' }, 3000)

  } catch (err) {
    alert('Gagal menghapus film! ' + (err.response?.data?.message || ''))
    console.error(err)
  } finally {
    deletingId.value  = null
    filmToDelete.value = null
  }
}
</script>

<style scoped>
.page-title { margin-bottom: 24px; }

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.title-row h1 { font-size: 26px; color: #1a1a2e; }

.btn-back {
  color: #666;
  font-size: 14px;
  display: inline-block;
}
.btn-back:hover { color: #e94560; text-decoration: none; }

/* Tabel */
.table-wrapper {
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.film-table {
  width: 100%;
  border-collapse: collapse;
}

.film-table th {
  background: #1a1a2e;
  color: white;
  padding: 14px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
}

.film-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  vertical-align: middle;
}

.film-table tr:last-child td { border-bottom: none; }

.film-table tr:hover td { background: #fafafa; }

.table-poster {
  width: 44px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  display: block;
}

.film-title-cell {
  font-weight: 600;
  color: #1a1a2e;
  max-width: 200px;
}

.badge-genre {
  background: #fee2e2;
  color: #e94560;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
}

.empty-row {
  text-align: center;
  color: #aaa;
  padding: 40px !important;
}

/* Tombol Aksi */
.action-btns {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-action {
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-family: inherit;
  text-decoration: none;
  display: inline-block;
  transition: opacity 0.2s;
}

.btn-edit   { background: #ebf5fb; color: #2980b9; }
.btn-delete { background: #fdedec; color: #e74c3c; }

.btn-action:hover { opacity: 0.75; }
.btn-action:disabled { opacity: 0.5; cursor: not-allowed; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-box {
  background: white;
  padding: 32px;
  border-radius: 16px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  text-align: center;
}

.modal-box h3 { font-size: 20px; margin-bottom: 12px; }
.modal-box p  { color: #555; font-size: 14px; }

.modal-film-name {
  font-weight: 700;
  color: #1a1a2e;
  font-size: 15px !important;
  margin: 10px 0;
}

.modal-warning {
  color: #e74c3c !important;
  font-size: 13px !important;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-modal-cancel {
  padding: 10px 24px;
  background: #f0f0f0;
  color: #555;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
}

.btn-modal-delete {
  padding: 10px 24px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  transition: background 0.2s;
}

.btn-modal-delete:hover { background: #c0392b; }
</style>
