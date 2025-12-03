import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Use Pusher Channels Cloud
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Pusher = Pusher;

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');
const API_ROOT = API_BASE.replace(/\/api$/, '');
const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : undefined;

console.log('🔧 Echo Configuration (Pusher Cloud Only):', {
  key: import.meta.env.VITE_PUSHER_KEY,
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  authEndpoint: `${API_ROOT}/broadcasting/auth`,
  token: token ? 'present' : 'missing',
  api_base: API_BASE,
  api_root: API_ROOT
});

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_KEY,
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  forceTLS: true,
  encrypted: true,
  // Enable private channel auth for `user.{id}` 
  authEndpoint: `${API_ROOT}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/json',
    },
  },
  // Pusher Cloud configuration - remove local server overrides
  enabledTransports: ['ws', 'wss'],
  disabledTransports: [],
  enableStats: false,
});

// Add Pusher connection event logging
if (typeof window !== 'undefined' && (window as any).Pusher) {
  echo.connector.pusher.connection.bind('connected', () => {
    console.log('🔗 Pusher connected successfully');
  });
  
  echo.connector.pusher.connection.bind('disconnected', () => {
    console.log('🔌 Pusher disconnected');
  });
  
  echo.connector.pusher.connection.bind('error', (error: any) => {
    console.error('❌ Pusher connection error:', error);
  });
}

export default echo;