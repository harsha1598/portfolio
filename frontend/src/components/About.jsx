import React, { useMemo } from 'react';
import {
  Cpu,
  Layers,
  Zap,
  ShieldCheck,
  Database,
  GitMerge,
  Code2,
  FolderGit2,
  Sparkles,
  Server,
  Cloud,
} from 'lucide-react';

export default function About({ profile, experiences = [], skills = [], projects = [] }) {
  if (!profile) return null;

  const coreStrengths = useMemo(() => {
    const cards = [];

    // Group skills by category
    const skillsByCategory = {};
    skills.forEach((s) => {
      const cat = (s.category || 'General').trim();
      if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
      skillsByCategory[cat].push(s.name);
    });

    const findCategory = (keywords) => {
      for (const [cat, items] of Object.entries(skillsByCategory)) {
        if (keywords.some((k) => cat.toLowerCase().includes(k))) {
          return { category: cat, items };
        }
      }
      return null;
    };

    // 1. Backend / Architecture Card
    const backendData = findCategory(['backend', 'language', 'server', 'api']);
    if (backendData && backendData.items.length > 0) {
      const top = backendData.items.slice(0, 4).join(', ');
      cards.push({
        icon: <Cpu className="w-6 h-6 text-cyan-400" />,
        title: `${backendData.category} & Architecture`,
        description: `Architecting high-throughput microservices, robust REST APIs, and scalable distributed systems using ${top}.`,
      });
    }

    // 2. Cloud / Big Data Card
    const cloudData = findCategory(['cloud', 'data', 'synapse', 'aws', 'azure']);
    if (cloudData && cloudData.items.length > 0) {
      const top = cloudData.items.slice(0, 4).join(', ');
      cards.push({
        icon: <Database className="w-6 h-6 text-emerald-400" />,
        title: `${cloudData.category}`,
        description: `Designing resilient cloud architectures, big data workflows, and automated ETL pipelines with ${top}.`,
      });
    }

    // 3. Frontend / UI Card
    const frontendData = findCategory(['frontend', 'web', 'ui', 'client', 'mobile']);
    if (frontendData && frontendData.items.length > 0) {
      const top = frontendData.items.slice(0, 4).join(', ');
      cards.push({
        icon: <Layers className="w-6 h-6 text-blue-400" />,
        title: `${frontendData.category} Engineering`,
        description: `Engineering responsive, reactive client interfaces and intuitive user experiences with ${top}.`,
      });
    }

    // 4. Databases Card
    const dbData = findCategory(['database', 'sql', 'storage', 'nosql']);
    if (dbData && dbData.items.length > 0) {
      const top = dbData.items.slice(0, 4).join(', ');
      cards.push({
        icon: <Zap className="w-6 h-6 text-amber-400" />,
        title: `${dbData.category} & Query Optimization`,
        description: `Profiling execution plans, modeling relational/document schemas, and tuning query latency with ${top}.`,
      });
    }

    // 5. DevOps / CI/CD Automation Card
    const devopsData = findCategory(['devops', 'tool', 'pipeline', 'infra']);
    if (devopsData && devopsData.items.length > 0) {
      const top = devopsData.items.slice(0, 4).join(', ');
      cards.push({
        icon: <GitMerge className="w-6 h-6 text-purple-400" />,
        title: `${devopsData.category}`,
        description: `Continuous integration and delivery automation, container orchestration, and reliable infrastructure with ${top}.`,
      });
    }

    // 6. Experience / Enterprise Delivery Card
    if (experiences.length > 0) {
      const topExp = experiences[0];
      const roleText = topExp.role || 'Software Engineer';
      const cleanSummary =
        topExp.description &&
        !/^skill\(s\)/i.test(topExp.description.trim()) &&
        topExp.description.length < 180
          ? topExp.description
          : `Delivering production-grade software, scalable architectures, and mission-critical systems as ${roleText}.`;

      cards.push({
        icon: <ShieldCheck className="w-6 h-6 text-teal-400" />,
        title: `Enterprise Delivery at ${topExp.company}`,
        description: cleanSummary,
      });
    }

    // 7. Project Card (if needed to fill up to 6 cards)
    if (cards.length < 6 && projects.length > 0) {
      const topProj = projects[0];
      cards.push({
        icon: <FolderGit2 className="w-6 h-6 text-emerald-400" />,
        title: `Featured: ${topProj.title}`,
        description: `${topProj.description} ${topProj.tech_stack ? `(Built with ${topProj.tech_stack})` : ''}`,
      });
    }

    // 8. Any remaining skill categories not yet included
    if (cards.length < 6) {
      for (const [cat, items] of Object.entries(skillsByCategory)) {
        if (cards.length >= 6) break;
        const alreadyIncluded = cards.some((c) =>
          c.title.toLowerCase().includes(cat.toLowerCase())
        );
        if (!alreadyIncluded && items.length > 0) {
          cards.push({
            icon: <Sparkles className="w-6 h-6 text-cyan-400" />,
            title: cat,
            description: `Hands-on expertise and practical application in ${items.slice(0, 4).join(', ')}.`,
          });
        }
      }
    }

    // Safe Fallback if no cards were generated
    if (cards.length === 0) {
      return [
        {
          icon: <Code2 className="w-6 h-6 text-emerald-400" />,
          title: profile.title || 'Full Stack Engineering',
          description: profile.summary || 'Building scalable, high-performance applications.',
        },
        {
          icon: <ShieldCheck className="w-6 h-6 text-teal-400" />,
          title: 'Enterprise Delivery',
          description:
            'Production-proven delivery with high-performance architectures and team collaboration.',
        },
      ];
    }

    return cards.slice(0, 6);
  }, [skills, experiences, projects, profile]);

  return (
    <section id="about" className="py-20 border-t border-slate-900 bg-[#07090e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header (Dynamic to Uploaded Data) */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
            // Core Engineering Philosophy
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Specializing in {profile.title || 'Scalable Software Engineering'}
          </h2>
          <p className="mt-4 text-base text-slate-400 leading-relaxed">
            {profile.summary ||
              `A passionate ${profile.title || 'software engineer'} with ${profile.years_experience || 'extensive'} years of industry experience turning complex requirements into reliable, performance-tuned services.`}
          </p>
        </div>

        {/* Dynamic Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreStrengths.map((strength, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/30 hover:bg-slate-900/70 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-emerald-500/40 transition-all">
                  {strength.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-emerald-300 transition-colors">
                  {strength.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {strength.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
