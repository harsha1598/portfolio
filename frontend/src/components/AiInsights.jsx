import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Cpu,
  Layers,
  Compass,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  BrainCircuit,
  TrendingUp,
  ShieldCheck,
  Bot,
  Code2,
  Terminal,
} from 'lucide-react';

export default function AiInsights({ aiInsights = [], profile, experiences = [], skills = [] }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'philosophy' | 'architecture' | 'domain'
  const [copied, setCopied] = useState(false);

  // Parse insights from database/API JSON strings or fallback synthesis
  const parsedData = useMemo(() => {
    const map = {};
    if (Array.isArray(aiInsights) && aiInsights.length > 0) {
      aiInsights.forEach((item) => {
        let contentObj = {};
        if (typeof item.content === 'string') {
          try {
            contentObj = JSON.parse(item.content);
          } catch {
            contentObj = { content: item.content };
          }
        } else if (item.content && typeof item.content === 'object') {
          contentObj = item.content;
        }
        map[item.section_key] = {
          ...item,
          data: contentObj,
        };
      });
    }

    const name = profile?.name || 'Engineer';
    const topExp = experiences.slice(0, 3).map((e) => e.company).filter(Boolean);
    const companyStr = topExp.length ? topExp.join(', ') : 'leading engineering teams';
    const topSkills = skills.slice(0, 5).map((s) => s.name);
    const skillStr = topSkills.length ? topSkills.join(', ') : 'Distributed Systems, Python, Cloud Microservices';

    // 1. Philosophy & Focus
    const rawPhil = map.engineering_philosophy || map.executive_summary;
    const phil = rawPhil || {
      title: 'Engineering Philosophy & Focus',
      subtitle: 'Architectural Principles & Software Craftsmanship',
      data: {
        title: 'Engineering Philosophy & Focus',
        subtitle: 'Architectural Principles & Software Craftsmanship',
        content: `I focus on designing software systems that balance high throughput with resilient, maintainable architecture. Having built production platforms across ${companyStr}, I prioritize clean service boundaries, end-to-end data integrity, and deterministic latency over premature complexity. My goal is always to deliver performant systems that scale gracefully under real-world demand.`,
        principles: [
          'Pragmatic Architecture: Prioritizing clean service boundaries, observability, and simplicity over resume-driven complexity.',
          `Latency & Performance Obsession: Profiling queries, caching critical paths, and tuning async event loops with ${skillStr}.`,
          'End-to-End Ownership: Deep commitment from distributed cloud infrastructure and CI/CD automation to polished client experiences.',
        ],
      },
    };

    // 2. Architecture Milestones
    const arch = map.architecture_highlights || {
      title: 'System Architecture & Production Milestones',
      subtitle: 'Scalability, Distributed Pipelines & Low-Latency Performance',
      data: {
        title: 'System Architecture & Production Milestones',
        subtitle: 'Scalability, Distributed Pipelines & Low-Latency Performance',
        bullets: [
          `Architected high-throughput microservices and distributed data pipelines leveraging ${skillStr}.`,
          'Engineered resilient ETL ingestion workflows handling high-volume analytical records with sub-second performance.',
          'Championed cloud modernization, automated CI/CD deployment pipelines, and containerization best practices.',
        ],
      },
    };

    // 3. Domain Expertise
    const rawDomain = map.domain_expertise || map.recruiter_fit;
    const domain = rawDomain || {
      title: 'Domain Expertise & What I Build',
      subtitle: 'Core Specializations & Technical Vision',
      data: {
        title: 'Domain Expertise & What I Build',
        subtitle: 'Core Specializations & Technical Vision',
        mission: `Passionate about solving complex engineering bottlenecks, designing distributed data pipelines, and building scalable cloud-native architectures with ${skillStr}.`,
        focus_areas: [
          'High-Throughput Data Ingestion',
          'Resilient Cloud Backends & Microservices',
          'API Performance & Query Tuning',
          'Modern Reactive Interfaces & Dashboards',
        ],
        technical_stack: topSkills.length ? topSkills : ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Cloud', 'React'],
        values: [
          'Sub-second API Latency',
          'Zero-Downtime Releases',
          'Strict Type Safety & Clean Contracts',
          'Data Integrity & Fault Tolerance',
        ],
      },
    };

    return { phil, arch, domain };
  }, [aiInsights, profile, experiences, skills]);

  const { phil, arch, domain } = parsedData;

  const handleCopySummary = () => {
    const textToCopy = `Engineering Overview - ${profile?.name || 'Engineer'}\n\n${phil.data.content || ''}\n\nMission:\n${domain.data.mission || ''}\n\nCore Focus:\n- ${(domain.data.focus_areas || []).join('\n- ')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="ai-insights" className="py-20 relative overflow-hidden bg-[#07090e]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-purple-500/10 via-emerald-500/10 to-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono uppercase tracking-wider mb-4 shadow-sm shadow-purple-500/10">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-purple-400" />
              <span>AI System Synthesis</span>
              <span className="text-slate-500">|</span>
              <span className="text-[11px] text-purple-300 font-semibold flex items-center gap-1">
                <Bot className="w-3 h-3 inline" /> Gemini 3.5 Flash
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              Engineering Philosophy & Highlights
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl font-light">
              An AI-synthesized perspective on my architectural mindset, production engineering impact, and core domain specializations.
            </p>
          </div>

          {/* Action & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-900/80 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'all'
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Highlights
              </button>
              <button
                onClick={() => setActiveTab('philosophy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'philosophy'
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Philosophy
              </button>
              <button
                onClick={() => setActiveTab('architecture')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'architecture'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Architecture
              </button>
              <button
                onClick={() => setActiveTab('domain')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'domain'
                    ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Domain Focus
              </button>
            </div>

            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
              title="Copy engineering summary"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-sans">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-sans">Copy Brief</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: Engineering Philosophy */}
          {(activeTab === 'all' || activeTab === 'philosophy') && (
            <div
              className={`rounded-2xl bg-[#0c1017]/90 border border-slate-800/80 p-6 sm:p-8 backdrop-blur-xl hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between group shadow-lg shadow-black/40 ${
                activeTab === 'philosophy' ? 'lg:col-span-12' : 'lg:col-span-7'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">
                        {phil.data.title || 'Engineering Philosophy & Focus'}
                      </h3>
                      <p className="text-xs text-purple-400 font-mono">
                        {phil.data.subtitle || 'Architectural Principles & Software Craftsmanship'}
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Craftsmanship
                  </span>
                </div>

                <div className="relative pl-4 border-l-2 border-purple-500/30 my-4 py-1">
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                    {phil.data.content}
                  </p>
                </div>

                {(phil.data.principles || phil.data.highlights) && (
                  <div className="mt-6 space-y-2.5">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Core Engineering Principles
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {(phil.data.principles || phil.data.highlights).map((p, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-300"
                        >
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <Zap className="w-3.5 h-3.5" /> Software Craftsmanship
                </span>
                <span>High Resiliency & Scale</span>
              </div>
            </div>
          )}

          {/* Card 2: System Architecture Milestones */}
          {(activeTab === 'all' || activeTab === 'architecture') && (
            <div
              className={`rounded-2xl bg-[#0c1017]/90 border border-slate-800/80 p-6 sm:p-8 backdrop-blur-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group shadow-lg shadow-black/40 ${
                activeTab === 'architecture' ? 'lg:col-span-12' : 'lg:col-span-5'
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      {arch.data.title || 'System Architecture & Impact'}
                    </h3>
                    <p className="text-xs text-emerald-400 font-mono">
                      {arch.data.subtitle || 'Production Scale & Pipelines'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  {(arch.data.bullets || []).map((bullet, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/70 hover:border-emerald-500/20 transition-all"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                          0{idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {bullet}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Distributed Systems
                </span>
                <span>Low-Latency Performance</span>
              </div>
            </div>
          )}

          {/* Card 3: Domain Expertise & What I Build */}
          {(activeTab === 'all' || activeTab === 'domain') && (
            <div className="lg:col-span-12 rounded-2xl bg-gradient-to-br from-[#0c1017] via-slate-900/50 to-[#0c1017] border border-slate-800/80 p-6 sm:p-8 backdrop-blur-xl hover:border-cyan-500/40 transition-all duration-300 group shadow-lg shadow-black/40">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">
                        {domain.data.title || 'Domain Expertise & What I Build'}
                      </h3>
                      <p className="text-xs text-cyan-400 font-mono">
                        {domain.data.subtitle || 'Specialized Disciplines & Engineering Vision'}
                      </p>
                    </div>
                  </div>

                  {domain.data.mission && (
                    <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-slate-200 text-sm leading-relaxed">
                      <span className="text-cyan-400 font-semibold mr-1.5 font-mono text-xs uppercase tracking-wider block mb-1">
                        Technical Vision & Focus
                      </span>
                      {domain.data.mission}
                    </div>
                  )}

                  {/* Focus Areas */}
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                      Primary Engineering Focus Areas
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(domain.data.focus_areas || domain.data.superpowers || []).map((area, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 bg-slate-950/70 p-5 rounded-xl border border-slate-800/80 space-y-4">
                  {/* Core Technologies */}
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-400" /> Core Technologies & Tools
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(domain.data.technical_stack || []).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Engineering Values */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Architectural Values
                    </h4>
                    <div className="space-y-1.5">
                      {(domain.data.values || [
                        'Sub-second API Latency',
                        'Zero-Downtime Releases',
                        'Strict Type Safety & Clean Contracts',
                        'Data Integrity & Fault Tolerance',
                      ]).map((val, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 text-xs text-slate-300"
                        >
                          <span>{val}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
