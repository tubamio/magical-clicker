import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '/src/ui/styles.css'   // ★ 追加：グローバルCSS

let rootEl = document.getElementById('root')
if (!rootEl) {
  rootEl = document.createElement('div')
  rootEl.id = 'root'
  document.body.appendChild(rootEl)
}

ReactDOM.createRoot(rootEl!).render(<App />)
