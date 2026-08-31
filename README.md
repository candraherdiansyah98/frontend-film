# 🎬 Modul Frontend CineVue — BAB 1
## Pengenalan & Persiapan Project

---

> 💡 **Sebelum Mulai**
> Pastikan sudah terinstall di komputer kamu:
> - **Node.js** (versi 18 ke atas) → [nodejs.org](https://nodejs.org)
> - **VS Code** sebagai code editor
> - **Git** (opsional, tapi disarankan)

---

## 1.1 Apa itu Vue.js?

**Vue.js** adalah framework JavaScript untuk membangun tampilan web yang interaktif. Kalau kamu pernah bikin website pakai HTML + JS biasa, Vue.js akan terasa jauh lebih mudah karena:

- Data berubah → tampilan **otomatis update** (tidak perlu `document.getElementById` lagi!)
- Kode lebih **terstruktur** dan bisa dipecah jadi komponen kecil-kecil
- Banyak fitur bawaan untuk routing, state management, dll.

**Vite** adalah tools yang kita pakai untuk menjalankan dan membangun project Vue.js dengan sangat cepat.

---

## 1.2 Membuat Project Baru

Buka terminal / command prompt, lalu jalankan:

```bash
# Buat project Vue.js baru dengan Vite
npm create vite@latest frontend-film -- --template vue

# Masuk ke folder project
cd frontend-film

# Install semua package yang dibutuhkan
npm install

# Install axios untuk HTTP request ke API
npm install axios

# Install vue-router untuk navigasi antar halaman
npm install vue-router
```

Setelah selesai, jalankan development server:

```bash
npm run dev
```

Buka browser di `http://localhost:5173` — project Vue.js kamu sudah berjalan! 🚀

---

## 1.3 Struktur Folder Project

Berikut adalah struktur folder lengkap project **CineVue** yang akan kita buat:

```
frontend-film/
├── public/                 # File statis (favicon, dll.)
├── src/                    # 🌟 Semua kode utama ada di sini
│   ├── views/              # Komponen halaman (satu file = satu halaman)
│   │   ├── Public/         # Halaman untuk semua orang (tidak perlu login)
│   │   │   ├── HomeView.vue
│   │   │   └── DetailFilm.vue
│   │   ├── Auth/           # Halaman otentikasi
│   │   │   └── LoginView.vue
│   │   └── Admin/          # Halaman khusus admin (harus login)
│   │       ├── DashboardView.vue
│   │       ├── Film/
│   │       │   ├── KelolaFilm.vue
│   │       │   ├── TambahFilm.vue
│   │       │   └── EditFilm.vue
│   │       ├── Genre/
│   │       │   ├── KelolaGenre.vue
│   │       │   ├── TambahGenre.vue
│   │       │   └── EditGenre.vue
│   │       └── Aktor/
│   │           ├── KelolaAktor.vue
│   │           ├── TambahAktor.vue
│   │           └── EditAktor.vue
│   ├── router/
│   │   └── index.js        # Konfigurasi URL → Halaman
│   ├── utils/
│   │   └── api.js          # Helper Axios (token otomatis)
│   ├── App.vue             # Komponen induk (root), tempat navbar
│   ├── main.js             # Entry point, tempat app Vue "dinyalakan"
│   └── style.css           # CSS global untuk seluruh aplikasi
├── index.html              # File HTML utama
└── package.json            # Daftar package yang dipakai
```

---

## 1.4 File `index.html`

Ini adalah satu-satunya file HTML di project kita. Vue.js akan "mengambil alih" elemen `<div id="app">` dan mengganti isinya secara dinamis.

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CineVue — Katalog Film</title>
  </head>
  <body>
    <!-- Di sinilah seluruh aplikasi Vue.js akan "dipasang" -->
    <div id="app"></div>
    
    <!-- Vite otomatis menambahkan tag script untuk main.js -->
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

---

## 1.5 File `src/main.js` — Entry Point Aplikasi

Ini adalah file pertama yang dijalankan. Di sinilah aplikasi Vue.js "dinyalakan".

```javascript
// ============================================================
// main.js — Titik awal/entry point aplikasi Vue 3
// ============================================================
// Di sinilah aplikasi Vue "dinyalakan" dan ditempelkan ke HTML
// ============================================================

import { createApp } from 'vue'    // Import fungsi untuk membuat aplikasi Vue
import App from './App.vue'        // Import komponen root (induk semua halaman)
import router from './router'      // Import konfigurasi routing/navigasi
import './style.css'               // Import CSS global

// Buat aplikasi Vue, pasangkan router, lalu mount ke elemen #app di index.html
createApp(App).use(router).mount('#app')
```

**Penjelasan alurnya:**
1. `createApp(App)` → Buat aplikasi Vue dengan `App.vue` sebagai komponen utama
2. `.use(router)` → Pasangkan sistem navigasi/routing
3. `.mount('#app')` → "Tempelkan" aplikasi ke elemen `<div id="app">` di `index.html`

---

## 1.6 File `src/style.css` — CSS Global

File ini berisi variabel warna, reset CSS, dan kelas-kelas utility yang bisa dipakai di semua halaman.

```css
/* ============================================================
   style.css — CSS Global untuk seluruh aplikasi
   ============================================================ */

/* Import font Inter dari Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* ─── Variabel Warna (CSS Custom Properties) ─────────────── */
/* Variabel ini bisa dipakai di file mana saja dengan var(--nama) */
:root {
  --color-primary:   #e94560;   /* Merah utama */
  --color-dark:      #1a1a2e;   /* Biru gelap */
  --color-dark2:     #16213e;
  --color-dark3:     #0f3460;
  --color-white:     #ffffff;
  --color-gray:      #f4f4f8;   /* Background halaman */
  --color-text:      #333333;
  --radius:          10px;
  --shadow:          0 4px 20px rgba(0, 0, 0, 0.1);
}

/* ─── Reset Dasar ─────────────────────────────────────────── */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--color-gray);
  color: var(--color-text);
  min-height: 100vh;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}
a:hover { text-decoration: underline; }

/* ─── Utility Classes ─────────────────────────────────────── */
/* Kelas-kelas ini bisa langsung dipakai di semua komponen */

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s, transform 0.1s;
}
.btn:hover { opacity: 0.85; transform: translateY(-1px); }

/* Variasi warna tombol */
.btn-primary { background: var(--color-primary); color: white; }
.btn-success { background: #27ae60; color: white; }
.btn-danger  { background: #e74c3c; color: white; }
.btn-info    { background: #2980b9; color: white; }

/* Kotak notifikasi */
.alert { padding: 12px 16px; border-radius: var(--radius); margin-bottom: 16px; font-size: 14px; }
.alert-success { background: #d4edda; color: #155724; border-left: 4px solid #27ae60; }
.alert-error   { background: #f8d7da; color: #721c24; border-left: 4px solid #e74c3c; }

/* Status loading */
.loading-text { text-align: center; padding: 40px; color: #888; font-size: 18px; }
```

---

## 1.7 Konsep Dasar Vue.js yang Wajib Dipahami

Sebelum lanjut ke bab berikutnya, pahami konsep-konsep ini terlebih dahulu:

### A. Komponen (`.vue` file)
Setiap file `.vue` adalah sebuah **komponen** — potongan UI yang berdiri sendiri. Satu komponen terdiri dari 3 bagian:

```vue
<template>
  <!-- HTML/tampilan komponen -->
  <h1>Hello, {{ nama }}!</h1>
</template>

<script setup>
// JavaScript / logika komponen
import { ref } from 'vue'
const nama = ref('Budi')   // variabel reaktif
</script>

<style scoped>
/* CSS khusus komponen ini saja */
h1 { color: red; }
</style>
```

### B. `ref()` — Variabel Reaktif
`ref()` membuat variabel yang jika berubah nilainya, tampilan HTML **otomatis ikut berubah**.

```javascript
import { ref } from 'vue'

const counter = ref(0)        // buat variabel reaktif
counter.value++               // ubah nilainya dengan .value
console.log(counter.value)    // baca nilainya dengan .value
```

Di template HTML, tidak perlu `.value`:
```html
<p>{{ counter }}</p>   <!-- Vue otomatis baca .value -->
```

### C. Direktif Template
Direktif adalah atribut khusus Vue yang diawali `v-`:

| Direktif | Fungsi | Contoh |
|----------|--------|--------|
| `v-if` | Tampil jika kondisi true | `<p v-if="loading">Loading...</p>` |
| `v-else` | Tampil jika kondisi false | `<p v-else>Data siap!</p>` |
| `v-for` | Looping data | `<li v-for="item in items">` |
| `v-model` | Binding dua arah (form) | `<input v-model="nama">` |
| `:src` | Binding atribut dinamis | `:src="film.poster"` |
| `@click` | Event listener | `@click="hapus(id)"` |

### D. `onMounted()` — Lifecycle Hook
Kode di dalam `onMounted()` dijalankan **setelah komponen selesai ditampilkan** di browser. Biasanya dipakai untuk fetch data dari API.

```javascript
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Halaman sudah tampil di browser!')
  ambilDataDariAPI()   // panggil API di sini
})
```

---

> ✅ **Bab 1 Selesai!**
> Di bab selanjutnya, kita akan belajar membuat sistem routing/navigasi antar halaman menggunakan **Vue Router**.

**➡️ Lanjut ke [BAB 2 — Routing & Navigasi](./bab-2-routing.md)**
