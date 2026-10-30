import { defaultPortfolioData } from '../data/defaultData';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const LOCAL_STORAGE_KEY = 'harsha_portfolio_data';
const LOCAL_MESSAGES_KEY = 'harsha_portfolio_messages';
const AUTH_TOKEN_KEY = 'harsha_portfolio_token';

// Helper to get local data
export const getLocalData = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read from localStorage:', e);
  }
  return defaultPortfolioData;
};

// Helper to save local data
export const saveLocalData = (data) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

// Smart fetcher that handles both /api/endpoint and /endpoint automatically
async function smartFetch(subpath, options = {}) {
  const cleanPath = subpath.startsWith('/') ? subpath : `/${subpath}`;
  
  // Try with /api prefix first
  try {
    const res = await fetch(`${API_BASE}/api${cleanPath}`, options);
    if (res.ok) return res;
  } catch {
    // Continue to fallback
  }

  // Try direct route (e.g. on Vercel without /api prefix)
  try {
    const res = await fetch(`${API_BASE}${cleanPath}`, options);
    if (res.ok) return res;
  } catch {
    // Continue
  }

  throw new Error(`Failed to reach ${subpath}`);
}

// Check if backend API is online
export const checkApiHealth = async () => {
  try {
    const res = await smartFetch('/health', { method: 'GET' });
    const data = await res.json();
    return { online: true, data };
  } catch {
    // API is offline or running static on GitHub Pages without live connection
  }
  return { online: false };
};

// Fetch Portfolio Data (Dual-Mode)
export const fetchPortfolioData = async () => {
  try {
    const res = await smartFetch('/portfolio');
    const data = await res.json();
    saveLocalData(data); // Sync local copy
    return { data, source: 'api' };
  } catch {
    // Fall back to local data
  }
  return { data: getLocalData(), source: 'local' };
};

// Submit Contact Message (Dual-Mode)
export const sendContactMessage = async (messageData) => {
  try {
    const res = await smartFetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    return await res.json();
  } catch {
    // Fall back to local store
  }

  // Save locally if offline
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '[]');
    const newMsg = {
      id: Date.now(),
      ...messageData,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    existing.unshift(newMsg);
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(existing));
    return {
      status: 'success',
      message: `Thank you ${messageData.name}! Your message has been received (saved locally).`,
    };
  } catch (err) {
    throw new Error('Failed to save message: ' + err.message);
  }
};

// Admin Authentication
export const loginAdmin = async (username, password) => {
  try {
    const res = await smartFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
    return { success: true, token: data.access_token, source: 'api' };
  } catch {
    // Standalone fallback check
  }

  // Standalone mode credentials fallback
  if (username === 'admin' && (password === 'harsha123' || password === 'admin123')) {
    const mockToken = 'mock_jwt_token_' + Date.now();
    localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
    return { success: true, token: mockToken, source: 'local' };
  }

  throw new Error('Invalid username or password');
};

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
export const logoutAdmin = () => localStorage.removeItem(AUTH_TOKEN_KEY);

// Fetch Messages for Admin
export const fetchAdminMessages = async () => {
  const token = getAuthToken();
  if (token) {
    try {
      const res = await smartFetch('/admin/messages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch {
      // Fall back
    }
  }
  try {
    return JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '[]');
  } catch {
    return [];
  }
};

// Save Whole Portfolio Data (Dual-Mode update)
export const saveAllPortfolioData = async (fullData) => {
  saveLocalData(fullData);

  const token = getAuthToken();
  if (!token) return { success: true, source: 'local' };

  try {
    if (fullData.profile) {
      await smartFetch('/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fullData.profile),
      });
    }
    return { success: true, source: 'api' };
  } catch (e) {
    console.warn('API sync failed, saved locally:', e);
    return { success: true, source: 'local' };
  }
};

// Reset to Defaults
export const resetToDefaults = async () => {
  const token = getAuthToken();
  if (token) {
    try {
      await smartFetch('/admin/reset-defaults', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignore if offline
    }
  }
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  return defaultPortfolioData;
};
// AI Agent Chat
export const sendChatMessage = async (message) => {
  try {
    const res = await smartFetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return await res.json();
  } catch (err) {
    return {
      reply:
        "Harsha is a Software Engineer 2 at Deloitte USI with 6+ years of experience across Azure Synapse, PySpark, FastAPI, and React JS. Please configure the GEMINI_API_KEY in your Vercel Project Settings to unlock live AI responses!",
    };
  }
};
