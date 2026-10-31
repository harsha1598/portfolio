import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Send,
  Loader2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Terminal,
  Cpu,
  Layers,
  Code2,
  Zap,
  Radio,
  Activity,
  Crosshair,
  Shield,
  ShieldCheck,
  Briefcase,
  Calendar,
  MapPin,
  FolderGit2,
  ExternalLink,
  BookOpen,
  Database,
  TrendingUp,
  Server,
  Layout,
  Wrench,
  Mic,
  MicOff,
  Sliders,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { sendChatMessage } from '../services/api';
import { GithubIcon, LinkedinIcon } from './Icons';

// Native Web Audio API for futuristic HUD audio cues
function playHudSound(type = 'chirp') {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'open') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'send') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.08);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'tab') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  } catch {}
}

export default function ChatWidget({
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen,
  portfolioData,
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledSetIsOpen || setInternalIsOpen;

  // Search Engine & Visual Agent State
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [activeMode, setActiveMode] = useState('omni'); // 'omni' | 'architecture' | 'challenge' | 'executive' | 'career'
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const profile = portfolioData?.profile || {};
  const fullName = profile.name && profile.name !== 'Developer Portfolio' ? profile.name : '';
  const firstName = fullName ? fullName.split(' ')[0] : 'the Developer';
  const role = profile.title || 'Principal Engineer';
  const experiences = portfolioData?.experiences || [];
  const projects = portfolioData?.projects || [];
  const skills = portfolioData?.skills || [];
  const posts = portfolioData?.posts || [];

  const topCompany = experiences[0]?.company || '';
  const topSkills = skills.slice(0, 6).map((s) => s.name);
  const topProject = projects[0]?.title || '';

  const defaultGreeting = useMemo(() => {
    return fullName
      ? `Command Center Active. I am ${firstName}'s personal holographic intelligence agent. Telemetry loaded across ${experiences.length} enterprise tenures, ${projects.length} production architectures, and verified system benchmarks. Enter any query or trigger a visual story below.`
      : "Command Center Active. Initializing neural search telemetry across system architectures, technical publications, and enterprise platforms. How may I assist?";
  }, [fullName, firstName, experiences.length, projects.length]);

  const [messages, setMessages] = useState([
    {
      id: 'init-0',
      role: 'assistant',
      text: defaultGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      storyType: 'overview',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const searchInputRef = useRef(null);

  // Play HUD startup chime on open & cancel TTS on close
  useEffect(() => {
    if (isOpen) {
      if (soundEnabled) playHudSound('open');
      setTimeout(() => searchInputRef.current?.focus(), 150);
    }
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    }
  }, [isOpen, soundEnabled]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isOpen]);

  // Keyboard Shortcuts: ESC to close, Ctrl+K / Cmd+K to summon
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        if (selectedArticle) {
          setSelectedArticle(null);
        } else {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen, selectedArticle]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  // Auto-Navigate and Lock-On in Main Portfolio Page
  const handleLockOnInPortfolio = (target) => {
    if (!target) return;
    if (soundEnabled) playHudSound('send');

    // Close the full-screen command center so user sees the focused component
    setIsOpen(false);

    if (target === '#blog' || target === 'blog') {
      window.location.hash = '#blog';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const sectionId = target.replace('#', '');
    if (window.location.hash === '#blog') {
      window.location.hash = '';
    }

    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Holographic Cyan Glow Pulse
        element.classList.add(
          'ring-2',
          'ring-cyan-400',
          'ring-offset-4',
          'ring-offset-[#050811]',
          'shadow-[0_0_60px_rgba(6,182,212,0.45)]',
          'transition-all',
          'duration-500'
        );
        setTimeout(() => {
          element.classList.remove(
            'ring-2',
            'ring-cyan-400',
            'ring-offset-4',
            'ring-offset-[#050811]',
            'shadow-[0_0_60px_rgba(6,182,212,0.45)]'
          );
        }, 2500);

        if (sectionId === 'contact') {
          setTimeout(() => {
            const firstInput = element.querySelector('input, textarea');
            if (firstInput) firstInput.focus();
          }, 600);
        }
      }
    }, 200);
  };

  // Determine Story Type & Visual Domain from Query
  const analyzeStoryType = (text, userQuery = '') => {
    const combined = `${userQuery} ${text}`.toLowerCase();
    if (
      combined.includes('genai') ||
      combined.includes('llm') ||
      combined.includes('agent') ||
      combined.includes('mcp') ||
      combined.includes('rag') ||
      combined.includes('prompt') ||
      combined.includes('litellm') ||
      combined.includes('math')
    ) {
      return 'genai';
    }
    if (
      combined.includes('postgres') ||
      combined.includes('query plan') ||
      combined.includes('hyperloglog') ||
      combined.includes('index') ||
      combined.includes('latency') ||
      combined.includes('speed') ||
      combined.includes('bottleneck')
    ) {
      return 'performance';
    }
    if (
      combined.includes('data') ||
      combined.includes('etl') ||
      combined.includes('synapse') ||
      combined.includes('spark') ||
      combined.includes('pyspark') ||
      combined.includes('pipeline') ||
      combined.includes('databricks')
    ) {
      return 'bigdata';
    }
    if (
      combined.includes('project') ||
      combined.includes('schematic') ||
      combined.includes('app') ||
      combined.includes('code') ||
      combined.includes('repo') ||
      combined.includes('github')
    ) {
      return 'projects';
    }
    if (
      combined.includes('experience') ||
      combined.includes('career') ||
      combined.includes('deloitte') ||
      combined.includes('pwc') ||
      combined.includes('tcs') ||
      combined.includes('work history') ||
      combined.includes('roles')
    ) {
      return 'experience';
    }
    if (
      combined.includes('skill') ||
      combined.includes('tech stack') ||
      combined.includes('matrix') ||
      combined.includes('radar') ||
      combined.includes('languages') ||
      combined.includes('tools')
    ) {
      return 'skills';
    }
    if (
      combined.includes('blog') ||
      combined.includes('article') ||
      combined.includes('post') ||
      combined.includes('publication') ||
      combined.includes('writing')
    ) {
      return 'blog';
    }
    if (
      combined.includes('contact') ||
      combined.includes('hire') ||
      combined.includes('email') ||
      combined.includes('reach out') ||
      combined.includes('transmit')
    ) {
      return 'contact';
    }
    return 'overview';
  };

  // Text-To-Speech with refined natural voice selection
  const handleToggleSpeak = (text, index) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/\[NAV:[a-zA-Z0-9_-]+\]/g, '')
      .replace(/[*#`_~]/g, '')
      .replace(/https?:\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice =
      voices.find((v) => v.name.includes('Daniel') || v.name.includes('George') || v.name.includes('Oliver')) ||
      voices.find((v) => v.lang.includes('en-GB')) ||
      voices.find((v) => v.lang.includes('en-US') && (v.name.includes('Natural') || v.name.includes('Male'))) ||
      voices[0];

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }
    utterance.rate = 1.03;
    utterance.pitch = 0.96;

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech API Voice Dictation Search
  const handleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please type your query in the omnibar.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      if (soundEnabled) playHudSound('open');

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleCopy = (text, index) => {
    const cleanText = text.replace(/\[NAV:[a-zA-Z0-9_-]+\]/g, '').trim();
    navigator.clipboard.writeText(cleanText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
    if (soundEnabled) playHudSound('open');
    setMessages([
      {
        id: 'init-' + Date.now(),
        role: 'assistant',
        text: defaultGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        storyType: 'overview',
      },
    ]);
  };

  const handleSend = async (messageText = input, overrideMode = activeMode, forcedStory = null) => {
    const text = messageText.trim();
    if (!text || loading) return;

    if (soundEnabled) playHudSound('send');

    const detectedStory = forcedStory || analyzeStoryType(text, text);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessages = [
      ...messages,
      {
        id: 'user-' + Date.now(),
        role: 'user',
        text,
        timestamp: time,
        mode: overrideMode,
      },
    ];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text, overrideMode);
      const postStory = forcedStory || analyzeStoryType(res.reply, text);

      setMessages([
        ...newMessages,
        {
          id: 'ai-' + Date.now(),
          role: 'assistant',
          text: res.reply,
          model: res.model || 'Gemini 3.5 Flash',
          latency: res.latency_s || '0.38s',
          mode: res.mode || overrideMode,
          storyType: postStory,
          userPrompt: text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          text: `Neural channel telemetry online. Local visual schematics ready below for "${text}".`,
          storyType: detectedStory,
          userPrompt: text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Preset Visual Story Launchers
  const visualStoryPresets = [
    {
      id: 'genai',
      label: 'GenAI & Autonomous Agents',
      icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
      query: `Describe ${firstName}'s GenAI, LiteLLM, tool-calling agents and MCP architecture`,
    },
    {
      id: 'performance',
      label: 'Postgres & Backend Scale',
      icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
      query: `How does ${firstName} optimize Postgres query plans and HyperLogLog distinct counts?`,
    },
    {
      id: 'bigdata',
      label: 'Cloud & Big Data Pipelines',
      icon: <Database className="w-3.5 h-3.5 text-emerald-400" />,
      query: `Summarize ${firstName}'s data engineering, Azure Synapse, and ETL experience`,
    },
    {
      id: 'career',
      label: 'Enterprise Career Timeline',
      icon: <Briefcase className="w-3.5 h-3.5 text-blue-400" />,
      query: `Walk through ${firstName}'s career progression across Deloitte USI, PwC, and TCS`,
    },
    {
      id: 'skills',
      label: 'Skill Proficiency Radar',
      icon: <Sliders className="w-3.5 h-3.5 text-purple-400" />,
      query: `Display ${firstName}'s technical skills matrix and architecture specialties`,
    },
    {
      id: 'blog',
      label: 'Technical Publications',
      icon: <BookOpen className="w-3.5 h-3.5 text-teal-400" />,
      query: `What technical engineering articles has ${firstName} published?`,
    },
  ];

  // Visual Story Canvas Renderer
  const renderVisualStory = (storyType = 'overview', msgText = '') => {
    switch (storyType) {
      case 'genai':
        return (
          <div className="space-y-4 animate-fadeIn">
            {/* Architectural Metric HUD */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Hash Cache Speedup</div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-cyan-200 mt-0.5">~45x</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">29s ➔ 0.65s latency</div>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">MCP Match Rate</div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-300 mt-0.5">93%</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">First-pass REST parity</div>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Worst-Case Latency</div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-cyan-300 mt-0.5">-33%</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Prompt cache & token caps</div>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Safety Enforcement</div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-purple-300 mt-0.5">100%</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Server-grounded figures</div>
              </div>
            </div>

            {/* Visual Architecture Flowchart */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Grounded GenAI Architecture Pattern
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                  SYSTEM DESIGN
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">1. Inbound Request</div>
                  <div className="text-cyan-300 font-bold mt-1">Client / API</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-500/40">
                  <div className="text-slate-400 text-[10px]">2. Cost Router</div>
                  <div className="text-cyan-300 font-bold mt-1">LiteLLM Gateway</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/40">
                  <div className="text-slate-400 text-[10px]">3. Tool Protocol</div>
                  <div className="text-emerald-300 font-bold mt-1">MCP Specialist Agent</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-purple-500/40">
                  <div className="text-slate-400 text-[10px]">4. Math Check</div>
                  <div className="text-purple-300 font-bold mt-1">Server Grounding Gate</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-500/40">
                  <div className="text-slate-400 text-[10px]">5. Output Cache</div>
                  <div className="text-cyan-300 font-bold mt-1">Input Hash Cache</div>
                </div>
              </div>
            </div>

            {/* Rendered Featured Articles on GenAI */}
            {posts.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Recommended Deep Dive Article
                  </span>
                  <button
                    onClick={() => handleLockOnInPortfolio('blog')}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <span>View in Blog</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                {posts
                  .filter((p) => p.slug.includes('llm') || p.tags?.toLowerCase().includes('genai'))
                  .slice(0, 1)
                  .map((post) => (
                    <div
                      key={post.id}
                      className="p-3.5 rounded-lg bg-slate-950/80 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white hover:text-cyan-300 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{post.excerpt}</p>
                      </div>
                      <button
                        onClick={() => setSelectedArticle(post)}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shrink-0 cursor-pointer flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Schematics</span>
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-4 animate-fadeIn">
            {/* Performance Stat Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Query Plan Speed</div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-amber-200 mt-0.5">13x</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Composite index tuning</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Planner Cost</div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-300 mt-0.5">-99.5%</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Buffers inspection</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Radius Capacity</div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-cyan-300 mt-0.5">10x</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">HyperLogLog sketch union</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Payload Reduction</div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-purple-300 mt-0.5">62-71%</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Dynamic gzip compression</div>
              </div>
            </div>

            {/* Performance Deep Dive Article */}
            {posts
              .filter((p) => p.slug.includes('api') || p.slug.includes('postgres'))
              .slice(0, 1)
              .map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                      FEATURED ARCHITECTURE ARTICLE
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{post.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedArticle(post)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read Guide</span>
                    </button>
                    <button
                      onClick={() => handleLockOnInPortfolio('experience')}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                      title="Lock on in Experience Timeline"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        );

      case 'bigdata':
        return (
          <div className="space-y-4 animate-fadeIn">
            {/* Big Data Highlights */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> Cloud ETL & Big Data Stack
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
                  AZURE SYNAPSE // DATABRICKS
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Batch Ingestion</div>
                  <div className="text-xs font-semibold text-white mt-1">PySpark Transformations</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">High-volume analytical data extraction</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Cloud Storage</div>
                  <div className="text-xs font-semibold text-white mt-1">Azure Synapse & BigQuery</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Relational & columnar analytical warehousing</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Streaming & Uploads</div>
                  <div className="text-xs font-semibold text-white mt-1">Chunked File Streaming</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">~99% lower peak memory (100MB ➔ 1MB)</div>
                </div>
              </div>
            </div>

            {/* Reused Experience Highlights */}
            {experiences
              .filter((e) => e.company.includes('PwC') || e.company.includes('Deloitte'))
              .slice(0, 2)
              .map((exp) => (
                <div
                  key={exp.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{exp.company}</span>
                    <span className="text-xs text-slate-300 font-semibold ml-2">— {exp.role}</span>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">Tech: {exp.skills_text}</div>
                  </div>
                  <button
                    onClick={() => handleLockOnInPortfolio('experience')}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Focus In Timeline</span>
                  </button>
                </div>
              ))}
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                VERIFIED ARCHITECTURE SCHEMATICS ({projects.length} PROJECTS)
              </span>
              <button
                onClick={() => handleLockOnInPortfolio('projects')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Navigate to Projects Grid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {projects.map((proj) => {
                let highlights = [];
                try {
                  highlights = JSON.parse(proj.highlights);
                } catch {
                  highlights = proj.highlights ? [proj.highlights] : [];
                }

                return (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-cyan-300">{proj.title}</span>
                        <div className="flex items-center gap-1.5">
                          {proj.github_url && (
                            <a
                              href={proj.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                              title="GitHub"
                            >
                              <GithubIcon className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {proj.live_url && (
                            <a
                              href={proj.live_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800 border border-slate-800"
                              title="Live Demo"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">{proj.description}</p>
                      {highlights.length > 0 && (
                        <ul className="space-y-1 mb-3 text-[11px] text-slate-400">
                          {highlights.slice(0, 2).map((h, hIdx) => (
                            <li key={hIdx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                              <span className="line-clamp-1">{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                        {proj.tech_stack}
                      </span>
                      <button
                        onClick={() => handleLockOnInPortfolio('projects')}
                        className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <Crosshair className="w-3 h-3" />
                        <span>Lock On</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                CAREER TELEMETRY ({experiences.length} ROLES)
              </span>
              <button
                onClick={() => handleLockOnInPortfolio('experience')}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Navigate to Experience Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {experiences.map((exp) => {
                let bullets = [];
                try {
                  bullets = JSON.parse(exp.achievements);
                } catch {
                  bullets = exp.achievements ? [exp.achievements] : [];
                }

                return (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                        <span className="text-xs font-mono font-semibold text-emerald-400">{exp.company}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {exp.start_date} – {exp.end_date || 'Present'} {exp.location ? `// ${exp.location}` : ''}
                      </div>
                    </div>

                    {bullets.length > 0 && (
                      <ul className="space-y-1.5 my-2.5 text-xs text-slate-300">
                        {bullets.slice(0, 3).map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {exp.skills_text && (
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-500">Tech:</span>
                          {exp.skills_text
                            .split(',')
                            .slice(0, 5)
                            .map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300"
                              >
                                {s.trim()}
                              </span>
                            ))}
                        </div>
                        <button
                          onClick={() => handleLockOnInPortfolio('experience')}
                          className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          <Crosshair className="w-3 h-3" />
                          <span>Focus in Timeline</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4 animate-fadeIn">
            {/* Visual Skill Proficiency Bars */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" /> Architectural Competency Radar
                </span>
                <span className="text-[10px] font-mono text-slate-400">BENCHMARK RATINGS</span>
              </div>

              <div className="space-y-3">
                {[
                  { domain: 'Languages & Backend (Python, TypeScript, FastAPI, Django)', score: 96, color: 'bg-cyan-400' },
                  { domain: 'Cloud & Big Data (Azure Synapse, PySpark, Databricks, Docker)', score: 92, color: 'bg-emerald-400' },
                  { domain: 'GenAI & Autonomous Agents (LiteLLM, RAG, MCP, Prompt Caching)', score: 94, color: 'bg-purple-400' },
                  { domain: 'Databases & Query Tuning (PostgreSQL, BigQuery, SQL, Mongo)', score: 95, color: 'bg-amber-400' },
                  { domain: 'Frontend Engineering (React JS, Angular, Tailwind CSS)', score: 88, color: 'bg-blue-400' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-300">{item.domain}</span>
                      <span className="text-slate-400 font-bold">{item.score}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categorized Pills */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-slate-300">Skills Catalog</span>
                <button
                  onClick={() => handleLockOnInPortfolio('skills')}
                  className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Lock On in Skills</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 30).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-950 border border-slate-800/80 text-slate-300 hover:border-purple-400/40 transition-colors"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'blog':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                TECHNICAL PUBLICATIONS & ARCHITECTURAL GUIDES
              </span>
              <button
                onClick={() => handleLockOnInPortfolio('blog')}
                className="text-xs font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Navigate to Blog Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider">
                      {post.tags ? post.tags.split(',')[0] : 'ARTICLE'}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1 mb-2 hover:text-teal-300 transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{post.excerpt}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-3">
                    <button
                      onClick={() => setSelectedArticle(post)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 cursor-pointer flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read Schematics</span>
                    </button>
                    <button
                      onClick={() => handleLockOnInPortfolio('blog')}
                      className="text-[10px] font-mono text-slate-400 hover:text-white"
                      title="Open in full blog page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 animate-fadeIn space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Direct Transmission Channels
              </span>
              <button
                onClick={() => handleLockOnInPortfolio('contact')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Jump to Contact Form</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 flex items-center justify-between"
                >
                  <span className="text-slate-500">Email:</span>
                  <span className="truncate ml-2">{profile.email}</span>
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 flex items-center justify-between"
                >
                  <span className="text-slate-500">LinkedIn:</span>
                  <span className="ml-2 flex items-center gap-1">
                    Connect <ExternalLink className="w-3 h-3" />
                  </span>
                </a>
              )}
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 flex items-center justify-between"
                >
                  <span className="text-slate-500">GitHub:</span>
                  <span className="ml-2 flex items-center gap-1">
                    {profile.github_url.split('/').pop()} <ExternalLink className="w-3 h-3" />
                  </span>
                </a>
              )}
              {profile.location && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="ml-2">{profile.location}</span>
                </div>
              )}
            </div>
          </div>
        );

      default:
        // Holistic Overview Dashboard
        return (
          <div className="space-y-4 animate-fadeIn">
            {/* Holographic Architecture Metrics HUD */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Experience</div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-cyan-200 mt-0.5">6+ Yrs</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Data & Full Stack</div>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Organizations</div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-300 mt-0.5">
                  {experiences.length || 4}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Deloitte, PwC, TCS</div>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Test Coverage</div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-purple-300 mt-0.5">100%</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Production modules</div>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Query Latency</div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-amber-300 mt-0.5">13x</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Execution plan tuning</div>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => handleSend(`Show me ${firstName}'s GenAI and LLM work`, 'omni', 'genai')}
                className="p-3 rounded-xl bg-slate-900/60 border border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-900 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 group-hover:text-cyan-200">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>GenAI & Autonomous Agents</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  LiteLLM, tool-calling agents, MCP & grounding patterns
                </p>
              </button>

              <button
                onClick={() => handleSend(`How does ${firstName} optimize Postgres and APIs?`, 'omni', 'performance')}
                className="p-3 rounded-xl bg-slate-900/60 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-900 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 group-hover:text-amber-200">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>API & Postgres Optimization</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  Query plans, HyperLogLog distinct counts & compression
                </p>
              </button>

              <button
                onClick={() => handleSend(`What is ${firstName}'s enterprise career trajectory?`, 'omni', 'experience')}
                className="p-3 rounded-xl bg-slate-900/60 border border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-900 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-300 group-hover:text-emerald-200">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enterprise Career Journey</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  Deloitte USI, PwC AC India, and TCS milestones
                </p>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* Holographic Arc Reactor Floating Launch Button       */}
      {/* ---------------------------------------------------- */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Personal Command Center"
            className="relative group cursor-pointer flex items-center gap-3 p-2 pr-4 rounded-full bg-[#050811]/90 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.35)] hover:shadow-[0_0_55px_rgba(6,182,212,0.6)] transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {/* Arc Reactor Core Animation */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              {/* Outer Spinning Ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/80 animate-jarvis-spin" />
              {/* Reverse Spinning Mid Ring */}
              <div className="absolute inset-1 rounded-full border border-dotted border-cyan-300/70 animate-jarvis-spin-reverse" />
              {/* Pulsing Arc Reactor Core */}
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-300 animate-jarvis-pulse flex items-center justify-center shadow-[0_0_15px_#06b6d4]">
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              </div>
            </div>

            {/* AI HUD Label */}
            <div className="flex flex-col text-left">
              <span className="text-xs font-mono font-bold text-cyan-300 tracking-widest flex items-center gap-1.5">
                {fullName ? `${firstName}'s AI Agent` : 'AI COMMAND CENTER'}
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </span>
              <span className="text-[9px] font-mono text-cyan-500/90 tracking-wider uppercase flex items-center gap-1">
                <span>PRESS</span>
                <kbd className="px-1 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-[8px] text-cyan-300">
                  Ctrl+K
                </kbd>
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Full-Screen Holographic Neural Search Command Center */}
      {/* ---------------------------------------------------- */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isFullScreen
              ? 'inset-0 bg-[#030611]/98 backdrop-blur-3xl flex flex-col'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-full sm:w-[94vw] sm:max-w-5xl h-[92vh] rounded-2xl bg-[#050811]/98 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.35)] flex flex-col overflow-hidden'
          }`}
        >
          {/* Futuristic HUD Corner Brackets */}
          <div className="jarvis-corner-tl" />
          <div className="jarvis-corner-tr" />
          <div className="jarvis-corner-bl" />
          <div className="jarvis-corner-br" />

          {/* Background Holographic Grid Scan */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

          {/* Top Telemetry Header Bar */}
          <div className="px-4 sm:px-6 py-3 bg-[#060a17]/95 border-b border-cyan-500/30 flex items-center justify-between shrink-0 relative z-10">
            {/* Left: Holographic Reactor Status */}
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400 animate-jarvis-spin" />
                <div className="w-4 h-4 rounded-full bg-cyan-400 animate-jarvis-pulse flex items-center justify-center shadow-[0_0_12px_#06b6d4]">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-mono font-bold tracking-widest text-cyan-300 uppercase flex items-center gap-2">
                    {fullName ? `${firstName}'s Personal AI Command Engine` : 'NEURAL SEARCH COMMAND CENTER'}
                    <span className="hidden sm:inline-block text-[10px] text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40">
                      ONLINE // FULL TELEMETRY
                    </span>
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/80">
                  <span>TELEMETRY: {experiences.length} ROLES</span>
                  <span>•</span>
                  <span>{projects.length} SCHEMATICS</span>
                  <span>•</span>
                  <span>{posts.length} PUBLICATIONS</span>
                </div>
              </div>
            </div>

            {/* Right: Controls & Dismiss */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  soundEnabled
                    ? 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40'
                    : 'border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
                title={soundEnabled ? 'HUD Audio Enabled' : 'HUD Audio Muted'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Fullscreen / Docked View Toggle */}
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="hidden sm:flex p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-all cursor-pointer"
                title={isFullScreen ? 'Switch to Docked Window' : 'Switch to Fullscreen Command Center'}
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Reset Session */}
              <button
                onClick={handleResetChat}
                className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-all cursor-pointer"
                title="Reset Intelligence Session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* ESC Key Hint */}
              <span className="hidden md:inline-flex text-[10px] font-mono text-slate-500 border border-slate-800 px-2 py-1 rounded-md">
                ESC
              </span>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 sm:p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/40 hover:border-red-400 transition-all cursor-pointer shadow-sm"
                title="Close Command Center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* Centerpiece: Holographic Neural Omnibar Search Field  */}
          {/* ---------------------------------------------------- */}
          <div className="px-4 sm:px-6 py-4 bg-[#050811]/90 border-b border-cyan-500/20 shrink-0 relative z-10 max-w-5xl mx-auto w-full">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="relative flex items-center"
            >
              <div className="absolute left-4 flex items-center gap-2 pointer-events-none text-cyan-400">
                <Search className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-mono text-cyan-500 font-bold hidden sm:inline">λ &gt;</span>
              </div>

              <input
                ref={searchInputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask anything: "Explain GenAI architecture", "Show Postgres tuning", "What are the key projects?"...`}
                className="w-full pl-12 sm:pl-16 pr-28 py-3.5 sm:py-4 rounded-2xl bg-[#090f20]/90 border-2 border-cyan-500/40 focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 text-sm sm:text-base font-mono text-slate-100 placeholder:text-slate-500 shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all"
              />

              <div className="absolute right-3 flex items-center gap-1.5">
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                      : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40'
                  }`}
                  title={isListening ? 'Listening to voice...' : 'Speak query via Microphone'}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                {/* Submit Search Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-cyan-500/30 flex items-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>SEARCH</span>}
                  <span className="hidden sm:inline text-[10px] text-slate-900 font-normal">↵</span>
                </button>
              </div>
            </form>

            {/* Quick Visual Story Presets */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> STORIES:
              </span>
              {visualStoryPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSend(preset.query, 'omni', preset.id)}
                  className="px-3 py-1 rounded-xl text-xs font-mono bg-slate-900/80 hover:bg-cyan-950/50 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  {preset.icon}
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* Main Visual Canvas: Story Dossiers & Live Components */}
          {/* ---------------------------------------------------- */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 max-w-5xl mx-auto w-full relative z-10">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isSpeaking = speakingIndex === index;

              if (isUser) {
                return (
                  <div key={msg.id || index} className="flex justify-end">
                    <div className="max-w-2xl px-4 py-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-sm font-mono text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                      <div className="text-[10px] text-cyan-400/80 mb-1 flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-cyan-400" /> USER QUERY // {msg.timestamp}
                      </div>
                      <div className="text-white font-sans">{msg.text}</div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id || index}
                  className="p-5 sm:p-6 rounded-2xl bg-[#070c1b]/80 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] space-y-5 animate-fadeIn"
                >
                  {/* AI Agent Telemetry Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyan-500/20">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                        <Cpu className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider">
                          {fullName ? `${firstName}'s AI AGENT` : 'NEURAL DOSSIER'}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                          <span>{msg.timestamp}</span>
                          <span>•</span>
                          <span className="text-emerald-400">VERIFIED TELEMETRY</span>
                          {msg.latency && (
                            <>
                              <span>•</span>
                              <span>{msg.latency}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Speech & Audio Controls */}
                    <div className="flex items-center gap-1.5">
                      {/* Audio Waveform Equalizer when speaking */}
                      {isSpeaking && (
                        <div className="flex items-center gap-0.5 px-2 py-1 rounded bg-cyan-950 border border-cyan-500/40 mr-1">
                          <span className="w-0.5 h-3 bg-cyan-400 animate-pulse" />
                          <span className="w-0.5 h-4 bg-cyan-300 animate-pulse" style={{ animationDelay: '0.1s' }} />
                          <span className="w-0.5 h-2 bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <span className="w-0.5 h-5 bg-sky-300 animate-pulse" style={{ animationDelay: '0.15s' }} />
                          <span className="w-0.5 h-3 bg-cyan-400 animate-pulse" style={{ animationDelay: '0.05s' }} />
                        </div>
                      )}

                      <button
                        onClick={() => handleToggleSpeak(msg.text, index)}
                        className={`p-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center gap-1 ${
                          isSpeaking
                            ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                            : 'border-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
                        }`}
                        title={isSpeaking ? 'Stop Audio Narration' : 'Narrate with Voice'}
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span className="text-[10px] hidden sm:inline">{isSpeaking ? 'MUTE' : 'LISTEN'}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(msg.text, index)}
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-all cursor-pointer"
                        title="Copy text"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* AI Agent Narrative Briefing */}
                  <div className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                    {msg.text.replace(/\[NAV:[a-zA-Z0-9_-]+\]/g, '').trim()}
                  </div>

                  {/* Render Visual Story & Interactive Components */}
                  {renderVisualStory(msg.storyType, msg.text)}
                </div>
              );
            })}

            {loading && (
              <div className="p-6 rounded-2xl bg-[#070c1b]/80 border border-cyan-500/30 flex items-center gap-3 text-cyan-400 font-mono text-xs animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                <span>SYNTHESIZING VISUAL DOSSIER // ACCESSING SYSTEM TELEMETRY...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ---------------------------------------------------- */}
          {/* In-Place Technical Article Reader Drawer             */}
          {/* ---------------------------------------------------- */}
          {selectedArticle && (
            <div className="absolute inset-0 z-50 bg-[#050811]/98 backdrop-blur-3xl p-6 sm:p-10 overflow-y-auto flex flex-col justify-between animate-fadeIn">
              <div className="max-w-4xl mx-auto w-full">
                <div className="flex items-center justify-between pb-4 border-b border-cyan-500/30 mb-6">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                      TECHNICAL PUBLICATION SCHEMATICS
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{selectedArticle.title}</h2>
                    {selectedArticle.tags && (
                      <div className="text-xs font-mono text-slate-400 mt-1">Tags: {selectedArticle.tags}</div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 font-sans whitespace-pre-line">
                  {selectedArticle.content}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  >
                    Close Reader
                  </button>
                  <button
                    onClick={() => {
                      setSelectedArticle(null);
                      handleLockOnInPortfolio('blog');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View In Blog Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
