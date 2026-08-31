# 🎬 Modul Frontend CineVue — BAB 2
## Routing & Navigasi

---

> 💡 **Apa itu SPA (Single Page Application)?**
> Website biasa: setiap klik link → browser download halaman HTML baru (ada loading)
> **Vue.js (SPA)**: klik link → Vue mengganti komponen yang tampil, **tanpa reload halaman!**
> Inilah yang membuat aplikasi Vue terasa cepat dan smooth seperti aplikasi mobile.

---

## 2.1 Instalasi Vue Router

Vue Router adalah library resmi Vue.js untuk mengatur navigasi antar halaman.

```bash
npm install vue-router
```

---

## 2.2 Konfigurasi Routing — `src/router/index.js`

File ini adalah "peta" aplikasi kita. Di sini kita daftarkan semua URL beserta komponen Vue yang akan ditampilkan.

```javascript
// ============================================================
// router/index.js — Konfigurasi halaman/navigasi aplikasi
// ============================================================
// Setiap "route" adalah mapping: URL → Komponen Vue yang tampil
// ============================================================

import { createRouter, createWebHistory } from 'vue-router'

// ─── Import semua halaman (views) ─────────────────────────
// Halaman Publik (bisa diakses tanpa login)
import HomeView     from '../views/Public/HomeView.vue'
import DetailFilm   from '../views/Public/DetailFilm.vue'

// Halaman Autentikasi
import LoginView    from '../views/Auth/LoginView.vue'

// Halaman Admin (harus login)
import DashboardView from '../views/Admin/DashboardView.vue'

// Admin — Film
import TambahFilm   from '../views/Admin/Film/TambahFilm.vue'
import KelolaFilm   from '../views/Admin/Film/KelolaFilm.vue'
import EditFilm     from '../views/Admin/Film/EditFilm.vue'

// Admin — Genre
import KelolaGenre  from '../views/Admin/Genre/KelolaGenre.vue'
import TambahGenre  from '../views/Admin/Genre/TambahGenre.vue'
import EditGenre    from '../views/Admin/Genre/EditGenre.vue'

// Admin — Aktor
import KelolaAktor  from '../views/Admin/Aktor/KelolaAktor.vue'
import TambahAktor  from '../views/Admin/Aktor/TambahAktor.vue'
import EditAktor    from '../views/Admin/Aktor/EditAktor.vue'

// ─── Daftar semua route ────────────────────────────────────
const routes = [
  // Halaman publik (bisa diakses tanpa login)
  { path: '/',           component: HomeView,   name: 'home' },
  { path: '/film/:id',   component: DetailFilm, name: 'detail-film' },
  { path: '/login',      component: LoginView,  name: 'login' },

  // Halaman admin (butuh login) — ditandai meta: { requiresAuth: true }
  { path: '/dashboard',     component: DashboardView, name: 'dashboard',     meta: { requiresAuth: true } },

  // Film
  { path: '/tambah-film',   component: TambahFilm,    name: 'tambah-film',   meta: { requiresAuth: true } },
  { path: '/kelola-film',   component: KelolaFilm,    name: 'kelola-film',   meta: { requiresAuth: true } },
  { path: '/edit-film/:id', component: EditFilm,      name: 'edit-film',     meta: { requiresAuth: true } },

  // Genre
  { path: '/kelola-genre',     component: KelolaGenre, name: 'kelola-genre',    meta: { requiresAuth: true } },
  { path: '/tambah-genre',     component: TambahGenre, name: 'tambah-genre',    meta: { requiresAuth: true } },
  { path: '/edit-genre/:id',   component: EditGenre,   name: 'edit-genre',      meta: { requiresAuth: true } },

  // Aktor
  { path: '/kelola-aktor',     component: KelolaAktor, name: 'kelola-aktor',    meta: { requiresAuth: true } },
  { path: '/tambah-aktor',     component: TambahAktor, name: 'tambah-aktor',    meta: { requiresAuth: true } },
  { path: '/edit-aktor/:id',   component: EditAktor,   name: 'edit-aktor',      meta: { requiresAuth: true } },
]

// ─── Buat instance router ──────────────────────────────────
const router = createRouter({
  history: createWebHistory(),  // Pakai URL biasa (bukan /#/)
  routes,
})

// ─── Navigation Guard (Middleware) ────────────────────────
// Kode ini berjalan SETIAP KALI user berpindah halaman
router.beforeEach((to, from, next) => {
  // Cek apakah route yang dituju membutuhkan autentikasi
  if (to.meta.requiresAuth) {
    // Cek apakah ada token login di localStorage
    const token = localStorage.getItem('token')

    if (!token) {
      // Tidak ada token → paksa ke halaman login
      next('/login')
    } else {
      // Ada token → izinkan masuk
      next()
    }
  } else {
    // Route publik → langsung izinkan
    next()
  }
})

export default router
```

---

## 2.3 Cara Kerja Navigation Guard

Navigation Guard (`router.beforeEach`) ibarat **petugas satpam** yang memeriksa setiap pengunjung sebelum mereka bisa masuk ke halaman tertentu.

```
User klik link ke /dashboard
        │
        ▼
   router.beforeEach
        │
        ├─ Apakah route ini requiresAuth? ──YES──► Cek localStorage
        │                                                │
        │                                ┌──────────────┴──────────────┐
        │                           Ada token?                    Tidak ada?
        │                                │                             │
        │                          next() ✅                   next('/login') 🚫
        │
        └─ Tidak requiresAuth → next() ✅ langsung izinkan
```

---

## 2.4 `<RouterLink>` dan `<RouterView>`

### `<RouterLink>` — Link Navigasi
Gunakan `<RouterLink>` sebagai pengganti `<a>` biasa. Bedanya, `RouterLink` tidak akan me-reload halaman.

```vue
<!-- Cara biasa (akan reload halaman) ❌ -->
<a href="/dashboard">Dashboard</a>

<!-- Cara Vue (tidak reload, lebih cepat) ✅ -->
<RouterLink to="/dashboard">Dashboard</RouterLink>

<!-- Dengan variabel dinamis -->
<RouterLink :to="'/film/' + film.id">Lihat Detail</RouterLink>

<!-- Dengan nama route -->
<RouterLink :to="{ name: 'detail-film', params: { id: film.id } }">
  Lihat Detail
</RouterLink>
```

### `<RouterView>` — Tempat Halaman Ditampilkan
`<RouterView>` adalah "layar" tempat komponen halaman ditampilkan. Setiap kali URL berubah, Vue otomatis mengganti isi `<RouterView>` dengan komponen yang sesuai.

```vue
<!-- Di App.vue -->
<template>
  <nav>...</nav>       <!-- Navbar tetap di sini -->
  <RouterView />       <!-- Isi halaman berubah di sini -->
</template>
```

---

## 2.5 Dynamic Route — URL dengan Parameter

Tanda `:id` di dalam path route berarti URL tersebut mengandung **parameter dinamis**.

```javascript
// Di router/index.js
{ path: '/film/:id', component: DetailFilm }
// URL /film/1  → id = 1
// URL /film/99 → id = 99
```

Cara membaca parameter di dalam komponen:

```javascript
// Di dalam DetailFilm.vue
import { useRoute } from 'vue-router'

const route  = useRoute()
const filmId = route.params.id  // ambil nilai :id dari URL
console.log(filmId)             // "1" atau "99", dll.
```

---

## 2.6 File `src/App.vue` — Komponen Root & Navbar

`App.vue` adalah komponen paling "luar" yang membungkus seluruh aplikasi. Di sinilah kita taruh navbar yang muncul di semua halaman.

```vue
<template>
  <!-- Navbar tampil di SEMUA halaman -->
  <nav class="navbar">
    <div class="navbar-brand">
      <RouterLink to="/">🎬 CineVue</RouterLink>
    </div>

    <div class="navbar-menu">
      <!-- Menu untuk GUEST (belum login) -->
      <template v-if="!isLoggedIn">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/login" class="btn-nav-login">🔐 Login</RouterLink>
      </template>

      <!-- Menu untuk ADMIN (sudah login) -->
      <template v-else>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/kelola-film">Kelola Film</RouterLink>
        <RouterLink to="/tambah-film">+ Tambah Film</RouterLink>
        <span class="navbar-user">👤 {{ userName }}</span>
        <button @click="handleLogout" class="btn-nav-logout">🚪 Logout</button>
      </template>
    </div>
  </nav>

  <!-- Di sinilah setiap halaman (View) akan ditampilkan -->
  <RouterView />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import api from './utils/api'

const router     = useRouter()
const route      = useRoute()
const isLoggedIn = ref(false)
const userName   = ref('')

// ─── Fungsi cek status login dari localStorage ─────────────
const cekStatusLogin = () => {
  const token = localStorage.getItem('token')
  const user  = localStorage.getItem('user')

  if (token && user) {
    try {
      isLoggedIn.value = true
      userName.value   = JSON.parse(user).name
    } catch (e) {
      isLoggedIn.value = false
    }
  } else {
    isLoggedIn.value = false
    userName.value   = ''
  }
}

// Cek saat app pertama kali dibuka
onMounted(() => { cekStatusLogin() })

// Cek ulang setiap kali URL berubah → navbar langsung update!
watch(() => route.path, () => { cekStatusLogin() })

// ─── Fungsi Logout ─────────────────────────────────────────
const handleLogout = async () => {
  try {
    await api.post('/logout')   // Hapus token di server
  } catch (err) {
    console.warn('Logout API error:', err)
  } finally {
    localStorage.removeItem('token')   // Hapus token di browser
    localStorage.removeItem('user')

    isLoggedIn.value = false           // Update tampilan navbar
    userName.value   = ''

    router.push('/login')              // Redirect ke login
  }
}
</script>

<style scoped>
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
  text-decoration: none;
}

.btn-nav-logout {
  background: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.btn-nav-logout:hover {
  background: #e74c3c;
  color: white;
}
</style>
```

---

## 2.7 Cara Kerja `watch` untuk Sinkronisasi Navbar

```
User login → redirect ke /dashboard
      │
      ▼
  URL berubah → watch(() => route.path) terpicu
      │
      ▼
  cekStatusLogin() dipanggil ulang
      │
      ▼
  Token ditemukan di localStorage
      │
      ▼
  isLoggedIn = true → Navbar langsung tampilkan menu Admin ✅
```

Tanpa `watch`, navbar hanya dicek sekali saat halaman pertama dibuka (`onMounted`), sehingga perubahan login/logout tidak langsung terlihat di navbar.

---

> ✅ **Bab 2 Selesai!**
> Kamu sekarang sudah paham cara kerja routing di Vue.js dan bagaimana melindungi halaman admin dari akses tanpa login.

**➡️ Lanjut ke [BAB 3 — Halaman Publik & Fetch Data API](./bab-3-public.md)**
