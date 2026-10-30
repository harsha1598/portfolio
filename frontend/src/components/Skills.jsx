import React, { useState } from 'react';
import { Database, Server, Layout, Wrench, Sparkles } from 'lucide-react';

export default function Skills({ skills }) {
  if (!skills || skills.length === 0) return null;

  const categories = [
    'All',
    'Cloud & Big Data',
    'Backend & Architecture',
    'Frontend Development',
    'DevOps & Tools',
  ];

  const [activeCategory, setActiveCategory] = useState('All');

  const filteredSkills =
    activeCategory === 'All'
      ? skills
      : skills.filter((s) => s.category === activeCategory);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Cloud & Big Data':
        return <Database className="w-4 h-4 text-emerald-400" />;
      case 'Backend & Architecture':
        return <Server className="w-4 h-4 text-cyan-400" />;
      case 'Frontend Development':
        return <Layout className="w-4 h-4 text-blue-400" />;
      case 'DevOps & Tools':
        return <Wrench className="w-4 h-4 text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <section id="skills" className="py-20 border-t border-slate-900 bg-[#07090e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
            // Tech Stack & Tooling
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Technical Skills & Architecture Matrix
          </h2>
          <p className="mt-4 text-base text-slate-400">
            A comprehensive overview of production-tested frameworks, data systems, and cloud platforms.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200 border ${
                  activeCategory === cat
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-white hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id || skill.name}
              className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all duration-200 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-slate-800/70 border border-slate-700/60 group-hover:scale-105 transition-transform">
                  {getCategoryIcon(skill.category)}
                </div>
                {skill.proficiency && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      skill.proficiency === 'Expert'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : skill.proficiency === 'Advanced'
                        ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {skill.proficiency}
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  {skill.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {skill.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
