import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { loadWeaknesses } from './lib/data'
import { GameErrorBoundary } from './components/game/GameErrorBoundary'

const root = createRoot(document.getElementById('root')!)
const renderApp = () => root.render(
  <StrictMode>
    <GameErrorBoundary>
      <App />
    </GameErrorBoundary>
  </StrictMode>,
)

// Mount immediately so a slow catalog request never leaves a blank screen.
renderApp()

loadWeaknesses()
  .catch(() => { /* catalog stays empty; panels hide unknown IDs */ })
  .finally(() => {
    renderApp()
  })
