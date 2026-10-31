import React from 'react';
import { Briefcase, Calendar, MapPin, CheckCircle2, Terminal } from 'lucide-react';

export default function Experience({ experiences }) {
  if (!experiences || experiences.length === 0) return null;

  const sortedExperiences = [...experiences].sort(
    (a, b) => (a.display_order || 0) - (b.display_order || 0)
  );

  return (
    <section id="experience" className="py-20 border-t border-slate-900 bg-[#07090e]/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
            // Career Milestones
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Work Experience & Enterprise Roles
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Demonstrated engineering progression across enterprise platforms and scalable data systems.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative border-l-2 border-slate-800 ml-4 md:ml-32 space-y-12">
          {sortedExperiences.map((exp, idx) => {
            let bullets = [];
            if (exp.achievements) {
              try {
                bullets = JSON.parse(exp.achievements);
              } catch {
                bullets = exp.achievements.split('\n').filter((b) => b.trim().length > 0);
              }
            }

            return (
              <div key={exp.id || idx} className="relative pl-8 md:pl-10 group">
                {/* Timeline Node Icon */}
                <div
                  className={`absolute -left-[17px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    exp.is_current
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-900 border-slate-700 text-slate-400 group-hover:border-emerald-400/60 group-hover:text-emerald-400'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                </div>

                {/* Experience Card */}
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/30 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {exp.role}
                      </h3>
                      <p className="text-base font-semibold text-emerald-400 font-mono">
                        {exp.company}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>
                          {exp.start_date} – {exp.end_date || 'Present'}
                        </span>
                      </div>
                      {exp.location && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{exp.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {(() => {
                    if (!exp.description) return null;
                    const cleanDesc = exp.description.trim();
                    if (/^skill\(s\)/i.test(cleanDesc) || /^skills:/i.test(cleanDesc)) {
                      return null;
                    }
                    if (
                      bullets.length > 0 &&
                      bullets.some((b) => cleanDesc.includes(b.trim()) && cleanDesc.length > 200)
                    ) {
                      return null;
                    }
                    return (
                      <p className="text-sm text-slate-300 mb-4 italic">
                        {cleanDesc}
                      </p>
                    );
                  })()}

                  {/* Achievements Bullet List */}
                  {bullets.length > 0 && (
                    <ul className="space-y-2.5 mb-5 text-sm text-slate-300">
                      {bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400/80 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Skills Tag Pills */}
                  {exp.skills_text && (
                    <div className="pt-4 border-t border-slate-800/60 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-emerald-400" /> Tech:
                      </span>
                      {exp.skills_text.split(',').map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-800/60 text-slate-300 border border-slate-700/50"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
