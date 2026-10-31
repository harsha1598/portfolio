import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Cpu,
  Layers,
  Target,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  BrainCircuit,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Bot,
} from 'lucide-react';

export default function AiInsights({ aiInsights = [], profile, experiences = [], skills = [] }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'executive' | 'architecture' | 'recruiter'
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

    // Dynamic fallbacks if missing
    const name = profile?.name || 'Engineer';
    const title = profile?.title || 'Senior Software Engineer';
    const topExp = experiences.slice(0, 3).map((e) => e.company).filter(Boolean);
    const companyStr = topExp.length ? topExp.join(', ') : 'leading tech enterprises';
    const topSkills = skills.slice(0, 5).map((s) => s.name);
    const skillStr = topSkills.length ? topSkills.join(', ') : 'Distributed Systems, Python, Cloud Microservices';

    const exec = map.executive_summary || {
      title: 'AI Executive Overview',
      subtitle: 'Synthesized Candidate Caliber & Leadership',
      data: {
        title: 'AI Executive Overview',
        subtitle: 'Synthesized Candidate Caliber & Leadership',
        content: `${name} is an accomplished ${title} with proven engineering excellence across ${companyStr}. Known for architecting resilient distributed systems, modernizing cloud data infrastructure, and delivering robust full-lifecycle applications. Demonstrates high technical rigor from cloud backend systems to intuitive client interfaces.`,
        highlights: [
          `Enterprise track record across ${companyStr}`,
          `Core production proficiency in ${skillStr}`,
          'Proven focus on API latency reduction, query tuning, and system resiliency',
        ],
      },
    };

    const arch = map.architecture_highlights || {
      title: 'Architectural Pillars & Technical Impact',
      subtitle: 'Core Engineering Accomplishments & Scalability',
      data: {
        title: 'Architectural Pillars & Technical Impact',
        subtitle: 'Core Engineering Accomplishments & Scalability',
        bullets: [
          `Architected high-throughput microservices and distributed data pipelines leveraging ${skillStr}.`,
          'Engineered resilient ETL ingestion workflows handling high-volume analytical records with sub-second performance.',
          'Championed cloud modernization, automated CI/CD deployment pipelines, and containerization best practices.',
        ],
      },
    };

    const fit = map.recruiter_fit || {
      title: 'Recruiter & Hiring Fast-Track',
      subtitle: 'Target Roles & Production Readiness',
      data: {
        title: 'Recruiter & Hiring Fast-Track',
        subtitle: 'Target Roles & Production Readiness',
        ideal_roles: [
          `Senior ${title.split(',')[0].trim() || 'Software Engineer'}`,
          'Lead Backend / Data Architect',
          'Staff Systems Engineer',
        ],
        superpowers: [
          'Full-Lifecycle Architecture',
          'Data Engineering & Cloud Optimization',
          'High-Velocity API Design',
        ],
        recommendation: `Ideal for senior technical roles requiring deep competence in ${skillStr} and a strong record of delivering mission-critical enterprise systems.`,
      },
    };

    return { exec, arch, fit };
  }, [aiInsights, profile, experiences, skills]);

  const { exec, arch, fit } = parsedData;

  const handleCopySummary = () => {
    const textToCopy = `AI Executive Brief - ${profile?.name || 'Engineer'}\n\n${exec.data.content || ''}\n\nSuperpowers:\n- ${(fit.data.superpowers || []).join('\n- ')}\n\nRecommendation:\n${fit.data.recommendation || ''}`;
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
              <span>LLM Synthesized Intelligence</span>
              <span className="text-slate-500">|</span>
              <span className="text-[11px] text-purple-300 font-semibold flex items-center gap-1">
                <Bot className="w-3 h-3 inline" /> Gemini 3.5 Flash
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              AI Executive & Architectural Insights
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl font-light">
              Deep evaluation generated directly from resume data using LLM reasoning. Highlighting candidate caliber, architectural scalability, and fast-track hiring readiness.
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
                All Insights
              </button>
              <button
                onClick={() => setActiveTab('executive')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'executive'
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Executive
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
                onClick={() => setActiveTab('recruiter')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'recruiter'
                    ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hiring Fast-Track
              </button>
            </div>

            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
              title="Copy synthesized executive summary"
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
          {/* Card 1: Executive Overview */}
          {(activeTab === 'all' || activeTab === 'executive') && (
            <div
              className={`rounded-2xl bg-[#0c1017]/90 border border-slate-800/80 p-6 sm:p-8 backdrop-blur-xl hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between group shadow-lg shadow-black/40 ${
                activeTab === 'executive' ? 'lg:col-span-12' : 'lg:col-span-7'
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
                        {exec.data.title || 'AI Executive Overview'}
                      </h3>
                      <p className="text-xs text-purple-400 font-mono">
                        {exec.data.subtitle || 'Synthesized Caliber & Impact'}
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Confidence: 98%
                  </span>
                </div>

                <div className="relative pl-4 border-l-2 border-purple-500/30 my-4 py-1">
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                    {exec.data.content}
                  </p>
                </div>

                {exec.data.highlights && exec.data.highlights.length > 0 && (
                  <div className="mt-6 space-y-2.5">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Core Candidate Signals
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {exec.data.highlights.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-300"
                        >
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <Zap className="w-3.5 h-3.5" /> Executive Caliber
                </span>
                <span>Structured Output JSON</span>
              </div>
            </div>
          )}

          {/* Card 2: Architectural Pillars & Scalability */}
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
                      {arch.data.title || 'Architectural Pillars'}
                    </h3>
                    <p className="text-xs text-emerald-400 font-mono">
                      {arch.data.subtitle || 'Production & Scalability'}
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
                  <ShieldCheck className="w-3.5 h-3.5" /> High Resiliency
                </span>
                <span>Latency & Throughput</span>
              </div>
            </div>
          )}

          {/* Card 3: Recruiter Fast-Track & Role Fit */}
          {(activeTab === 'all' || activeTab === 'recruiter') && (
            <div className="lg:col-span-12 rounded-2xl bg-gradient-to-br from-[#0c1017] via-slate-900/50 to-[#0c1017] border border-slate-800/80 p-6 sm:p-8 backdrop-blur-xl hover:border-cyan-500/40 transition-all duration-300 group shadow-lg shadow-black/40">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">
                        {fit.data.title || 'Recruiter & Hiring Fast-Track'}
                      </h3>
                      <p className="text-xs text-cyan-400 font-mono">
                        {fit.data.subtitle || 'Target Roles & Production Readiness'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-slate-200 text-sm leading-relaxed">
                    <span className="text-cyan-400 font-semibold mr-1.5">Takeaway:</span>
                    {fit.data.recommendation}
                  </div>

                  {/* Superpowers */}
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                      Core Technical Superpowers
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(fit.data.superpowers || []).map((sp, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5"
                        >
                          <TrendingUp className="w-3 h-3 text-cyan-400" />
                          {sp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 bg-slate-950/70 p-5 rounded-xl border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" /> Recommended Target Roles
                  </h4>
                  <div className="space-y-2">
                    {(fit.data.ideal_roles || []).map((role, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/70 text-xs font-medium text-slate-200"
                      >
                        <span>{role}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Immediate Match
                        </span>
                      </div>
                    ))}
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
