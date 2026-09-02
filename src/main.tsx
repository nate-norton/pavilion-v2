import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/nunito-sans/400.css'
import '@fontsource/nunito-sans/600.css'
import '@fontsource/nunito-sans/700.css'
import '@fontsource/nunito-sans/800.css'
import './index.css'
import App from './App.tsx'
import { Gallery } from './gallery/Gallery.tsx'
import { DesignSystem } from './gallery/DesignSystem.tsx'
import { RepositoryProvider, createRepository } from './data/repo'

// Lightweight "routes": the flat Kitchen Sink renders at /kitchen-sink or
// ?gallery; the structured design system at /design-system or ?design (query
// params work on static hosting without SPA rewrite config).
const params = new URLSearchParams(window.location.search)
const showGallery = params.has('gallery') || window.location.pathname === '/kitchen-sink'
const showDesignSystem = params.has('design') || window.location.pathname === '/design-system'

// The data backend, selected by VITE_APP_MODE (demo → mock, live → Supabase).
const repository = createRepository()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RepositoryProvider repository={repository}>
      {showDesignSystem ? <DesignSystem /> : showGallery ? <Gallery /> : <App />}
    </RepositoryProvider>
  </StrictMode>,
)
