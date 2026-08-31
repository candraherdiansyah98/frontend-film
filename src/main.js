// ============================================================
// main.js — Titik awal/entry point aplikasi Vue 3
// ============================================================
// Di sinilah aplikasi Vue "dinyalakan" dan ditempelkan ke HTML
// ============================================================

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

// Buat aplikasi Vue, pasangkan router, lalu mount ke elemen #app di index.html
createApp(App).use(router).mount('#app')
