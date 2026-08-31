<template>
  <div class="dashboard-page">

    <!-- Header Dashboard -->
    <div class="dashboard-header">
      <div class="welcome-box">
        <h1>👋 Selamat Datang, {{ user?.name }}!</h1>
        <p>{{ user?.email }} · Admin Panel</p>
      </div>
      <button @click="handleLogout" :disabled="loadingLogout" class="btn-logout">
        <span v-if="loadingLogout">⏳</span>
        <span v-else>🚪 Logout</span>
      </button>
    </div>

    <!-- Menu Card -->
    <div class="menu-grid">
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
import api                       from '../utils/api'

const router       = useRouter()
const user         = ref(null)
const loadingLogout = ref(false)

// ─── Proteksi halaman: redirect ke login jika belum login ──
onMounted(() => {
  const token    = localStorage.getItem('token')
  const userData = localStorage.getItem('user')

  if (!token) {
    router.push('/login')
    return
  }

  try {
    user.value = JSON.parse(userData)
  } catch (e) {
    user.value = null
  }
})

// ─── Fungsi Logout ─────────────────────────────────────────
const handleLogout = async () => {
  try {
    loadingLogout.value = true

    // Kirim POST ke endpoint logout (pakai helper api.js → auto token)
    await api.post('/logout')

  } catch (err) {
    // Lanjutkan logout meski API error (token di server mungkin sudah hangus)
    console.warn('Logout API error:', err)
  } finally {
    // Hapus data dari localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Kembali ke halaman login
    router.push('/login')
  }
}
</script>

<style scoped>
.dashboard-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  padding: 28px 32px;
  border-radius: 16px;
  margin-bottom: 32px;
  color: white;
  flex-wrap: wrap;
  gap: 16px;
}

.welcome-box h1 {
  font-size: 22px;
  margin-bottom: 6px;
}

.welcome-box p {
  color: #aaa;
  font-size: 14px;
}

.btn-logout {
  padding: 10px 22px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}

.btn-logout:hover:not(:disabled) {
  background: #c0392b;
}

.btn-logout:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Menu Cards */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

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

.menu-card--green { border-left-color: #27ae60; }
.menu-card--blue  { border-left-color: #2980b9; }

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0,0,0,0.12);
  text-decoration: none;
}

.menu-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 12px;
}

.menu-card h3 {
  font-size: 17px;
  color: #1a1a2e;
  margin-bottom: 6px;
}

.menu-card p {
  font-size: 13px;
  color: #888;
}
</style>
