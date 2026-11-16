import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app.jsx'
import { ContentProvider } from './content.jsx'
import { LangProvider } from './i18n.jsx'
import './index.css'
import './site.css'
import './tweaks.jsx'

// GitHub Pages serves the site from /<repo>/; Vite exposes that as BASE_URL.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LangProvider>
        <ContentProvider>
          <App />
        </ContentProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>
)
