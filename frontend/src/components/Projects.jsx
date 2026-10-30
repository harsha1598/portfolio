import React from 'react';
import { FolderGit2, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function Projects({ projects }) {
  if (!projects || projects.length === 0) return null;

  const sortedProjects = [...projects].sort(
    (a, b) => (a.display_order || 0) - (b.display_order || 0)
  );

  return (
    <section id="projects" className="py-20 border-t border-slate-900 bg-[#07090e]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
            // Featured Engineering Work
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Key Architecture & Full-Stack Projects
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Selected applications demonstrating microservices, machine learning integrations, and cloud ETL workflows.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProjects.map((project, idx) => {
            let highlights = [];
            if (project.highlights) {
              try {
                highlights = JSON.parse(project.highlights);
              } catch {
                highlights = project.highlights.split('\n').filter((h) => h.trim().length > 0);
              }
            }

            return (
              <div
                key={project.id || idx}
                className="flex flex-col justify-between rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/70 transition-all duration-300 p-6 sm:p-7 group"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                      <FolderGit2 className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-2">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
                          title="View Repository"
                        >
                          <GithubIcon className="w-4 h-4" />
                        </a>
                      )}
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 border border-slate-800 transition-colors"
                          title="Live Demo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors mb-1">
                    {project.title}
                  </h3>
                  {project.subtitle && (
                    <p className="text-xs font-mono text-cyan-400/90 mb-3">
                      {project.subtitle}
                    </p>
                  )}

                  {/* Description */}
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    {project.description}
                  </p>

                  {/* Highlights */}
                  {highlights.length > 0 && (
                    <ul className="space-y-1.5 mb-6 text-xs text-slate-300">
                      {highlights.map((h, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/80 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Tech Stack Pills */}
                {project.tech_stack && (
                  <div className="pt-4 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                    {project.tech_stack.split(',').map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
