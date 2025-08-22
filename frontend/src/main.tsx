import React from 'react';
import ReactDOM from 'react-dom/client';
import AppShell from './modules/shell/AppShell';
import { initializeFavicon } from './config/logoConfig';

// Inizializza la favicon all'avvio dell'applicazione
initializeFavicon();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>
);
