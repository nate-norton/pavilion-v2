import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/young-serif/400.css'
import '@fontsource/nunito-sans/400.css'
import '@fontsource/nunito-sans/600.css'
import '@fontsource/nunito-sans/700.css'
import '@fontsource/nunito-sans/800.css'
import './index.css'
import App from './App.tsx'
import { Gallery } from './gallery/Gallery.tsx'
import { RepositoryProvider, createRepository } from './data/repo'

// Lightweight "route": the component gallery renders at /kitchen-sink or ?gallery
// (query param works on static hosting without SPA rewrite config).
const params = new URLSearchParams(window.location.search)
const showGallery = params.has('gallery') || window.location.pathname === '/kitchen-sink'

// The data backend, selected by VITE_APP_MODE (demo → mock, live → Supabase).
const repository = createRepository()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RepositoryProvider repository={repository}>
      {showGallery ? <Gallery /> : <App />}
    </RepositoryProvider>
  </StrictMode>,
)
