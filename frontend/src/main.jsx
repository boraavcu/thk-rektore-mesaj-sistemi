import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // Yönlendirici eklendi
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './index.css'
import App from './App.jsx'

console.log(
  "%c Bu sistem Bora Avcu tarafından geliştirilmiştir (2026).", 
  "color: #001A72; font-size: 14px; font-weight: bold; background: #87CEEB; padding: 5px 10px; border-radius: 5px;"
);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)