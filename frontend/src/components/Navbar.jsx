import React, { useState, useEffect } from 'react';
import { Terminal, Menu, X, FileText, Wifi, CloudOff, Bot, BookOpen } from 'lucide-react';

export default function Navbar({
  profile,
  currentView = 'portfolio',
  onNavigateBlog,
  onNavigatePortfolio,
  onOpenAdmin,
  isApiOnline,
  onOpenChat,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nameParts = (profile?.name || 'Developer.Portfolio').split(' ');
  const firstName = nameParts[0] || 'Dev';
  const lastName = nameParts.slice(1).join('') || 'Tech';

  const navLinks =
    currentView === 'blog'
      ? [
          { name: 'Portfolio', href: '#', onClick: onNavigatePortfolio },
          { name: 'Blog', href: '#blog', active: true },
        ]
      : [
          { name: 'About', href: '#about' },
          { name: 'AI Insights', href: '#ai-insights' },
          { name: 'Experience', href: '#experience' },
          { name: 'Skills', href: '#skills' },
          { name: 'Projects', href: '#projects' },
          { name: 'Credentials', href: '#credentials' },
          { name: 'Contact', href: '#contact' },
          { name: 'Blog', href: '#blog', onClick: onNavigateBlog, isBlog: true },
        ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#07090e]/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/40 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={onNavigatePortfolio}
            className="flex items-center gap-2.5 group cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono font-bold text-lg text-slate-100 tracking-tight group-hover:text-emerald-400 transition-colors">
                {firstName}
                <span className="text-emerald-400">.</span>
                {lastName}
              </span>
              <span className="hidden sm:block text-[11px] text-slate-400 font-mono tracking-wider uppercase">
                {profile?.title || 'Data & Full Stack Engineer'}
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  }
                }}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                  link.isBlog
                    ? 'text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/30'
                    : link.active
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Status Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
                isApiOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
              }`}
              title={
                isApiOnline
                  ? 'Connected to FastAPI backend'
                  : 'Operating in client-side / GitHub Pages mode'
              }
            >
              {isApiOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                  <span>FastAPI Live</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Static Mode</span>
                </>
              )}
            </div>

            {/* AI Agent Button */}
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer shadow-sm hover:shadow-emerald-500/10"
              title="Chat with AI Agent"
            >
              <Bot className="w-3.5 h-3.5 animate-pulse" />
              <span>Ask AI Agent</span>
            </button>

            {/* Resume Button */}
            <a
              href="#contact"
              onClick={(e) => {
                if (currentView === 'blog') {
                  onNavigatePortfolio();
                }
              }}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 rounded-lg shadow-sm hover:shadow-emerald-500/20 transition-all duration-200"
            >
              <FileText className="w-4 h-4" />
              <span>Hire Me</span>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  }
                }}
                className={`px-3 py-2 text-sm rounded-lg ${
                  link.isBlog
                    ? 'text-cyan-400 bg-cyan-500/10 font-mono'
                    : 'text-slate-200 hover:text-emerald-400 hover:bg-slate-800/60'
                }`}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenChat?.();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask AI Agent</span>
              </button>
              <a
                href="#contact"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (currentView === 'blog') onNavigatePortfolio();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg"
              >
                Hire Me
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
