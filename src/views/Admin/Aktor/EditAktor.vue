<template>
  <div class="container">
    <div class="page-title">
      <RouterLink to="/kelola-aktor" class="btn-back">← Kembali</RouterLink>
      <div class="title-row">
        <h1>✏️ Edit Aktor</h1>
      </div>
    </div>

    <!-- Loading Fetch Data -->
    <p v-if="loadingData" class="loading-text">⏳ Memuat data aktor...</p>

    <div v-else class="form-wrapper">
      <form @submit.prevent="submitAktor">
        
        <div class="form-group">
          <label>Nama Aktor <span class="required">*</span></label>
          <input 
            v-model="form.nama_aktor" 
            type="text" 
            placeholder="Contoh: Reza Rahadian"
            required
            class="form-input"
          />
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
          <input 
            v-model="form.tanggal_lahir" 
            type="date" 
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
const aktorId = route.params.id

const form = ref({
  nama_aktor: '',
  gender: '',
  tanggal_lahir: ''
})
const loadingData = ref(true)
const loading = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  try {
    // Ambil semua aktor lalu cari berdasarkan ID karena tidak ada endpoint GET /aktor/{id}
    const response = await api.get('/aktor')
    const allAktors = response.data.data
    const currentAktor = allAktors.find(a => a.id == aktorId)
    
    if (currentAktor) {
      form.value.nama_aktor = currentAktor.nama_aktor
      form.value.gender = currentAktor.gender
      form.value.tanggal_lahir = currentAktor.tanggal_lahir
    } else {
      alert('Aktor tidak ditemukan')
      router.push('/kelola-aktor')
    }
  } catch (err) {
    console.error('Error load data:', err)
    alert('Gagal memuat data aktor')
  } finally {
    loadingData.value = false
  }
})

const submitAktor = async () => {
  try {
    loading.value = true
    errorMsg.value = ''

    await api.put(`/aktor/${aktorId}`, form.value)
    
    router.push('/kelola-aktor')
  } catch (err) {
    console.error('Error edit aktor:', err)
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
