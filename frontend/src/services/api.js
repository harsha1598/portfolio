import { defaultPortfolioData } from '../data/defaultData';

const API_BASE = (
  import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname.includes('github.io') 
    ? 'https://portfolio-lilac-theta-34.vercel.app' 
    : '')
).replace(/\/+$/, '');

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
    // If successful or client error other than 404, return response
    if (res.ok || (res.status >= 400 && res.status < 500 && res.status !== 404)) {
      return res;
    }
  } catch {
    // Continue to fallback
  }

  // Try direct route (e.g. on Vercel without /api prefix)
  try {
    const res = await fetch(`${API_BASE}${cleanPath}`, options);
    return res;
  } catch (err) {
    throw new Error(`Failed to reach ${subpath}: ${err.message}`);
  }
}

// Check if backend API is online
export const checkApiHealth = async () => {
  try {
    const res = await smartFetch('/health', { method: 'GET' });
    if (res && res.ok) {
      const data = await res.json();
      return { online: true, data };
    }
  } catch {
    // API is offline or running static on GitHub Pages without live connection
  }
  return { online: false };
};

// Fetch Portfolio Data (Primary: Vercel API -> Secondary: Local Storage Fallback)
export const fetchPortfolioData = async () => {
  const local = getLocalData();
  const isLocalCustom = Boolean(
    local && (
      local.is_custom === true || 
      (local.profile && local.profile.name && local.profile.name !== 'Developer Portfolio' && local.profile.email !== 'developer@example.com')
    )
  );

  try {
    const res = await smartFetch('/portfolio');
    if (res && res.ok) {
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
  } catch (err) {
    console.warn('API fetch failed, falling back to local storage:', err);
  }

  // Fallback: Local storage copy
  return { data: local, source: 'local' };
};

// Submit Contact Message (Vercel API -> Local Storage Fallback)
export const sendContactMessage = async (messageData) => {
  // 1. Send via Vercel backend /contact API
  try {
    const res = await smartFetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    if (res && res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend /contact failed, saving locally:', err);
  }

  // 2. Save locally if offline
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

  // Client-side fallback AI insights synthesized from parsed profile & experiences
  const topExps = experiences.slice(0, 3);
  const topCompanies = topExps.map((e) => e.company).filter(Boolean);
  const companyStr = topCompanies.length ? topCompanies.join(', ') : 'leading tech enterprises';
  const topSkills = skills.slice(0, 6).map((s) => s.name);
  const skillStr = topSkills.length ? topSkills.join(', ') : 'Cloud, Distributed Systems & Backend Engineering';
  const candName = profile.name || 'Candidate';
  const candTitle = profile.title || 'Senior Software Engineer';

  const ai_insights = [
    {
      id: 1,
      section_key: 'executive_summary',
      title: 'AI Executive Overview',
      subtitle: 'Synthesized Candidate Caliber & Leadership',
      content: JSON.stringify({
        title: 'AI Executive Overview',
        subtitle: 'Synthesized Candidate Caliber & Leadership',
        content: `${candName} is an accomplished ${candTitle} with proven engineering excellence across ${companyStr}. Known for architecting resilient distributed systems, modernizing cloud data infrastructure, and delivering robust full-lifecycle applications. Demonstrates high technical rigor from cloud backend systems to intuitive client interfaces.`,
        highlights: [
          `Enterprise track record across ${companyStr}`,
          `Core production proficiency in ${skillStr}`,
          'Proven focus on API latency reduction, query tuning, and system resiliency',
        ],
      }),
      display_order: 1,
    },
    {
      id: 2,
      section_key: 'architecture_highlights',
      title: 'Architectural Pillars & Technical Impact',
      subtitle: 'Core Engineering Accomplishments & Scalability',
      content: JSON.stringify({
        title: 'Architectural Pillars & Technical Impact',
        subtitle: 'Core Engineering Accomplishments & Scalability',
        bullets: [
          `Architected high-throughput microservices and distributed data pipelines leveraging ${skillStr}.`,
          'Engineered resilient ETL ingestion workflows handling high-volume analytical records with sub-second performance.',
          'Championed cloud modernization, automated CI/CD deployment pipelines, and containerization best practices.',
        ],
      }),
      display_order: 2,
    },
    {
      id: 3,
      section_key: 'recruiter_fit',
      title: 'Recruiter & Hiring Fast-Track',
      subtitle: 'Target Roles & Production Readiness',
      content: JSON.stringify({
        title: 'Recruiter & Hiring Fast-Track',
        subtitle: 'Target Roles & Production Readiness',
        ideal_roles: [
          `Senior ${candTitle.split(',')[0].trim() || 'Software Engineer'}`,
          'Lead Backend / Data Architect',
          'Staff Systems Engineer',
        ],
        superpowers: [
          'Full-Lifecycle Architecture',
          'Data Engineering & Cloud Optimization',
          'High-Velocity API Design',
        ],
        recommendation: `Ideal for senior technical roles requiring deep competence in ${skillStr} and a strong record of delivering mission-critical enterprise systems.`,
      }),
      display_order: 3,
    },
  ];

  return {
    profile,
    experiences,
    skills,
    projects,
    education,
    awards,
    certifications,
    ai_insights,
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
        // Fetch fresh portfolio data from backend to retrieve Gemini-generated insights
        try {
          const freshRes = await smartFetch('/portfolio');
          if (freshRes.ok) {
            const freshData = await freshRes.json();
            if (freshData && freshData.ai_insights && freshData.ai_insights.length > 0) {
              updatedData.ai_insights = freshData.ai_insights;
              saveLocalData(updatedData);
            }
          }
        } catch {}
        return { success: true, data: updatedData, source: 'api' };
      }
    } catch (e) {
      console.warn('Backend sync failed, saved locally:', e);
    }
  }

  return { success: true, data: updatedData, source: 'local' };
};

// Generate AI Insights via Backend Gemini Endpoint
export const generateAiInsightsApi = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const res = await smartFetch('/admin/generate-ai-insights', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate AI insights');
  }
  const result = await res.json();
  try {
    const freshRes = await smartFetch('/portfolio');
    if (freshRes.ok) {
      const freshData = await freshRes.json();
      if (freshData && freshData.ai_insights) {
        const local = getLocalData();
        const updated = { ...local, ai_insights: freshData.ai_insights };
        saveLocalData(updated);
        return { ...result, ai_insights: freshData.ai_insights };
      }
    }
  } catch {}
  return result;
};

// Blog Posts API (Vercel API -> Local Storage Fallback)
export const fetchBlogPosts = async () => {
  try {
    const res = await smartFetch('/posts');
    if (res && res.ok) {
      const posts = await res.json();
      if (Array.isArray(posts)) return posts;
    }
  } catch (err) {
    console.warn('Backend /posts fetch failed, using local posts:', err);
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

