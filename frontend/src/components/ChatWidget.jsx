import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Loader2,
  MessageSquare,
  ArrowRight,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Compass,
  Cpu,
  Layers,
  ExternalLink,
  Check,
  Copy,
  Terminal,
  Code2,
  Briefcase,
  Wrench,
  Zap,
  Target,
} from 'lucide-react';
import { sendChatMessage } from '../services/api';

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

  const profile = portfolioData?.profile || {};
  const fullName = profile.name && profile.name !== 'Developer Portfolio' ? profile.name : '';
  const firstName = fullName ? fullName.split(' ')[0] : 'the Developer';
  const role = profile.title || 'Engineer';
  const topCompany = portfolioData?.experiences?.[0]?.company || '';
  const secondCompany = portfolioData?.experiences?.[1]?.company || '';
  const topSkills = (portfolioData?.skills || []).slice(0, 5).map((s) => s.name);
  const topProject = portfolioData?.projects?.[0]?.title || '';

  const agentTitle = fullName ? `${firstName}'s AI Agent` : 'Portfolio AI Agent';
  const buttonLabel = fullName ? `Ask ${firstName}'s Agent` : 'Ask AI Agent';

  const defaultGreeting = useMemo(() => {
    return fullName
      ? `Hi! I'm ${firstName}'s interactive AI Agent. Ask me about their engineering projects${
          topCompany ? `, architecture at ${topCompany}` : ''
        }, challenge me with a system design scenario, or explore technical skills!`
      : "Hi! I'm the portfolio interactive AI Agent. Ask me about engineering projects, architecture challenges, or technical skills!";
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

  // Stop speech if widget closes
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  // Page Navigation Action Handler
  const handleNavigatePage = (target) => {
    if (target === '#blog') {
      window.location.hash = '#blog';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const sectionId = target.replace('#', '');
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Temporary highlight pulse
      element.classList.add('ring-2', 'ring-emerald-400', 'ring-offset-2', 'ring-offset-[#07090e]');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-emerald-400', 'ring-offset-2', 'ring-offset-[#07090e]');
      }, 2000);

      // If contact, auto focus input
      if (sectionId === 'contact') {
        setTimeout(() => {
          const firstInput = element.querySelector('input, textarea');
          if (firstInput) firstInput.focus();
        }, 500);
      }
    }
  };

  // Text-to-Speech handler
  const handleToggleSpeak = (text, index) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text: strip markdown & NAV tags
    const cleanText = text
      .replace(/\[NAV:[a-zA-Z0-9_-]+\]/g, '')
      .replace(/[*#`_~]/g, '')
      .replace(/https?:\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Copy handler
  const handleCopy = (text, index) => {
    const cleanText = text.replace(/\[NAV:[a-zA-Z0-9_-]+\]/g, '').trim();
    navigator.clipboard.writeText(cleanText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Reset conversation
  const handleResetChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
    setMessages([
      {
        role: 'assistant',
        text: defaultGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Parse message text and extract navigation actions
  const renderMessageContent = (rawText, isUser) => {
    if (isUser) {
      return <span>{rawText}</span>;
    }

    // Extract NAV triggers
    const navRegex = /\[NAV:([a-zA-Z0-9_-]+)\]/g;
    const actions = [];
    let match;
    while ((match = navRegex.exec(rawText)) !== null) {
      const target = match[1];
      if (target === 'projects') actions.push({ label: '📍 View Projects on Page', target: '#projects' });
      else if (target === 'skills') actions.push({ label: '🛠️ View Skills Matrix', target: '#skills' });
      else if (target === 'experience') actions.push({ label: '💼 View Experience', target: '#experience' });
      else if (target === 'ai-insights') actions.push({ label: '💡 Engineering Philosophy', target: '#ai-insights' });
      else if (target === 'contact') actions.push({ label: '✉️ Open Contact Form', target: '#contact' });
      else if (target === 'blog') actions.push({ label: '📖 Browse Tech Blog', target: '#blog' });
    }

    const cleanText = rawText.replace(navRegex, '').trim();

    return (
      <div className="space-y-2.5">
        <div className="whitespace-pre-line leading-relaxed">{cleanText}</div>

        {actions.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2">
            {actions.map((act, i) => (
              <button
                key={i}
                onClick={() => handleNavigatePage(act.target)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <span>{act.label}</span>
                <ArrowRight className="w-3 h-3 text-emerald-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Send message
  const handleSend = async (messageText = input, overrideMode = activeMode) => {
    const text = messageText.trim();
    if (!text || loading) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages = [...messages, { role: 'user', text, timestamp: time, mode: overrideMode }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text, overrideMode);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: res.reply,
          model: res.model,
          latency: res.latency_s,
          mode: res.mode || overrideMode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: "I'm having trouble connecting right now. Please feel free to reach out via the contact form! [NAV:contact]",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic starter prompts tailored to active mode and profile
  const modePrompts = useMemo(() => {
    if (activeMode === 'technical') {
      return [
        `How does ${firstName} optimize API latency?`,
        `Tell me about ${firstName}'s distributed microservices patterns`,
        `How does ${firstName} design database schemas and indexing?`,
      ];
    }
    if (activeMode === 'challenge') {
      return [
        `How would ${firstName} design a 100k events/sec streaming pipeline?`,
        `How would ${firstName} architect a fault-tolerant caching layer with Redis?`,
        `How would ${firstName} migrate a legacy monolith to microservices?`,
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
        `Give me a 60-second summary of ${firstName}'s engineering strengths`,
        `What are ${firstName}'s top 3 technical superpowers?`,
      ];
    }
    // General
    return [
      topProject ? `Tell me about the ${topProject} project` : `What are ${firstName}'s top projects?`,
      topCompany ? `What was ${firstName}'s role at ${topCompany}?` : `Tell me about ${firstName}'s experience`,
      `What is ${firstName}'s core tech stack?`,
    ];
  }, [activeMode, firstName, topCompany, topProject]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Agent Chat"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900/95 border-2 border-emerald-500/60 hover:border-emerald-400 text-white shadow-2xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <Bot className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-mono font-bold text-slate-100 tracking-wide">
            {buttonLabel}
          </span>
        </button>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div
          className={`bg-[#0c1017] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn transition-all duration-300 ${
            isExpanded
              ? 'w-[94vw] sm:w-[620px] h-[680px] max-h-[88vh]'
              : 'w-[92vw] sm:w-[410px] h-[550px] max-h-[82vh]'
          }`}
        >
          {/* Top Header */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {agentTitle}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                  {fullName ? `${role} • Interactive Agent` : 'Interactive AI Assistant'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                title="Restart conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                title={isExpanded ? 'Compact mode' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Agent Mode Selector Bar */}
          <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono shrink-0 scrollbar-none">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" /> Mode:
            </span>

            <button
              onClick={() => setActiveMode('general')}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                activeMode === 'general'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              General
            </button>

            <button
              onClick={() => setActiveMode('technical')}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                activeMode === 'technical'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              ⚡ Tech Deep-Dive
            </button>

            <button
              onClick={() => setActiveMode('challenge')}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                activeMode === 'challenge'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              🏗️ System Design
            </button>

            <button
              onClick={() => setActiveMode('recruiter')}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                activeMode === 'recruiter'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              💼 Career Fit
            </button>

            <button
              onClick={() => setActiveMode('tldr')}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                activeMode === 'tldr'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              ⏱️ 60s TL;DR
            </button>
          </div>

          {/* Quick Actions Dock */}
          <div className="px-3 py-1.5 bg-slate-950/40 border-b border-slate-800/40 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0">
            <span className="text-slate-500">Quick Actions:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSend(`Show me ${firstName}'s top projects and architecture details`, 'technical')}
                className="hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Code2 className="w-3 h-3 text-emerald-400" />
                <span>Projects</span>
              </button>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => handleSend(`What is ${firstName}'s core production tech stack?`, 'technical')}
                className="hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Wrench className="w-3 h-3 text-cyan-400" />
                <span>Stack</span>
              </button>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => handleSend(`Explain ${firstName}'s engineering philosophy`, 'technical')}
                className="hover:text-purple-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Philosophy</span>
              </button>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => handleSend(`How can I contact ${firstName}?`, 'general')}
                className="hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Send className="w-3 h-3 text-amber-400" />
                <span>Contact</span>
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed relative group ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-medium rounded-br-xs shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-xs shadow-sm'
                  }`}
                >
                  {renderMessageContent(msg.text, msg.role === 'user')}

                  {/* Assistant controls: TTS & Copy */}
                  {msg.role === 'assistant' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <div className="flex items-center gap-2">
                        {msg.latency && (
                          <span className="text-emerald-400/80">⚡ {msg.latency}s</span>
                        )}
                        {msg.mode && msg.mode !== 'general' && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
                            {msg.mode}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleSpeak(msg.text, i)}
                          className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                            speakingIndex === i ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                          }`}
                          title={speakingIndex === i ? 'Stop Speaking' : 'Read Aloud'}
                        >
                          {speakingIndex === i ? (
                            <div className="flex items-center gap-1 text-emerald-400">
                              <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                              <span className="text-[9px]">Playing</span>
                            </div>
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleCopy(msg.text, i)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy Answer"
                        >
                          {copiedIndex === i ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[10px] font-mono text-slate-600 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-slate-300">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span className="text-xs font-mono">
                    {activeMode === 'challenge'
                      ? 'Architecting system blueprint...'
                      : activeMode === 'technical'
                      ? 'Analyzing technical patterns...'
                      : 'Synthesizing response...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Follow-Up / Mode Prompts */}
          <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800/80 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Suggested Prompts
              </span>
              <span className="text-[9px] font-mono text-slate-600">Click to ask</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-none">
              {modePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/50 border border-slate-800 transition-all text-left shadow-sm active:scale-95 cursor-pointer truncate max-w-full"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* User Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeMode === 'challenge'
                  ? 'Pose an architecture challenge (e.g. 100k events/sec streaming)...'
                  : activeMode === 'technical'
                  ? 'Ask technical questions about latency, async, microservices...'
                  : `Ask about ${firstName}'s background, code, or projects...`
              }
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
