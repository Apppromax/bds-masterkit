import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { Toaster } from 'react-hot-toast'

// Auto reload when new version is available
const updateSW = registerSW({
  onNeedRefresh() {
    // Auto-reload without asking - seamless update
    updateSW(true)
  },
  onOfflineReady() {
    console.log('App is ready for offline use')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position="top-center" toastOptions={{ className: 'font-bold font-sans' }} />
  </StrictMode>,
)
