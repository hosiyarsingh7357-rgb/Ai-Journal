import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TradeProvider } from './context/TradeContext.tsx';
import { initTheme } from './utils/theme.js';

import { AuthProvider } from './context/AuthContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';

initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TradeProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </TradeProvider>
    </AuthProvider>
  </StrictMode>,
);
