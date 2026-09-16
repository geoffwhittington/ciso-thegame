import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { loadWeaknesses } from './lib/data'

loadWeaknesses()
  .catch(() => { /* catalog stays empty; panels hide unknown IDs */ })
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
