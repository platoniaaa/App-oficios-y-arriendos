import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/globals.css'
import { App } from './App'
import { useAuth } from './stores/useAuth'

// Inicializa la sesión de Supabase antes de renderizar.
// (no bloquea — si tarda, la app igual aparece y se hidrata después)
useAuth.getState().init()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
