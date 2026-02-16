import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

// Auto reload when new version is available
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Có bản cập nhật mới. Tải lại trang ngay để sử dụng tính năng hiện đại nhất?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App is ready for offline use')
  },
})

// Force clear local cache if version mismatch (Brute force safety)
// @ts-ignore
const CURRENT_VERSION = window.__APP_VERSION__ || '1.0.0';
const savedVersion = localStorage.getItem('app_version');

if (savedVersion && savedVersion !== CURRENT_VERSION) {
  console.log('New version detected. Clearing old cache...');
  localStorage.clear(); // Clear old state
  localStorage.setItem('app_version', CURRENT_VERSION);
  window.location.reload();
} else {
  localStorage.setItem('app_version', CURRENT_VERSION);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
