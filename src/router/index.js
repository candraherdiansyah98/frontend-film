// ============================================================
// router/index.js — Konfigurasi halaman/navigasi aplikasi
// ============================================================
// Setiap "route" adalah mapping: URL → Komponen Vue yang tampil
// ============================================================

import { createRouter, createWebHistory } from 'vue-router'

// Import semua halaman (views)
import HomeView     from '../views/HomeView.vue'
import DetailFilm   from '../views/DetailFilm.vue'
import LoginView    from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import TambahFilm   from '../views/TambahFilm.vue'
import KelolaFilm   from '../views/KelolaFilm.vue'
import EditFilm     from '../views/EditFilm.vue'

// Import Genre views
import KelolaGenre  from '../views/Genre/KelolaGenre.vue'
import TambahGenre  from '../views/Genre/TambahGenre.vue'
import EditGenre    from '../views/Genre/EditGenre.vue'

// Import Aktor views
import KelolaAktor  from '../views/Aktor/KelolaAktor.vue'
import TambahAktor  from '../views/Aktor/TambahAktor.vue'
import EditAktor    from '../views/Aktor/EditAktor.vue'

const routes = [
  // Halaman publik (bisa diakses tanpa login)
  { path: '/',           component: HomeView,      name: 'home' },
  { path: '/film/:id',   component: DetailFilm,    name: 'detail-film' },
  { path: '/login',      component: LoginView,     name: 'login' },

  // Halaman admin (butuh login)
  { path: '/dashboard',  component: DashboardView, name: 'dashboard', meta: { requiresAuth: true } },
  
  // Film
  { path: '/tambah-film', component: TambahFilm,   name: 'tambah-film', meta: { requiresAuth: true } },
  { path: '/kelola-film', component: KelolaFilm,   name: 'kelola-film', meta: { requiresAuth: true } },
  { path: '/edit-film/:id', component: EditFilm,   name: 'edit-film', meta: { requiresAuth: true } },

  // Genre
  { path: '/kelola-genre', component: KelolaGenre, name: 'kelola-genre', meta: { requiresAuth: true } },
  { path: '/tambah-genre', component: TambahGenre, name: 'tambah-genre', meta: { requiresAuth: true } },
  { path: '/edit-genre/:id', component: EditGenre, name: 'edit-genre', meta: { requiresAuth: true } },

  // Aktor
  { path: '/kelola-aktor', component: KelolaAktor, name: 'kelola-aktor', meta: { requiresAuth: true } },
  { path: '/tambah-aktor', component: TambahAktor, name: 'tambah-aktor', meta: { requiresAuth: true } },
  { path: '/edit-aktor/:id', component: EditAktor, name: 'edit-aktor', meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Middleware (Navigation Guard)
router.beforeEach((to, from, next) => {
  // Cek apakah route yang dituju membutuhkan autentikasi
  if (to.meta.requiresAuth) {
    // Cek apakah ada token di localStorage
    const token = localStorage.getItem('token')
    if (!token) {
      // Jika tidak ada token, redirect ke login
      next('/login')
    } else {
      // Jika ada token, lanjut ke route yang dituju
      next()
    }
  } else {
    // Jika route publik, langsung lanjut
    next()
  }
})

export default router
