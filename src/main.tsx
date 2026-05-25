import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Apply saved theme immediately to prevent flash
const savedTheme = localStorage.getItem('examSense-theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
