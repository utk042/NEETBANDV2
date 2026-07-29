import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/fonts.css'
import './styles/main.css'

import { registerSW } from 'virtual:pwa-register'

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
