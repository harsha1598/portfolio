import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Credentials from './components/Credentials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminModal from './components/AdminModal';
import ChatWidget from './components/ChatWidget';
import { fetchPortfolioData, checkApiHealth } from './services/api';
import { defaultPortfolioData } from './data/defaultData';

export default function App() {
  const [portfolioData, setPortfolioData] = useState(defaultPortfolioData);
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // Check API health
      const health = await checkApiHealth();
      setIsApiOnline(health.online);

      // Fetch initial data
      const result = await fetchPortfolioData();
      if (result && result.data) {
        setPortfolioData(result.data);
      }
      setLoading(false);
    }
    init();
  }, []);

  // Keyboard shortcut listener for Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-slate-400 font-mono text-sm">
        <div className="w-10 h-10 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin mb-4" />
        <span>Initializing Harsha's Portfolio Engine...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      <Navbar
        onOpenAdmin={() => setIsAdminOpen(true)}
        isApiOnline={isApiOnline}
      />

      <main>
        <Hero profile={portfolioData.profile} />
        <About profile={portfolioData.profile} />
        <Experience experiences={portfolioData.experiences} />
        <Skills skills={portfolioData.skills} />
        <Projects projects={portfolioData.projects} />
        <Credentials
          education={portfolioData.education}
          awards={portfolioData.awards}
          certifications={portfolioData.certifications}
        />
        <Contact profile={portfolioData.profile} />
      </main>

      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Floating AI Agent Chat Widget */}
      <ChatWidget />

      {/* Hidden Admin Modal (No routed URL directly in the frontend) */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        portfolioData={portfolioData}
        onDataUpdate={(updated) => setPortfolioData(updated)}
        isApiOnline={isApiOnline}
      />
    </div>
  );
}
