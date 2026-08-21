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
            background: '#09090b',
            color: '#f5f5f4',
            border: '1px solid #27272a',
            borderRadius: '0px',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
