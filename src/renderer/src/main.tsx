// React Core
import React from 'react'
import ReactDOM from 'react-dom/client'

// Reac Router
import { HashRouter as Router } from 'react-router-dom';

// Global Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'tippy.js/dist/tippy.css';

// Self-hosted fonts (IBM Plex — technical/scientific; works offline, no FOUT).
// Only the weights actually used in the type system are loaded.
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';

import './assets/main.css'

// User-Defined Components
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
)