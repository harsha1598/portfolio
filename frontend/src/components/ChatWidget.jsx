import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
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
  Disc,
} from 'lucide-react';
import { sendChatMessage } from '../services/api';

// Native Web Audio API for futuristic J.A.R.V.I.S. HUD audio cues
function playJarvisSound(type = 'chirp') {
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
      // High-tech ascending HUD power-on chord
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'send') {
      // High-tech blip
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.08);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
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

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState('general'); // 'general' | 'technical' | 'challenge' | 'recruiter' | 'tldr'
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const profile = portfolioData?.profile || {};
  const fullName = profile.name && profile.name !== 'Developer Portfolio' ? profile.name : '';
  const firstName = fullName ? fullName.split(' ')[0] : 'the Developer';
  const role = profile.title || 'Principal Engineer';
  const topCompany = portfolioData?.experiences?.[0]?.company || '';
  const topSkills = (portfolioData?.skills || []).slice(0, 5).map((s) => s.name);
  const topProject = portfolioData?.projects?.[0]?.title || '';

  const defaultGreeting = useMemo(() => {
    return fullName
      ? `At your service. I am J.A.R.V.I.S., ${firstName}'s personal holographic intelligence interface. I maintain complete telemetry on ${firstName}'s system architectures${
          topCompany ? `, cloud engineering at ${topCompany}` : ''
        }, and production milestones. Where shall we direct our attention?`
      : "At your service. I am J.A.R.V.I.S., the holographic intelligence interface. Accessing engineering schematics and architectural telemetry. How may I assist?";
  }, [fullName, firstName, topCompany]);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: defaultGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Play HUD startup chime on open
  useEffect(() => {
    if (isOpen && soundEnabled) {
      playJarvisSound('open');
    }
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    }
  }, [isOpen, soundEnabled]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  // Auto-Navigate to Component without requiring manual button clicks
  const autoNavigateToComponent = (target) => {
    if (!target) return;
    if (soundEnabled) playJarvisSound('send');

    if (target === '#blog' || target === 'blog') {
      window.location.hash = '#blog';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const sectionId = target.replace('#', '');
    if (window.location.hash === '#blog') {
      window.location.hash = '';
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Holographic Cyan Glow Pulse on the auto-navigated component
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
  };

  const detectNavigationTarget = (text, userQuery = '') => {
    const navMatch = text.match(/\[NAV:([a-zA-Z0-9_-]+)\]/);
    if (navMatch) return navMatch[1];

    const combined = `${userQuery} ${text}`.toLowerCase();
    if (combined.includes('project') || combined.includes('schematic') || combined.includes('streaming engine')) {
      return 'projects';
    }
    if (combined.includes('skill') || combined.includes('tech stack') || combined.includes('technolog') || combined.includes('language')) {
      return 'skills';
    }
    if (combined.includes('philosoph') || combined.includes('architecture milestone') || combined.includes('insight')) {
      return 'ai-insights';
    }
    if (combined.includes('experience') || combined.includes('career') || combined.includes('compan') || combined.includes('work history')) {
      return 'experience';
    }
    if (combined.includes('contact') || combined.includes('hire') || combined.includes('email') || combined.includes('transmit') || combined.includes('reach out')) {
      return 'contact';
    }
    if (combined.includes('blog') || combined.includes('article') || combined.includes('post')) {
      return 'blog';
    }
    return null;
  };

  // Text-To-Speech with refined J.A.R.V.I.S. voice selection
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

    // Prioritize refined British or distinguished English voices (Daniel, UK English, etc.)
    const voices = window.speechSynthesis.getVoices();
    const jarvisVoice =
      voices.find((v) => v.name.includes('Daniel') || v.name.includes('George') || v.name.includes('Oliver')) ||
      voices.find((v) => v.lang.includes('en-GB')) ||
      voices.find((v) => v.lang.includes('en-US') && (v.name.includes('Natural') || v.name.includes('Male'))) ||
      voices[0];

    if (jarvisVoice) {
      utterance.voice = jarvisVoice;
    }
    utterance.rate = 1.02;
    utterance.pitch = 0.95; // Slightly lower pitch for that calm J.A.R.V.I.S. delivery

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
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
    if (soundEnabled) playJarvisSound('open');
    setMessages([
      {
        role: 'assistant',
        text: defaultGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Render message with J.A.R.V.I.S. auto-navigation telemetry (no buttons needed)
  const renderMessageContent = (rawText, isUser, navTarget) => {
    if (isUser) {
      return <span>{rawText}</span>;
    }

    const cleanText = rawText.replace(/\[NAV:[a-zA-Z0-9_-]+\]/g, '').trim();

    return (
      <div className="space-y-3">
        <div className="whitespace-pre-line leading-relaxed font-sans text-slate-200">{cleanText}</div>

        {navTarget && (
          <div className="pt-2 border-t border-cyan-500/20 flex items-center gap-2 text-[10px] font-mono text-cyan-300">
            <Crosshair className="w-3 h-3 text-cyan-400 animate-spin" />
            <span>AUTO-NAVIGATED DISPLAY // #{navTarget.toUpperCase()}</span>
          </div>
        )}
      </div>
    );
  };

  const handleSend = async (messageText = input, overrideMode = activeMode, explicitTarget = null) => {
    const text = messageText.trim();
    if (!text || loading) return;

    if (soundEnabled) playJarvisSound('send');
    if (explicitTarget) {
      autoNavigateToComponent(explicitTarget);
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages = [...messages, { role: 'user', text, timestamp: time, mode: overrideMode }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text, overrideMode);
      const detectedTarget = explicitTarget || detectNavigationTarget(res.reply, text);
      if (detectedTarget) {
        autoNavigateToComponent(detectedTarget);
      }

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: res.reply,
          model: res.model,
          latency: res.latency_s,
          mode: res.mode || overrideMode,
          navTarget: detectedTarget,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      autoNavigateToComponent('contact');
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: "Communications link disrupted. Auto-navigating to the secure contact channel.",
          navTarget: 'contact',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // J.A.R.V.I.S. HUD Prompts
  const modePrompts = useMemo(() => {
    if (activeMode === 'technical') {
      return [
        `How does ${firstName} optimize API latency?`,
        `Describe ${firstName}'s distributed microservices patterns`,
        `How does ${firstName} tune relational query execution?`,
      ];
    }
    if (activeMode === 'challenge') {
      return [
        `How would ${firstName} design a 100k events/sec streaming pipeline?`,
        `How would ${firstName} architect a fault-tolerant caching layer with Redis?`,
        `How would ${firstName} migrate a monolith to distributed microservices?`,
      ];
    }
    if (activeMode === 'recruiter') {
      return [
        `What makes ${firstName} stand out for senior engineering roles?`,
        topCompany ? `What was ${firstName}'s impact at ${topCompany}?` : `What are ${firstName}'s career highlights?`,
        `How can our engineering team contact ${firstName}?`,
      ];
    }
    if (activeMode === 'tldr') {
      return [
        `Provide a 60-second executive summary of ${firstName}`,
        `What are ${firstName}'s top 3 engineering superpowers?`,
      ];
    }
    return [
      topProject ? `Retrieve schematics for the ${topProject} project` : `What are ${firstName}'s top projects?`,
      topCompany ? `Analyze ${firstName}'s achievements at ${topCompany}` : `Tell me about ${firstName}'s experience`,
      `Display ${firstName}'s core production tech stack`,
    ];
  }, [activeMode, firstName, topCompany, topProject]);

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* ---------------------------------------------------- */}
      {/* J.A.R.V.I.S. Holographic Arc Reactor Floating Button */}
      {/* ---------------------------------------------------- */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Initialize J.A.R.V.I.S. AI Interface"
          className="relative group cursor-pointer flex items-center gap-3 p-2 pr-4 rounded-full bg-[#050811]/90 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] transition-all duration-300 hover:scale-105 active:scale-95"
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

          {/* J.A.R.V.I.S. HUD Label */}
          <div className="flex flex-col text-left">
            <span className="text-xs font-mono font-bold text-cyan-300 tracking-widest flex items-center gap-1.5">
              J.A.R.V.I.S.
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </span>
            <span className="text-[9px] font-mono text-cyan-500/90 tracking-wider uppercase">
              {fullName ? `${firstName} // PROTOCOL` : 'AI PROTOCOL'}
            </span>
          </div>
        </button>
      )}

      {/* ---------------------------------------------------- */}
      {/* J.A.R.V.I.S. Holographic HUD Console Window           */}
      {/* ---------------------------------------------------- */}
      {isOpen && (
        <div
          className={`relative bg-[#050811]/95 backdrop-blur-2xl jarvis-hud-border rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.35)] flex flex-col overflow-hidden animate-fadeIn transition-all duration-300 text-slate-100 ${
            isExpanded
              ? 'w-[94vw] sm:w-[680px] h-[720px] max-h-[90vh]'
              : 'w-[92vw] sm:w-[430px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Futuristic HUD Corner Brackets */}
          <div className="jarvis-corner-tl" />
          <div className="jarvis-corner-tr" />
          <div className="jarvis-corner-bl" />
          <div className="jarvis-corner-br" />

          {/* Background Holographic Grid Scan */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

          {/* Header Bar */}
          <div className="px-4 py-3 bg-[#070b16]/90 border-b border-cyan-500/30 flex items-center justify-between shrink-0 relative z-10">
            <div className="flex items-center gap-3">
              {/* Mini Arc Reactor Visualizer */}
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400 animate-jarvis-spin" />
                <div className="w-4 h-4 rounded-full bg-cyan-400 animate-jarvis-pulse flex items-center justify-center shadow-[0_0_12px_#06b6d4]">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase flex items-center gap-1.5">
                    J.A.R.V.I.S.
                    <span className="text-[10px] text-cyan-400 font-normal px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/30">
                      MK-IV
                    </span>
                  </h3>
                </div>
                <p className="text-[9px] text-cyan-400/80 font-mono tracking-wider truncate max-w-[220px]">
                  {fullName ? `${fullName} // ARCHIVES` : 'NEURAL TELEMETRY // ONLINE'}
                </p>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  soundEnabled ? 'text-cyan-400 hover:bg-cyan-950/60' : 'text-slate-500 hover:text-slate-400'
                }`}
                title={soundEnabled ? 'HUD Audio: ON' : 'HUD Audio: OFF'}
              >
                <Radio className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleResetChat}
                className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-cyan-950/60 transition-colors cursor-pointer"
                title="Re-initialize J.A.R.V.I.S. protocol"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-cyan-950/60 transition-colors cursor-pointer"
                title={isExpanded ? 'Compact mode' : 'Expand holographic display'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Disengage J.A.R.V.I.S."
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* J.A.R.V.I.S. System Telemetry Bar */}
          <div className="px-3 py-1.5 bg-[#03060f] border-b border-cyan-500/20 flex items-center justify-between text-[9px] font-mono text-cyan-400/80 shrink-0">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>CORE: ACTIVE</span>
              <span className="text-slate-600">|</span>
              <span>ENGINE: GEMINI 3.5</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">SECURITY: CLEARED</span>
            </span>
          </div>

          {/* J.A.R.V.I.S. Holographic Protocol Selector */}
          <div className="px-3 py-2 bg-[#050812]/90 border-b border-cyan-500/20 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono shrink-0 scrollbar-none">
            <span className="text-cyan-500/70 text-[9px] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> PROTOCOL:
            </span>

            <button
              onClick={() => setActiveMode('general')}
              className={`px-2.5 py-1 rounded-md shrink-0 transition-all cursor-pointer ${
                activeMode === 'general'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-cyan-950/40'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveMode('technical')}
              className={`px-2.5 py-1 rounded-md shrink-0 transition-all cursor-pointer ${
                activeMode === 'technical'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-cyan-950/40'
              }`}
            >
              ⚡ Tech Matrix
            </button>

            <button
              onClick={() => setActiveMode('challenge')}
              className={`px-2.5 py-1 rounded-md shrink-0 transition-all cursor-pointer ${
                activeMode === 'challenge'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-cyan-950/40'
              }`}
            >
              🛡️ System Challenge
            </button>

            <button
              onClick={() => setActiveMode('recruiter')}
              className={`px-2.5 py-1 rounded-md shrink-0 transition-all cursor-pointer ${
                activeMode === 'recruiter'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-cyan-950/40'
              }`}
            >
              📋 Career Dossier
            </button>

            <button
              onClick={() => setActiveMode('tldr')}
              className={`px-2.5 py-1 rounded-md shrink-0 transition-all cursor-pointer ${
                activeMode === 'tldr'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-cyan-950/40'
              }`}
            >
              ⏱️ 60s Brief
            </button>
          </div>

          {/* Quick HUD Directive Shortcuts */}
          <div className="px-3 py-1.5 bg-[#03060f]/80 border-b border-cyan-500/20 flex items-center justify-between text-[9px] font-mono text-cyan-400/70 shrink-0">
            <span className="text-cyan-500/80">DIRECTIVES:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSend(`Retrieve schematics for ${firstName}'s top engineering projects`, 'technical', 'projects')}
                className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Code2 className="w-3 h-3 text-cyan-400" />
                <span>Schematics</span>
              </button>
              <span className="text-cyan-900">|</span>
              <button
                onClick={() => handleSend(`What is ${firstName}'s core production tech stack?`, 'technical', 'skills')}
                className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>Stack</span>
              </button>
              <span className="text-cyan-900">|</span>
              <button
                onClick={() => handleSend(`Detail ${firstName}'s architectural philosophy`, 'technical', 'ai-insights')}
                className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Philosophy</span>
              </button>
              <span className="text-cyan-900">|</span>
              <button
                onClick={() => handleSend(`How can I transmit a message to ${firstName}?`, 'general', 'contact')}
                className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Send className="w-3 h-3 text-cyan-400" />
                <span>Transmit</span>
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs relative z-10">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-4 leading-relaxed relative group ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-br-xs shadow-md shadow-cyan-500/20'
                      : 'bg-[#090e1c]/90 border border-cyan-500/30 text-slate-200 rounded-bl-xs shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                  }`}
                >
                  {/* Subtle top indicator for J.A.R.V.I.S. replies */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-400 tracking-wider uppercase mb-1.5 opacity-80">
                      <Disc className="w-3 h-3 text-cyan-400 animate-spin" />
                      <span>J.A.R.V.I.S. INTEL // TRANSMISSION</span>
                    </div>
                  )}

                  {renderMessageContent(msg.text, msg.role === 'user', msg.navTarget)}

                  {/* Assistant Telemetry & Audio Bar */}
                  {msg.role === 'assistant' && (
                    <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[9px] font-mono text-cyan-500">
                      <div className="flex items-center gap-2">
                        {msg.latency && (
                          <span className="text-cyan-400">⚡ {msg.latency}s</span>
                        )}
                        {msg.mode && msg.mode !== 'general' && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                            {msg.mode}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Audio Speech Protocol Button */}
                        <button
                          onClick={() => handleToggleSpeak(msg.text, i)}
                          className={`p-1 rounded hover:bg-cyan-950/60 transition-colors cursor-pointer ${
                            speakingIndex === i ? 'text-cyan-300' : 'text-slate-400 hover:text-cyan-300'
                          }`}
                          title={speakingIndex === i ? 'Halt Voice Protocol' : 'Engage Voice Protocol'}
                        >
                          {speakingIndex === i ? (
                            <div className="flex items-center gap-1 text-cyan-300">
                              <VolumeX className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                              <span className="text-[9px] font-bold">SPEAKING</span>
                              {/* Audio Wave Bars */}
                              <div className="flex items-center gap-0.5 ml-1">
                                <span className="w-0.5 bg-cyan-400 animate-[jarvis-wave_0.8s_ease-in-out_infinite]" />
                                <span className="w-0.5 bg-cyan-400 animate-[jarvis-wave_0.8s_ease-in-out_0.2s_infinite]" />
                                <span className="w-0.5 bg-cyan-400 animate-[jarvis-wave_0.8s_ease-in-out_0.4s_infinite]" />
                              </div>
                            </div>
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleCopy(msg.text, i)}
                          className="p-1 rounded hover:bg-cyan-950/60 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                          title="Copy Telemetry to Clipboard"
                        >
                          {copiedIndex === i ? (
                            <Check className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[9px] font-mono text-cyan-600/80 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Thinking / Computing Pulse */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#090e1c]/90 border border-cyan-500/40 rounded-2xl px-4 py-2.5 flex items-center gap-3 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  {/* Spinning Arc Core */}
                  <div className="relative w-4 h-4 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400 animate-jarvis-spin" />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                  <span className="text-xs font-mono tracking-wider">
                    {activeMode === 'challenge'
                      ? 'COMPUTING SYSTEM DESIGN BLUEPRINT...'
                      : activeMode === 'technical'
                      ? 'RETRIEVING ARCHITECTURAL TELEMETRY...'
                      : 'PROCESSING QUERY...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* J.A.R.V.I.S. Holographic Suggested Directives */}
          <div className="px-3 py-2 bg-[#050812]/95 border-t border-cyan-500/30 shrink-0 relative z-10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-mono text-cyan-400 tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" /> SUGGESTED DIRECTIVES
              </span>
              <span className="text-[8px] font-mono text-cyan-600">TRANSMIT DIRECTIVE</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-none">
              {modePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-[#090e1c] text-cyan-300/90 hover:text-white hover:border-cyan-400 border border-cyan-500/30 transition-all text-left shadow-sm active:scale-95 cursor-pointer truncate max-w-full"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Holographic Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#03060f] border-t border-cyan-500/30 flex items-center gap-2 shrink-0 relative z-10"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeMode === 'challenge'
                  ? 'Pose system challenge (e.g. 100k events/sec streaming)...'
                  : activeMode === 'technical'
                  ? 'Inquire about latency, asynchronous pipelines, microservices...'
                  : `Inquire about ${firstName}'s architecture, codebases, or projects...`
              }
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#090e1c] border border-cyan-500/30 text-xs text-cyan-100 placeholder-cyan-600/70 outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] font-mono transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold disabled:opacity-30 transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95"
              title="Transmit query"
            >
              <Send className="w-4 h-4 text-slate-950" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
