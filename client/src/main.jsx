import React from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import NotificationProvider from './notificationProvider.jsx';
import { AuthProvider } from './authProvider.jsx';

const domain = import.meta.env.VITE_AUTH0_DOMAIN; // Your Auth0 domain
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID; // Your Auth0 client ID


createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
  >
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <App />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  </Auth0Provider>

)
