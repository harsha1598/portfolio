import React from 'react';
import { Terminal, Shield, ArrowUp } from 'lucide-react';

export default function Footer({ onOpenAdmin }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-12 border-t border-slate-900 bg-[#05070a] text-slate-500 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Brand & Stack */}
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-slate-300 font-semibold">
                Harsha Vardhan Reddi — Portfolio
              </p>
              <p className="text-[11px] text-slate-500">
                Engineered with FastAPI · React JS · SQLite · Tailwind CSS
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Subtle discreet shield button with no label or tooltip */}
            <button
              onClick={onOpenAdmin}
              className="p-1.5 text-slate-700 hover:text-slate-500 rounded transition-colors cursor-pointer"
              aria-label="Security"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>

            {/* Back to top */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
