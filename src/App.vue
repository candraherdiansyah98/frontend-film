<template>
  <!-- ============================================================
       App.vue — Komponen Root (induk dari semua halaman)
       Navbar tampil di semua halaman. RouterView menampilkan
       komponen sesuai URL yang sedang dibuka.
       ============================================================ -->

  <nav class="navbar">
    <div class="navbar-brand">
      <RouterLink to="/">🎬 CineVue</RouterLink>
    </div>

    <div class="navbar-menu">
      <RouterLink to="/">Home</RouterLink>

      <!-- Tampilkan menu ini jika SUDAH login -->
      <template v-if="isLoggedIn">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/kelola-film">Kelola Film</RouterLink>
        <RouterLink to="/tambah-film">+ Tambah Film</RouterLink>
        <span class="navbar-user">👤 {{ userName }}</span>
      </template>

      <!-- Tampilkan tombol Login jika BELUM login -->
      <RouterLink v-else to="/login" class="btn-nav-login">🔐 Login</RouterLink>
    </div>
  </nav>

  <!-- Di sinilah setiap halaman (View) akan ditampilkan -->
  <RouterView />
</template>

<script setup>
// ============================================================
// Script Setup — Logika komponen App.vue
// ============================================================
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

const router   = useRouter()
const isLoggedIn = ref(false)
const userName   = ref('')

// Cek status login setiap kali komponen ini dimuat
onMounted(() => {
  const token = localStorage.getItem('token')
  const user  = localStorage.getItem('user')

  if (token && user) {
    isLoggedIn.value = true
    userName.value   = JSON.parse(user).name
  }
})
</script>

<style scoped>
/* ============ Navbar Styling ============ */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 32px;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand a {
  color: #e94560;
  font-size: 22px;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: 1px;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.navbar-menu a {
  color: #ccc;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.navbar-menu a:hover,
.navbar-menu a.router-link-active {
  color: #e94560;
}

.navbar-user {
  color: #aaa;
  font-size: 13px;
  border-left: 1px solid #333;
  padding-left: 16px;
}

.btn-nav-login {
  background: #e94560 !important;
  color: white !important;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px !important;
}
</style>
