// src/index.js (or main.jsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// === DARK MODE ACTIVATION ===
const applyTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

applyTheme();

// Listen for system changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);