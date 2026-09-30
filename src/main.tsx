import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'
import { App } from './presentation/components/App'

// Apply persisted theme before first paint to avoid flash
try {
  const raw = localStorage.getItem('lineup11-ui-state');
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed?.state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }
} catch {
  // ignore
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
