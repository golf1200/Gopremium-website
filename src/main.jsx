import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import App from './App';
import { initGA } from './utils/analytics';
import { captureAttribution } from './utils/attribution';

captureAttribution();
initGA();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
