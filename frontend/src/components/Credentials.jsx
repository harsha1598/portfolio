import React from 'react';
import { Award, GraduationCap, BadgeCheck, ExternalLink, Calendar } from 'lucide-react';

export default function Credentials({ education, awards, certifications }) {
  return (
    <section id="credentials" className="py-20 border-t border-slate-900 bg-[#07090e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
            // Qualifications & Recognitions
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Education, Certifications & Awards
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Formal engineering foundations, Microsoft cloud credentials, and corporate honors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Certifications */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Certifications</h3>
                  <p className="text-xs text-slate-400 font-mono">Microsoft Cloud</p>
                </div>
              </div>

              <div className="space-y-4">
                {certifications &&
                  certifications.map((cert) => (
                    <div
                      key={cert.id || cert.name}
                      className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-100">
                          {cert.name}
                        </h4>
                        {cert.credential_url && (
                          <a
                            href={cert.credential_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-emerald-400"
                            title="Verify Credential"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs font-mono text-slate-400">
                        <span className="text-emerald-400">{cert.issuer}</span>
                        {cert.issue_date && <span>{cert.issue_date}</span>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Column 2: Honors & Awards */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Honors & Awards</h3>
                  <p className="text-xs text-slate-400 font-mono">Competitions & Corporate</p>
                </div>
              </div>

              <div className="space-y-4">
                {awards &&
                  awards.map((award) => (
                    <div
                      key={award.id || award.title}
                      className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition-colors"
                    >
                      <h4 className="text-sm font-semibold text-slate-100">
                        {award.title}
                      </h4>
                      {award.description && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {award.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2 text-xs font-mono text-slate-400">
                        <span className="text-cyan-400">{award.organization}</span>
                        {award.year && <span>{award.year}</span>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Column 3: Education */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Education</h3>
                  <p className="text-xs text-slate-400 font-mono">Academic Background</p>
                </div>
              </div>

              <div className="space-y-4">
                {education &&
                  education.map((edu) => (
                    <div
                      key={edu.id || edu.institution}
                      className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/30 transition-colors"
                    >
                      <h4 className="text-sm font-semibold text-slate-100">
                        {edu.degree}
                      </h4>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">
                        {edu.field_of_study}
                      </p>
                      <p className="text-xs text-blue-400 font-semibold mt-1">
                        {edu.institution}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
                        <span>
                          Grade: <strong className="text-emerald-400">{edu.grade}</strong>
                        </span>
                        <span>
                          {edu.start_year} – {edu.end_year}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
