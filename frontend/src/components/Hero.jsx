import React from 'react';
import {
  Mail,
  Phone,
  Code2,
  Database,
  Cloud,
  ChevronRight,
  Download,
  ExternalLink,
  Award,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';

export default function Hero({ profile }) {
  if (!profile) return null;

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-grid-pattern">
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Terminal Command Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-500">harsha@cloud:~$</span>
            <span className="text-emerald-400 font-semibold">whoami --verbose</span>
            <span className="text-slate-400 hidden sm:inline">| Software Engineer 2 @ Deloitte</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
            Building High-Velocity{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Data Systems
            </span>{' '}
            & Full-Stack Platforms
          </h1>

          {/* Subheading Profile Name & Title */}
          <p className="text-xl sm:text-2xl font-mono text-emerald-400/90 mb-4 font-semibold tracking-wide">
            {profile.name} — {profile.title}
          </p>

          {/* Summary / Mission */}
          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8">
            {profile.summary}
          </p>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto mb-10 text-left">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Code2 className="w-4 h-4" />
                <span className="text-2xl font-bold font-mono text-white">6+</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Years Experience</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Database className="w-4 h-4" />
                <span className="text-2xl font-bold font-mono text-white">4</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Enterprise Roles</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Cloud className="w-4 h-4" />
                <span className="text-2xl font-bold font-mono text-white">2x</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Azure Certified</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-2xl font-bold font-mono text-white">#8</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">TCS Codeathon Rank</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all shadow-lg shadow-emerald-500/20"
            >
              <span>Explore Projects</span>
              <ChevronRight className="w-4 h-4" />
            </a>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/40 transition-all"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Contact Harsha</span>
            </a>

            <a
              href="mailto:harshareddy1598@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-mono text-sm text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Resume</span>
            </a>
          </div>

          {/* Social Links Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-slate-800/60">
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-slate-600" />
              </a>
            )}

            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <GithubIcon className="w-3.5 h-3.5 text-slate-200" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-slate-600" />
              </a>
            )}

            {profile.hackerrank_url && (
              <a
                href={profile.hackerrank_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>HackerRank</span>
                <ExternalLink className="w-3 h-3 text-slate-600" />
              </a>
            )}

            {profile.leetcode_url && (
              <a
                href={profile.leetcode_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                <span>LeetCode</span>
                <ExternalLink className="w-3 h-3 text-slate-600" />
              </a>
            )}

            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{profile.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
