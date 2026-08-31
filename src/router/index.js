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

const routes = [
  // Halaman publik (bisa diakses tanpa login)
  { path: '/',           component: HomeView,      name: 'home' },
  { path: '/film/:id',   component: DetailFilm,    name: 'detail-film' },
  { path: '/login',      component: LoginView,     name: 'login' },

  // Halaman admin (butuh login)
  { path: '/dashboard',  component: DashboardView, name: 'dashboard' },
  { path: '/tambah-film', component: TambahFilm,   name: 'tambah-film' },
  { path: '/kelola-film', component: KelolaFilm,   name: 'kelola-film' },
  { path: '/edit-film/:id', component: EditFilm,   name: 'edit-film' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
