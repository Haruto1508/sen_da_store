import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Tự động chuẩn hóa URL hash nếu người dùng gõ thiếu dấu '/' (ví dụ: #shop -> #/shop)
if (window.location.hash && !window.location.hash.startsWith('#/')) {
  window.location.hash = '#/' + window.location.hash.slice(1).replace(/^\//, '');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
