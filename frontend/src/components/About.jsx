import React from 'react';
import { Cpu, Layers, Zap, ShieldCheck, Database, GitMerge } from 'lucide-react';

export default function About({ profile }) {
  if (!profile) return null;

  const coreStrengths = [
    {
      icon: <Database className="w-6 h-6 text-emerald-400" />,
      title: "Big Data & Azure Synapse",
      description:
        "Building resilient ETL pipelines with PySpark, Databricks, and Azure Synapse, handling large-scale data transformation and optimized relational modeling.",
    },
    {
      icon: <Cpu className="w-6 h-6 text-cyan-400" />,
      title: "Microservices & APIs",
      description:
        "Architecting high-throughput REST APIs and microservices in Python (FastAPI, Django REST, Flask) and Spring Boot with low latency and tight security.",
    },
    {
      icon: <Layers className="w-6 h-6 text-blue-400" />,
      title: "Modern Full-Stack",
      description:
        "Engineering intuitive, reactive user interfaces with React JS, Angular, and Tailwind CSS seamlessly integrated with asynchronous backend services.",
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Query & API Optimization",
      description:
        "Profiling database queries, implementing caching layers, and tuning SQL execution plans to dramatically reduce response times and system overhead.",
    },
    {
      icon: <GitMerge className="w-6 h-6 text-purple-400" />,
      title: "DevOps & Cloud Migration",
      description:
        "CI/CD automation with Azure Pipelines and Jenkins, containerization via Docker & Kubernetes, and migrating CaaS workloads to managed Azure App Service.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-teal-400" />,
      title: "Enterprise Delivery",
      description:
        "Production-proven engineering delivery with high-performance architectures, rigorous code reviews, and stakeholder collaboration.",
    },
  ];

  return (
    <section id="about" className="py-20 border-t border-slate-900 bg-[#07090e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
            // Core Engineering Philosophy
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Architecting Resilient Data Pipelines & Scalable Software
          </h2>
          <p className="mt-4 text-base text-slate-400">
            A self-starter with 6 years of industry experience across global consulting leaders.
            Specialized in turning complex enterprise data requirements into reliable, performance-tuned services.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreStrengths.map((strength, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/30 hover:bg-slate-900/70 transition-all duration-300 group"
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}
