import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TradeProvider } from './context/TradeContext.tsx';

import { AuthProvider } from './context/AuthContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';

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
