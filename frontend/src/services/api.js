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
        "I am an AI assistant representing the developer. To enable live AI intelligence, please add GEMINI_API_KEY in your Vercel Project Settings!",
    };
  }
};

// Client-side parser for Resume JSON (Reactive Resume / JSON export format)
export function parseResumeJson(jsonPayload) {
  const basics = jsonPayload.basics || {};
  const summaryContent = jsonPayload.summary?.content || '';
  const cleanSummary = summaryContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  const profilesList = jsonPayload.sections?.profiles?.items || [];
  let linkedin = '', github = '', hackerrank = '', x = '', leetcode = '';
  for (const p of profilesList) {
    const net = (p.network || '').toLowerCase();
    const url = p.website?.url || '';
    if (net.includes('linkedin')) linkedin = url;
    else if (net.includes('github')) github = url;
    else if (net.includes('hackerrank')) hackerrank = url;
    else if (net.includes('x') || net.includes('twitter')) x = url;
    else if (net.includes('leetcode')) leetcode = url;
  }

  const profile = {
    name: basics.name || 'Developer Portfolio',
    title: basics.headline || 'Full Stack Developer',
    email: basics.email || 'developer@example.com',
    phone: basics.phone || '',
    location: basics.location || '',
    summary: cleanSummary,
    years_experience: 6,
    linkedin_url: linkedin,
    github_url: github,
    hackerrank_url: hackerrank,
    x_url: x,
    leetcode_url: leetcode,
    website_url: basics.website?.url || '',
    resume_download_url: '#',
  };

  const expItems = jsonPayload.sections?.experience?.items || [];
  const experiences = expItems.map((e, idx) => {
    const rawDesc = e.description || '';
    const cleanDesc = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const bullets = Array.from(rawDesc.matchAll(/<li>(?:<p>)?(.*?)(?:<\/p>)?<\/li>/gs)).map(m =>
      m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    );

    const skillsMatch = rawDesc.match(/Skill\(s\)\s*-\s*<\/strong>(.*?)<\/p>/i);
    const skillsText = skillsMatch ? skillsMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    const isCurrent = Boolean(e.dates?.present || e.period?.includes('Present'));
    const startDate = e.dates?.start || (e.period?.split('–')[0]?.trim()) || '2020';
    const endDate = isCurrent ? 'Present' : (e.dates?.end || (e.period?.split('–')[1]?.trim()) || '');

    return {
      id: idx + 1,
      company: e.company || 'Company',
      role: e.position || 'Software Engineer',
      location: e.location || '',
      start_date: startDate,
      end_date: endDate,
      is_current: isCurrent,
      skills_text: skillsText,
      description: bullets.length ? `Key initiatives at ${e.company}:` : cleanDesc,
      achievements: JSON.stringify(bullets.length ? bullets : (cleanDesc ? [cleanDesc] : [])),
      display_order: idx + 1,
    };
  });

  const skillItems = jsonPayload.sections?.skills?.items || [];
  const skills = skillItems.map((s, idx) => {
    const name = s.name || '';
    const nLow = name.toLowerCase();
    let category = 'Core Competencies';
    if (['azure', 'synapse', 'pyspark', 'databricks', 'cloud', 'aws', 'gcp'].some(k => nLow.includes(k))) {
      category = 'Cloud & Big Data';
    } else if (['python', 'django', 'java', 'spring', 'fastapi', 'flask', 'node'].some(k => nLow.includes(k))) {
      category = 'Languages & Backend';
    } else if (['react', 'angular', 'javascript', 'typescript', 'html', 'css'].some(k => nLow.includes(k))) {
      category = 'Frontend';
    } else if (['sql', 'mysql', 'postgres', 'mongo', 'database'].some(k => nLow.includes(k))) {
      category = 'Databases';
    } else if (['docker', 'kubernetes', 'git', 'devops', 'jenkins', 'pipeline'].some(k => nLow.includes(k))) {
      category = 'DevOps & Cloud';
    }
    return {
      id: idx + 1,
      name,
      category,
      proficiency: idx < 8 ? 'Expert' : 'Proficient',
      display_order: idx + 1,
    };
  });

  const projItems = jsonPayload.sections?.projects?.items || [];
  const projects = projItems.map((pr, idx) => ({
    id: idx + 1,
    title: pr.name || `Project ${idx + 1}`,
    subtitle: 'Engineered Solution',
    description: pr.description?.replace(/<[^>]+>/g, '').trim() || `${pr.name} system implementation.`,
    tech_stack: 'Python, Cloud Services, REST APIs',
    github_url: pr.website?.url || '',
    live_url: '',
    highlights: JSON.stringify([pr.description?.replace(/<[^>]+>/g, '').trim() || pr.name]),
    featured: true,
    display_order: idx + 1,
  }));

  const eduItems = jsonPayload.sections?.education?.items || [];
  const education = eduItems.map((ed, idx) => ({
    id: idx + 1,
    institution: ed.school || 'University',
    degree: ed.degree || 'Degree',
    field_of_study: ed.area || 'Engineering',
    grade: ed.grade || '',
    start_year: ed.dates?.start || (ed.period?.split('–')[0]?.trim()) || '',
    end_year: ed.dates?.end || (ed.period?.split('–')[1]?.trim()) || '',
    url: ed.website?.url || '',
  }));

  const awardItems = jsonPayload.sections?.awards?.items || [];
  const awards = awardItems.map((aw, idx) => ({
    id: idx + 1,
    title: aw.title || 'Honor',
    organization: aw.awarder || 'Organization',
    year: aw.date || aw.dates?.start || '',
    description: aw.description?.replace(/<[^>]+>/g, '').trim() || '',
    display_order: idx + 1,
  }));

  const certItems = jsonPayload.sections?.certifications?.items || [];
  const certifications = certItems.map((ct, idx) => ({
    id: idx + 1,
    name: ct.title || 'Certificate',
    issuer: ct.issuer || 'Accredited Issuer',
    issue_date: ct.date || '',
    credential_url: ct.website?.url || '',
    display_order: idx + 1,
  }));

  return {
    profile,
    experiences,
    skills,
    projects,
    education,
    awards,
    certifications,
  };
}

// Import Resume JSON (Dual-Mode: syncs to backend if online, updates localStorage)
export const importResumeJson = async (jsonPayload) => {
  const parsed = parseResumeJson(jsonPayload);
  
  // Update localStorage immediately
  const existing = getLocalData();
  const updatedData = { ...existing, ...parsed };
  saveLocalData(updatedData);

  // If authenticated and online, sync to backend
  const token = getAuthToken();
  if (token) {
    try {
      const res = await smartFetch('/admin/import-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jsonPayload),
      });
      if (res.ok) {
        return { success: true, data: updatedData, source: 'api' };
      }
    } catch (e) {
      console.warn('Backend sync failed, saved locally:', e);
    }
  }

  return { success: true, data: updatedData, source: 'local' };
};

// Blog Posts API
export const fetchBlogPosts = async () => {
  try {
    const res = await smartFetch('/posts');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall back to local posts
  }
  return getLocalData().posts || [];
};

export const createBlogPost = async (postData) => {
  const token = getAuthToken();
  if (token) {
    try {
      const res = await smartFetch('/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend create post failed, saving locally:', e);
    }
  }

  // Local fallback
  const local = getLocalData();
  const newPost = {
    id: Date.now(),
    ...postData,
    created_at: new Date().toISOString(),
  };
  local.posts = [newPost, ...(local.posts || [])];
  saveLocalData(local);
  return newPost;
};

export const updateBlogPost = async (id, postData) => {
  const token = getAuthToken();
  if (token) {
    try {
      const res = await smartFetch(`/admin/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend update post failed, saving locally:', e);
    }
  }

  // Local fallback
  const local = getLocalData();
  local.posts = (local.posts || []).map((p) => (p.id === id ? { ...p, ...postData } : p));
  saveLocalData(local);
  return postData;
};

export const deleteBlogPost = async (id) => {
  const token = getAuthToken();
  if (token) {
    try {
      const res = await smartFetch(`/admin/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend delete post failed, saving locally:', e);
    }
  }

  // Local fallback
  const local = getLocalData();
  local.posts = (local.posts || []).filter((p) => p.id !== id);
  saveLocalData(local);
  return { status: 'success' };
};

