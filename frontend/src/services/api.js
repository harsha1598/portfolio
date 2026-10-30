import { defaultPortfolioData } from '../data/defaultData';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://mmeddnoitjmoegurtafe.supabase.co').replace(/\/+$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_NukIXDw7ZwWtuEqgFZK2hw_XKkmj_Ae';

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

// Direct Supabase REST fetcher (High performance, live across all devices)
export async function fetchFromSupabase() {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };

  try {
    const [profRes, expRes, skillRes, eduRes, projRes, awardRes, certRes, postRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/experiences?select=*&order=display_order.asc`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/skills?select=*&order=display_order.asc`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/educations?select=*`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/projects?select=*&order=display_order.asc`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/awards?select=*&order=display_order.asc`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/certifications?select=*&order=display_order.asc`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/blog_posts?select=*&is_published=eq.true&order=created_at.desc`, { headers }),
    ]);

    if (profRes.ok) {
      const profiles = await profRes.json();
      if (profiles && profiles.length > 0) {
        const experiences = expRes.ok ? await expRes.json() : [];
        const skills = skillRes.ok ? await skillRes.json() : [];
        const education = eduRes.ok ? await eduRes.json() : [];
        const projects = projRes.ok ? await projRes.json() : [];
        const awards = awardRes.ok ? await awardRes.json() : [];
        const certifications = certRes.ok ? await certRes.json() : [];
        const posts = postRes.ok ? await postRes.json() : [];

        return {
          profile: profiles[0],
          experiences,
          skills,
          education,
          projects,
          awards,
          certifications,
          posts,
          is_custom: true,
        };
      }
    }
  } catch (err) {
    console.warn('Direct Supabase fetch error:', err);
  }
  return null;
}

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

// Fetch Portfolio Data (Multi-tier: Supabase Cloud DB -> FastAPI Vercel -> Local Storage)
export const fetchPortfolioData = async () => {
  // 1. First priority: Direct Supabase Cloud (Live, persistent on all devices, 0 cold starts)
  try {
    const sbData = await fetchFromSupabase();
    if (sbData && sbData.profile && sbData.profile.name && sbData.profile.name !== 'Developer Portfolio') {
      saveLocalData(sbData);
      return { data: sbData, source: 'supabase' };
    }
  } catch (e) {
    // Continue to next tier
  }

  // 2. Second priority: FastAPI Backend on Vercel
  const local = getLocalData();
  const isLocalCustom = Boolean(
    local && (
      local.is_custom === true || 
      (local.profile && local.profile.name && local.profile.name !== 'Developer Portfolio' && local.profile.email !== 'developer@example.com')
    )
  );

  try {
    const res = await smartFetch('/portfolio');
    if (res.ok) {
      const remote = await res.json();
      
      const isRemoteSeed = !remote?.profile || 
        remote.profile.name === 'Developer Portfolio' || 
        remote.profile.name === 'Your Name' || 
        remote.profile.email === 'developer@example.com';

      if (!isRemoteSeed) {
        remote.is_custom = true;
        saveLocalData(remote);
        return { data: remote, source: 'api' };
      }

      if (isLocalCustom && isRemoteSeed) {
        return { data: local, source: 'local' };
      }

      saveLocalData(remote);
      return { data: remote, source: 'api' };
    }
  } catch {
    // API is offline or unreachable
  }

  // 3. Third priority: Local storage copy
  return { data: local, source: 'local' };
};

// Submit Contact Message (Dual-Mode: Direct Supabase + Backend + Local Fallback)
export const sendContactMessage = async (messageData) => {
  // 1. Send directly to Supabase contact_messages table
  try {
    const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        name: messageData.name,
        email: messageData.email,
        subject: messageData.subject || '',
        message: messageData.message,
      }),
    });
    if (sbRes.ok) {
      return {
        status: 'success',
        message: `Thank you ${messageData.name}! Your message has been received.`,
      };
    }
  } catch {}

  // 2. Fall back to backend /contact
  try {
    const res = await smartFetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    if (res.ok) return await res.json();
  } catch {}

  // 3. Save locally if offline
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
  const dataToSave = { ...fullData, is_custom: true, last_updated: Date.now() };
  saveLocalData(dataToSave);

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
  return { ...defaultPortfolioData, is_custom: false };
};
// AI Agent Chat
export const sendChatMessage = async (message) => {
  try {
    const local = getLocalData();
    const res = await smartFetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message,
        portfolio_data: local,
      }),
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
    const cleanDesc = rawDesc
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const bullets = Array.from(rawDesc.matchAll(/<li>(?:<p>)?(.*?)(?:<\/p>)?<\/li>/gs)).map(m =>
      m[1]
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    ).filter(Boolean);

    const skillsMatch = rawDesc.match(/Skill\(s\)\s*-\s*<\/strong>(.*?)<\/p>/i);
    let skillsText = skillsMatch ? skillsMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    const period = e.period || '';
    const periodParts = period ? period.split(/\s*(?:[\u2013\u2014\-]|\bto\b)\s*/).filter(Boolean) : [];
    const isCurrent = Boolean(e.dates?.present || period.toLowerCase().includes('present'));

    let startDate = '';
    let endDate = '';
    if (periodParts.length >= 2) {
      startDate = periodParts[0];
      endDate = isCurrent ? 'Present' : periodParts[1];
    } else if (periodParts.length === 1) {
      startDate = periodParts[0];
      endDate = isCurrent ? 'Present' : '';
    } else {
      startDate = e.dates?.start || '2020';
      endDate = isCurrent ? 'Present' : (e.dates?.end || '');
    }

    const company = e.company || 'Company';
    const role = e.position || 'Software Engineer';

    let finalDesc = cleanDesc;
    let finalBullets = bullets;

    if (!cleanDesc && !bullets.length) {
      if (isCurrent) {
        finalDesc = `Software Engineer at ${company}, driving scalable backend architectures and cloud data systems.`;
        finalBullets = [
          `Driving enterprise software engineering initiatives and system architectures at ${company}.`,
          `Collaborating with cross-functional engineering teams to deliver scalable, high-performance services.`,
        ];
        if (!skillsText) {
          skillsText = 'Python, Cloud Architecture, Big Data, SQL, Microservices';
        }
      } else {
        finalDesc = `Key contributor to software engineering and data solutions at ${company}.`;
        finalBullets = [finalDesc];
      }
    } else if (!cleanDesc && bullets.length) {
      finalDesc = `Key initiatives at ${company}:`;
    }

    return {
      id: idx + 1,
      company,
      role,
      location: e.location || '',
      start_date: startDate,
      end_date: endDate,
      is_current: isCurrent,
      skills_text: skillsText,
      description: finalDesc,
      achievements: JSON.stringify(finalBullets.length ? finalBullets : (finalDesc ? [finalDesc] : [])),
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
  const education = eduItems.map((ed, idx) => {
    const edPeriod = ed.period || '';
    const edParts = edPeriod ? edPeriod.split(/\s*(?:[\u2013\u2014\-]|\bto\b)\s*/).filter(Boolean) : [];
    const startYear = edParts[0] || ed.dates?.start || '';
    const endYear = edParts[1] || ed.dates?.end || '';

    return {
      id: idx + 1,
      institution: ed.school || 'University',
      degree: ed.degree || 'Degree',
      field_of_study: ed.area || 'Engineering',
      grade: ed.grade || '',
      start_year: startYear,
      end_year: endYear,
      url: ed.website?.url || '',
    };
  });

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
  
  // Update localStorage immediately and mark as custom
  const existing = getLocalData();
  const updatedData = { 
    ...existing, 
    ...parsed, 
    is_custom: true, 
    last_updated: Date.now() 
  };
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
    const sbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=*&is_published=eq.true&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (sbRes.ok) {
      const posts = await sbRes.json();
      if (posts && posts.length > 0) return posts;
    }
  } catch {}

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

