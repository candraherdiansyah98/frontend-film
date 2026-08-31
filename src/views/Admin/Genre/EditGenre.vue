<template>
  <div class="container">
    <div class="page-title">
      <RouterLink to="/kelola-genre" class="btn-back">← Kembali</RouterLink>
      <div class="title-row">
        <h1>✏️ Edit Genre</h1>
      </div>
    </div>

    <!-- Loading Fetch Data -->
    <p v-if="loadingData" class="loading-text">⏳ Memuat data genre...</p>

    <div v-else class="form-wrapper">
      <form @submit.prevent="submitGenre">
        
        <div class="form-group">
          <label>Nama Genre <span class="required">*</span></label>
          <input 
            v-model="form.nama_genre" 
            type="text" 
            placeholder="Contoh: Action"
            required
            class="form-input"
          />
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import api from '../../utils/api'

const router = useRouter()
const route = useRoute()
const genreId = route.params.id

const form = ref({ nama_genre: '' })
const loadingData = ref(true)
const loading = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  try {
    // Karena tidak ada endpoint GET /genre/{id}, kita ambil semua dan filter
    const response = await api.get('/genre')
    const allGenres = response.data.data
    const currentGenre = allGenres.find(g => g.id == genreId)
    
    if (currentGenre) {
      form.value.nama_genre = currentGenre.nama_genre
    } else {
      alert('Genre tidak ditemukan')
      router.push('/kelola-genre')
    }
  } catch (err) {
    console.error('Error load data:', err)
    alert('Gagal memuat data genre')
  } finally {
    loadingData.value = false
  }
})

const submitGenre = async () => {
  try {
    loading.value = true
    errorMsg.value = ''

    await api.put(`/genre/${genreId}`, form.value)
    
    router.push('/kelola-genre')
  } catch (err) {
    console.error('Error edit genre:', err)
    errorMsg.value = err.response?.data?.message || 'Terjadi kesalahan saat mengupdate data.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-title { margin-bottom: 24px; }
.title-row { display: flex; align-items: center; margin-top: 12px; }
.title-row h1 { font-size: 26px; color: #1a1a2e; }
.btn-back { color: #666; font-size: 14px; display: inline-block; }
.btn-back:hover { color: #e94560; text-decoration: none; }

.loading-text { font-size: 16px; color: #666; font-style: italic; }

.form-wrapper {
  background: white;
  padding: 32px;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 8px;
}
.required { color: #e74c3c; }

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.form-input:focus { border-color: #2980b9; outline: none; }

.btn-submit {
  width: 100%;
  padding: 14px;
  background: #2980b9;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}
.btn-submit:hover:not(:disabled) { background: #1f618d; }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

.error-msg {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
}
</style>
