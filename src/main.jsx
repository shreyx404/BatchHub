import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a2e',
            color: '#e4e4ef',
            border: '1px solid #2a2a3e',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
