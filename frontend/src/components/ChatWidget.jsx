import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Send,
  Loader2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Terminal,
  Cpu,
  Layers,
  Code2,
  Zap,
  Radio,
  Activity,
  Crosshair,
  Shield,
  ShieldCheck,
  Briefcase,
  Calendar,
  MapPin,
  FolderGit2,
  ExternalLink,
  BookOpen,
  Database,
  TrendingUp,
  Server,
  Layout,
  Wrench,
  Mic,
  MicOff,
  Sliders,
  CheckCircle2,
  Share2,
  BarChart3,
  Network,
  GitBranch,
} from 'lucide-react';
import { sendChatMessage } from '../services/api';
import { GithubIcon, LinkedinIcon } from './Icons';

// Native Web Audio API for futuristic HUD audio cues
function playHudSound(type = 'chirp') {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'open') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'send') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.08);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'close') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.1);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    }
  } catch {
    // Audio context may be restricted by browser policy before first interaction
  }
}

// ---------------------------------------------------------------------------
// 1. Interactive Radar / Spider Graph for Technical Competency
// ---------------------------------------------------------------------------
function RadarSkillChart({ activeDomain, onSelectDomain }) {
  const domains = useMemo(
    () => [
      {
        id: 'backend',
        name: 'Backend & Core',
        score: 96,
        tech: 'Python, FastAPI, Django, AsyncIO, REST',
        metrics: 'Sub-second API latency, resilient concurrency',
        color: '#06b6d4',
      },
      {
        id: 'cloud',
        name: 'Cloud & Big Data',
        score: 92,
        tech: 'Azure Synapse, PySpark, Databricks, Docker',
        metrics: 'High-throughput analytical pipelines & warehouses',
        color: '#10b981',
      },
      {
        id: 'genai',
        name: 'GenAI & Agents',
        score: 94,
        tech: 'LiteLLM, RAG, MCP Agents, Grounding Gates',
        metrics: 'Deterministic verification & prompt caching',
        color: '#a855f7',
      },
      {
        id: 'database',
        name: 'Databases & Tuning',
        score: 95,
        tech: 'PostgreSQL, BigQuery, HyperLogLog, Redis',
        metrics: 'Query plan optimization & 13x speedups',
        color: '#f59e0b',
      },
      {
        id: 'frontend',
        name: 'Frontend & UI',
        score: 88,
        tech: 'React JS, Tailwind CSS, Responsive Systems',
        metrics: 'Reactive command centers & rich telemetry',
        color: '#3b82f6',
      },
    ],
    []
  );

  const cx = 150;
  const cy = 135;
  const radius = 95;
  const numAxes = domains.length;

  // Helper to compute (x, y) coordinates on radar
  const getCoordinates = (index, factor = 1) => {
    const angle = (index * 2 * Math.PI) / numAxes - Math.PI / 2;
    const r = radius * factor;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Polygon points for radar rings (25%, 50%, 75%, 100%)
  const gridRings = [0.25, 0.5, 0.75, 1.0].map((factor) => {
    return domains
      .map((_, i) => {
        const { x, y } = getCoordinates(i, factor);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  // User competency polygon points
  const polygonPoints = domains
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.score / 100);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const currentSelection = domains.find((d) => d.id === activeDomain) || domains[0];

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#060a17]/90 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider">
              ARCHITECTURAL COMPETENCY RADAR
            </span>
            <p className="text-[10px] text-slate-400 font-mono">
              Multi-axis proficiency matrix across core engineering domains
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
            5 AXES EVALUATED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* SVG Radar Spider Web Canvas */}
        <div className="md:col-span-6 flex items-center justify-center relative">
          <svg
            viewBox="0 0 300 270"
            className="w-full max-w-[280px] sm:max-w-[300px] h-auto overflow-visible select-none"
          >
            <defs>
              {/* Radial gradient for data polygon fill */}
              <radialGradient id="radarFillGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.65" />
                <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
              </radialGradient>
              {/* Glow filter */}
              <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Concentric Grid Rings */}
            {gridRings.map((pts, idx) => (
              <polygon
                key={idx}
                points={pts}
                fill="none"
                stroke="#1e293b"
                strokeWidth={idx === 3 ? '1.5' : '1'}
                strokeDasharray={idx < 3 ? '3 3' : undefined}
              />
            ))}

            {/* Radar Grid Axes Lines */}
            {domains.map((_, i) => {
              const { x, y } = getCoordinates(i, 1);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
              );
            })}

            {/* Rotating Radar Sweep Line */}
            <g className="animate-radar-sweep origin-[150px_135px]">
              <line
                x1={cx}
                y1={cy}
                x2={cx}
                y2={cy - radius}
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeOpacity="0.8"
              />
              <path
                d={`M ${cx} ${cy} L ${cx + 35} ${cy - radius + 15} A ${radius} ${radius} 0 0 0 ${cx} ${cy - radius} Z`}
                fill="rgba(6, 182, 212, 0.15)"
              />
            </g>

            {/* Competency Area Polygon */}
            <polygon
              points={polygonPoints}
              fill="url(#radarFillGrad)"
              stroke="#06b6d4"
              strokeWidth="2.2"
              filter="url(#radarGlow)"
              className="transition-all duration-700"
            />

            {/* Interactive Domain Axis Nodes & Labels */}
            {domains.map((d, i) => {
              const { x, y } = getCoordinates(i, d.score / 100);
              const labelPos = getCoordinates(i, 1.25);
              const isSelected = activeDomain === d.id;

              return (
                <g
                  key={d.id}
                  onClick={() => onSelectDomain(d.id)}
                  className="cursor-pointer group"
                >
                  {/* Outer pulsing ring on hover or selected */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? '9' : '6'}
                    fill={isSelected ? d.color : '#0f172a'}
                    fillOpacity={isSelected ? '0.3' : '0.8'}
                    stroke={d.color}
                    strokeWidth="2"
                    className="transition-all duration-300 group-hover:scale-125"
                  />
                  {/* Center Dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? '4' : '2.5'}
                    fill={isSelected ? '#ffffff' : d.color}
                    className="transition-all duration-300"
                  />
                  {/* Axis Label */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isSelected ? '#38bdf8' : '#94a3b8'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    className="transition-colors duration-200"
                  >
                    {d.name.split(' ')[0]} ({d.score}%)
                  </text>
                </g>
              );
            })}

            {/* Center Core Dot */}
            <circle cx={cx} cy={cy} r="3" fill="#06b6d4" />
          </svg>
        </div>

        {/* Selected Domain Telemetry Cards */}
        <div className="md:col-span-6 space-y-2.5">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: currentSelection.color }}
                />
                {currentSelection.name}
              </span>
              <span className="text-xs font-mono font-extrabold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
                {currentSelection.score}% RATIO
              </span>
            </div>

            <div className="mt-2.5 space-y-1.5 text-xs font-mono">
              <div className="text-[11px] text-slate-300">
                <span className="text-slate-500">CORE STACK: </span>
                <span className="text-cyan-200">{currentSelection.tech}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                <span className="text-slate-500">TELEMETRY: </span>
                {currentSelection.metrics}
              </div>
            </div>

            {/* Linear Score Bar */}
            <div className="mt-3 space-y-1">
              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${currentSelection.score}%`,
                    backgroundColor: currentSelection.color,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Domain Selector Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {domains.map((d) => (
              <button
                key={d.id}
                onClick={() => onSelectDomain(d.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all border cursor-pointer ${
                  activeDomain === d.id
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {d.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Latency & Performance Comparison Benchmark Graph
// ---------------------------------------------------------------------------
function LatencyBenchmarkChart() {
  const benchmarks = [
    {
      architecture: 'Standard LLM Call (No Grounding / Caching)',
      latency: 29.2,
      displayLatency: '29.2s',
      color: '#f43f5e',
      barPercent: 100,
      description: 'Full remote inference roundtrip + token streaming overhead',
    },
    {
      architecture: 'LiteLLM Gateway + Prompt Caching',
      latency: 1.85,
      displayLatency: '1.85s',
      color: '#38bdf8',
      barPercent: 16,
      description: 'Cached system prompts & model routing gateway',
    },
    {
      architecture: 'Input Hash Cache + Server Math Grounding',
      latency: 0.65,
      displayLatency: '0.65s',
      color: '#10b981',
      barPercent: 5.5,
      description: 'Deterministic hash hits & sub-second server-verified output',
    },
  ];

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#060a17]/90 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-white tracking-wider">
              BENCHMARK: LATENCY & RESPONSE TIME GRAPH
            </span>
            <p className="text-[10px] text-slate-400 font-mono">
              Empirical execution timings: Uncached vs Prompt Cached vs Input Hash Cached
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          ~45x LATENCY REDUCTION (-97.8%)
        </span>
      </div>

      <div className="space-y-4 pt-1">
        {benchmarks.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-200 font-semibold">{item.architecture}</span>
              <span className="font-extrabold" style={{ color: item.color }}>
                {item.displayLatency}
              </span>
            </div>

            {/* Horizontal Bar Visualizer */}
            <div className="relative w-full h-4 rounded-lg bg-slate-950 overflow-hidden border border-slate-800 flex items-center p-0.5">
              <div
                className="h-full rounded-md transition-all duration-1000 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                style={{
                  width: `${item.barPercent}%`,
                  minWidth: '28px',
                  backgroundColor: item.color,
                }}
              />
              <span className="absolute right-2 text-[10px] font-mono text-slate-400">
                {item.displayLatency}
              </span>
            </div>

            <p className="text-[10px] font-mono text-slate-400 pl-1">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Grid Footprint Marker */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>0.0s [INSTANT]</span>
        <span>10.0s</span>
        <span>20.0s</span>
        <span>30.0s [UNOPTIMIZED]</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. PostgreSQL Query Plan & Buffers Optimization Chart
// ---------------------------------------------------------------------------
function QueryPlanComparisonChart() {
  const [metricTab, setMetricTab] = useState('time'); // 'time' | 'buffers' | 'cost'

  const metricsData = {
    time: {
      title: 'Execution Duration (ms)',
      unit: 'ms',
      before: 840,
      after: 3.2,
      reduction: '262x Faster',
      desc: 'Wall clock time measured with EXPLAIN (ANALYZE, BUFFERS)',
    },
    buffers: {
      title: 'Disk Buffer Page Reads',
      unit: 'pages',
      before: 14800,
      after: 42,
      reduction: '99.7% Reduction',
      desc: 'Shared read buffer hits reduced via composite B-tree index',
    },
    cost: {
      title: 'PostgreSQL Planner Cost Units',
      unit: 'cost units',
      before: 148200,
      after: 820,
      reduction: '99.4% Cost Drop',
      desc: 'Query optimizer planner estimates for full query tree',
    },
  };

  const active = metricsData[metricTab];

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#060a17]/90 border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.15)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <TrendingUp className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-white tracking-wider">
              POSTGRESQL QUERY PLAN TUNING GRAPH
            </span>
            <p className="text-[10px] text-slate-400 font-mono">
              Sequential Table Scan vs Composite Bitmap Index Scan
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMetricTab('time')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-colors cursor-pointer ${
              metricTab === 'time'
                ? 'bg-amber-500/20 text-amber-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Duration
          </button>
          <button
            onClick={() => setMetricTab('buffers')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-colors cursor-pointer ${
              metricTab === 'buffers'
                ? 'bg-amber-500/20 text-amber-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Buffers
          </button>
          <button
            onClick={() => setMetricTab('cost')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-colors cursor-pointer ${
              metricTab === 'cost'
                ? 'bg-amber-500/20 text-amber-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cost
          </button>
        </div>
      </div>

      {/* Visual Comparative Graph */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Before: Sequential Scan */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-rose-400 font-bold">1. Sequential Scan (Unindexed)</span>
            <span className="text-[10px] text-slate-400">STATUS QUO</span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            {active.before.toLocaleString()} <span className="text-xs font-normal text-slate-400">{active.unit}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
            <div className="h-full rounded-full bg-rose-500 w-full" />
          </div>
          <p className="text-[10px] font-mono text-slate-400">
            Scans every row across entire disk table segment. High I/O lock.
          </p>
        </div>

        {/* After: Composite Index Scan */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 font-bold">2. Composite Index Scan</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              {active.reduction}
            </span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-300">
            {active.after.toLocaleString()} <span className="text-xs font-normal text-slate-400">{active.unit}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-700"
              style={{ width: `${Math.max(4, (active.after / active.before) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] font-mono text-slate-400">
            Instant B-tree seek directly on index pages. Minimal buffer page reads.
          </p>
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs font-mono text-amber-200 flex items-center justify-between">
        <span>SQL EXPLAIN PATTERN:</span>
        <code className="text-[11px] text-amber-300 font-bold">
          CREATE INDEX CONCURRENTLY idx_merchant_date ON transactions (merchant_id, txn_date);
        </code>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Memory Scaling Graph: Exact Set vs HyperLogLog Sketch
// ---------------------------------------------------------------------------
function HllMemoryChart() {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#060a17]/90 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Database className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-white tracking-wider">
              MEMORY SCALING: EXACT DISTINCT COUNT VS HYPERLOGLOG
            </span>
            <p className="text-[10px] text-slate-400 font-mono">
              O(N) Linear RAM Growth vs O(1) Fixed 1.5 KB Probabilistic Register
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          99.98% MEMORY SAVED AT 10M ITEMS
        </span>
      </div>

      {/* SVG Line Chart */}
      <div className="relative pt-2">
        <svg viewBox="0 0 500 180" className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="exactGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="hllGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="50" y1="20" x2="480" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="50" y1="65" x2="480" y2="65" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="50" y1="110" x2="480" y2="110" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="50" y1="155" x2="480" y2="155" stroke="#334155" />

          {/* Y Axis Labels */}
          <text x="42" y="24" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">
            128MB
          </text>
          <text x="42" y="69" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">
            64MB
          </text>
          <text x="42" y="114" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">
            16MB
          </text>
          <text x="42" y="157" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">
            1.5KB
          </text>

          {/* Exact Set Cardinality Curve (Soaring upwards) */}
          <path
            d="M 50 155 Q 260 140, 480 25 L 480 155 L 50 155 Z"
            fill="url(#exactGrad)"
          />
          <path
            d="M 50 155 Q 260 140, 480 25"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
          />

          {/* HyperLogLog Flat Curve (Pinned at bottom 1.5KB) */}
          <path
            d="M 50 152 L 480 152 L 480 155 L 50 155 Z"
            fill="url(#hllGrad)"
          />
          <line
            x1="50"
            y1="152"
            x2="480"
            y2="152"
            stroke="#10b981"
            strokeWidth="3"
            filter="drop-shadow(0 0 6px #10b981)"
          />

          {/* Glowing Markers */}
          <circle cx="480" cy="25" r="4.5" fill="#f43f5e" />
          <circle cx="480" cy="152" r="5" fill="#10b981" />

          {/* Annotation Badge on HLL Line */}
          <g transform="translate(320, 125)">
            <rect
              width="150"
              height="20"
              rx="4"
              fill="#064e3b"
              stroke="#10b981"
              strokeWidth="1"
            />
            <text
              x="75"
              y="13"
              fill="#a7f3d0"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              HLL CONSTANT 1.5 KB
            </text>
          </g>

          {/* X Axis Labels */}
          <text x="50" y="172" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
            10K
          </text>
          <text x="155" y="172" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
            100K
          </text>
          <text x="265" y="172" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
            1M
          </text>
          <text x="375" y="172" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
            10M
          </text>
          <text x="480" y="172" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
            50M+ ITEMS
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400">KEY CAPABILITY:</span>
          <p className="text-slate-200 mt-0.5">
            Sketches can be <span className="text-emerald-400 font-bold">unioned together</span> at query time across
            locations or dates without recounting rows.
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400">ENGINEERING TRADEOFF:</span>
          <p className="text-slate-200 mt-0.5">
            Approximate count with a fixed ~1.04/√m standard error (perfect for analytics, not for financial billing).
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Interactive System Architecture Pipeline Graph
// ---------------------------------------------------------------------------
function ArchitectureFlowGraph() {
  const [activeStep, setActiveStep] = useState(2); // 0 to 4

  const steps = [
    {
      id: 0,
      title: 'Inbound Client Request',
      label: '1. API Call',
      tag: 'FASTAPI / REST',
      detail:
        'Client requests analytical summaries with strict latency SLA and payload compression.',
      pattern: 'Gzip/Brotli payload compression + Bearer authentication gate',
    },
    {
      id: 1,
      title: 'LiteLLM Gateway & Cost Router',
      label: '2. Cost Router',
      tag: 'GATEWAY ROUTER',
      detail:
        'Routes lightweight extraction tasks to fast models, reserving reasoning models for complex pipelines.',
      pattern: 'Model tiering + token caps + prompt caching for stable system schemas',
    },
    {
      id: 2,
      title: 'MCP Specialist Agents',
      label: '3. Tool Protocol',
      tag: 'MODEL CONTEXT PROTOCOL',
      detail:
        'Autonomous tool invocations via Model Context Protocol (MCP) to fetch live database state.',
      pattern: 'Structured JSON schema tool arguments + parallel non-blocking execution',
    },
    {
      id: 3,
      title: 'Server Grounding Math Gate',
      label: '4. Math Check',
      tag: 'GROUNDING GATE',
      detail:
        'Treats LLM purely as a writer. The server computes the numbers; regex extracts every figure from output.',
      pattern: 'Fail-closed verification: any unmatched figure triggers an immediate retry or rejection',
    },
    {
      id: 4,
      title: 'Input Hash Output Cache',
      label: '5. Deterministic Cache',
      tag: 'HASH CACHE',
      detail:
        'Hashes structured input + prompt version + model name. Guarantees deterministic sub-second responses.',
      pattern: 'Hash key lookup in Redis/Memory: 29s latency ➔ 0.65s instant return',
    },
  ];

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#060a17]/90 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Network className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-white tracking-wider">
              INTERACTIVE SYSTEM ARCHITECTURE & DATA FLOW
            </span>
            <p className="text-[10px] text-slate-400 font-mono">
              Click any node to inspect data pipeline schematics and security gates
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-500/30 text-cyan-300">
          5 CONNECTED NODES
        </span>
      </div>

      {/* Interactive Node Flow Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 relative">
        {steps.map((s, idx) => {
          const isSelected = activeStep === s.id;
          return (
            <div
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer relative text-center group ${
                isSelected
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-[1.02]'
                  : 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/60'
              }`}
            >
              <span className="text-[9px] font-mono text-cyan-400/90 uppercase tracking-widest block">
                {s.label}
              </span>
              <h4 className="text-xs font-mono font-bold text-white mt-1 group-hover:text-cyan-200">
                {s.title.split(' ')[0]} {s.title.split(' ')[1] || ''}
              </h4>
              <span className="inline-block mt-2 px-1.5 py-0.5 rounded text-[8px] font-mono bg-slate-900 border border-slate-800 text-slate-400">
                {s.tag}
              </span>

              {/* Step indicator arrow for mobile or connectors */}
              {idx < steps.length - 1 && (
                <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-cyan-400 font-bold text-xs pointer-events-none">
                  ➔
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Step Schematics Box */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            {steps[activeStep].title}
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
            STAGE {activeStep + 1} OF 5
          </span>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          {steps[activeStep].detail}
        </p>

        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">PRODUCTION PATTERN:</span>
          <span className="text-cyan-200">{steps[activeStep].pattern}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. Holographic Neural Voice Equalizer Waveform
// ---------------------------------------------------------------------------
function NeuralVoiceWave({ isSpeaking, isListening, onToggleSpeech, hasText }) {
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-950/90 border border-cyan-500/30">
      {/* 5-Bar Animated Equalizer */}
      <div className="flex items-center gap-1 h-5 px-1">
        <div
          className={`w-1 rounded-full bg-cyan-400 transition-all ${
            isSpeaking ? 'animate-eq-1' : 'h-1.5 bg-slate-600'
          }`}
        />
        <div
          className={`w-1 rounded-full bg-cyan-300 transition-all ${
            isSpeaking ? 'animate-eq-2' : 'h-2 bg-slate-600'
          }`}
        />
        <div
          className={`w-1 rounded-full bg-sky-300 transition-all ${
            isSpeaking ? 'animate-eq-3' : 'h-3 bg-slate-600'
          }`}
        />
        <div
          className={`w-1 rounded-full bg-emerald-400 transition-all ${
            isSpeaking ? 'animate-eq-4' : 'h-2 bg-slate-600'
          }`}
        />
        <div
          className={`w-1 rounded-full bg-cyan-400 transition-all ${
            isSpeaking ? 'animate-eq-5' : 'h-1.5 bg-slate-600'
          }`}
        />
      </div>

      {/* Voice Toggle Button */}
      {hasText && (
        <button
          onClick={onToggleSpeech}
          className="text-[10px] font-mono flex items-center gap-1.5 text-cyan-300 hover:text-white transition-colors cursor-pointer"
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              <span>MUTE VOICE</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>LISTEN TO DOSSIER</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main AI Command Center Component
// ---------------------------------------------------------------------------
export default function ChatWidget({
  profile = {},
  experiences = [],
  projects = [],
  skills = [],
  posts = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeRadarDomain, setActiveRadarDomain] = useState('backend');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const fullName = profile?.name || 'Harsha Vardhan Reddy';
  const firstName = fullName.split(' ')[0] || 'Harsha';

  // Initial Welcome Dossier
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: 'agent',
          text: `Neural Intelligence Engine Active. I am ${firstName}'s personal architecture intelligence agent.

Telemetry loaded across ${experiences.length} enterprise engineering tenures, ${projects.length} production repositories, and verified cloud systems benchmarks. 

Enter any inquiry or select a deep-dive visual dossier below:`,
          timestamp: new Date(),
          storyType: 'overview',
        },
      ]);
    }
  }, [firstName, experiences.length, projects.length]);

  // Keyboard shortcut Ctrl+K and Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          playHudSound(next ? 'open' : 'close');
          return next;
        });
      } else if (e.key === 'Escape' && isOpen) {
        if (selectedArticle) {
          setSelectedArticle(null);
        } else {
          setIsOpen(false);
          playHudSound('close');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedArticle]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      playHudSound('open');
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    }
  }, [isOpen]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Voice Search / Dictation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          handleSend(transcript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        playHudSound('send');
      } catch {
        setIsListening(false);
      }
    }
  };

  // Text-To-Speech Speech Synthesis
  const toggleSpeechSynthesis = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const clean = text.replace(/\[NAV:[a-zA-Z0-9_-]+\]/g, '').replace(/[#*`_~]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Navigation Lock-On with Cyan Pulse
  const handleLockOnInPortfolio = (target) => {
    setIsOpen(false);
    playHudSound('close');

    if (target === 'blog' && selectedArticle) {
      window.location.hash = '#blog';
    }

    const sectionId = target.replace('#', '');
    if (window.location.hash === '#blog') {
      window.location.hash = '';
    }

    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });

        element.classList.add(
          'ring-2',
          'ring-cyan-400',
          'ring-offset-4',
          'ring-offset-[#050811]',
          'shadow-[0_0_60px_rgba(6,182,212,0.45)]',
          'transition-all',
          'duration-500'
        );
        setTimeout(() => {
          element.classList.remove(
            'ring-2',
            'ring-cyan-400',
            'ring-offset-4',
            'ring-offset-[#050811]',
            'shadow-[0_0_60px_rgba(6,182,212,0.45)]'
          );
        }, 2500);

        if (sectionId === 'contact') {
          setTimeout(() => {
            const firstInput = element.querySelector('input, textarea');
            if (firstInput) firstInput.focus();
          }, 600);
        }
      }
    }, 200);
  };

  // Determine Story Type & Visual Domain from Query
  const analyzeStoryType = (text, userQuery = '') => {
    const combined = `${userQuery} ${text}`.toLowerCase();
    if (
      combined.includes('genai') ||
      combined.includes('llm') ||
      combined.includes('agent') ||
      combined.includes('mcp') ||
      combined.includes('rag') ||
      combined.includes('prompt') ||
      combined.includes('litellm') ||
      combined.includes('math')
    ) {
      return 'genai';
    }
    if (
      combined.includes('postgres') ||
      combined.includes('query plan') ||
      combined.includes('hyperloglog') ||
      combined.includes('index') ||
      combined.includes('latency') ||
      combined.includes('speed') ||
      combined.includes('bottleneck') ||
      combined.includes('performance')
    ) {
      return 'performance';
    }
    if (
      combined.includes('data') ||
      combined.includes('etl') ||
      combined.includes('synapse') ||
      combined.includes('spark') ||
      combined.includes('pyspark') ||
      combined.includes('pipeline') ||
      combined.includes('databricks')
    ) {
      return 'bigdata';
    }
    if (
      combined.includes('project') ||
      combined.includes('schematic') ||
      combined.includes('app') ||
      combined.includes('code') ||
      combined.includes('repo') ||
      combined.includes('github')
    ) {
      return 'projects';
    }
    if (
      combined.includes('experience') ||
      combined.includes('career') ||
      combined.includes('deloitte') ||
      combined.includes('pwc') ||
      combined.includes('tcs') ||
      combined.includes('work history') ||
      combined.includes('roles')
    ) {
      return 'experience';
    }
    if (
      combined.includes('skill') ||
      combined.includes('tech stack') ||
      combined.includes('competency') ||
      combined.includes('radar') ||
      combined.includes('languages') ||
      combined.includes('frameworks')
    ) {
      return 'skills';
    }
    if (
      combined.includes('blog') ||
      combined.includes('article') ||
      combined.includes('post') ||
      combined.includes('grounded') ||
      combined.includes('api security')
    ) {
      return 'blog';
    }
    if (
      combined.includes('contact') ||
      combined.includes('hire') ||
      combined.includes('email') ||
      combined.includes('reach out') ||
      combined.includes('linkedin')
    ) {
      return 'contact';
    }
    return 'overview';
  };

  const handleSend = async (customQuery = null, overrideType = null) => {
    const query = customQuery || input;
    if (!query.trim() || loading) return;

    playHudSound('send');

    const newMessages = [
      ...messages,
      { sender: 'user', text: query, timestamp: new Date() },
    ];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = newMessages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await sendChatMessage(query, history);
      const reply = res.reply || 'Dossier synthesized from system telemetry.';

      const storyType = overrideType || analyzeStoryType(reply, query);

      setMessages([
        ...newMessages,
        {
          sender: 'agent',
          text: reply,
          timestamp: new Date(),
          storyType,
        },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          sender: 'agent',
          text: `Neural telemetry offline. Reconnecting to ${firstName}'s system core...`,
          timestamp: new Date(),
          storyType: overrideType || 'overview',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // -------------------------------------------------------------------------
  // Render Dynamic Visual Story & Interactive Components
  // -------------------------------------------------------------------------
  const renderVisualStory = (storyType = 'overview') => {
    switch (storyType) {
      case 'genai':
        return (
          <div className="space-y-4 animate-fadeIn">
            {/* Real Latency Benchmark Comparison Chart */}
            <LatencyBenchmarkChart />

            {/* Real Interactive Architecture Flowchart */}
            <ArchitectureFlowGraph />

            {/* Recommended Deep Dive Technical Articles */}
            {posts.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Grounded Architecture Publication
                  </span>
                  <button
                    onClick={() => handleLockOnInPortfolio('blog')}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View in Blog</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                {posts
                  .filter((p) => p.slug.includes('llm') || p.tags?.toLowerCase().includes('genai'))
                  .slice(0, 1)
                  .map((post) => (
                    <div
                      key={post.id}
                      className="p-3.5 rounded-lg bg-slate-950/80 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white hover:text-cyan-300 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{post.excerpt}</p>
                      </div>
                      <button
                        onClick={() => setSelectedArticle(post)}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shrink-0 cursor-pointer flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Schematics</span>
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-4 animate-fadeIn">
            {/* Real PostgreSQL Query Plan Tuning Graph */}
            <QueryPlanComparisonChart />

            {/* Real Memory Cardinality Graph */}
            <HllMemoryChart />

            {/* Performance Deep Dive Article */}
            {posts
              .filter((p) => p.slug.includes('api') || p.slug.includes('postgres'))
              .slice(0, 1)
              .map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                      FEATURED ARCHITECTURE ARTICLE
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{post.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedArticle(post)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read Guide</span>
                    </button>
                    <button
                      onClick={() => handleLockOnInPortfolio('experience')}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                      title="Lock on in Experience Timeline"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        );

      case 'bigdata':
        return (
          <div className="space-y-4 animate-fadeIn">
            {/* Memory Scaling Visual Curve */}
            <HllMemoryChart />

            {/* Big Data Cloud Stack Visual Dossier */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> Cloud ETL & Big Data Architecture
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
                  AZURE SYNAPSE // DATABRICKS
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Batch Ingestion</div>
                  <div className="text-xs font-semibold text-white mt-1">PySpark Transformations</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">High-volume analytical data extraction</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Cloud Storage</div>
                  <div className="text-xs font-semibold text-white mt-1">Azure Synapse & BigQuery</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Relational & columnar analytical warehousing</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Streaming & Uploads</div>
                  <div className="text-xs font-semibold text-white mt-1">Chunked File Streaming</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">~99% lower peak memory (100MB ➔ 1MB)</div>
                </div>
              </div>
            </div>

            {/* Reused Experience Highlights */}
            {experiences
              .filter((e) => e.company.includes('PwC') || e.company.includes('Deloitte'))
              .slice(0, 2)
              .map((exp) => (
                <div
                  key={exp.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{exp.company}</span>
                    <span className="text-xs text-slate-300 font-semibold ml-2">— {exp.role}</span>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">Tech: {exp.skills_text}</div>
                  </div>
                  <button
                    onClick={() => handleLockOnInPortfolio('experience')}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Focus In Timeline</span>
                  </button>
                </div>
              ))}
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4 animate-fadeIn">
            {/* Interactive Multi-Axis Competency Radar */}
            <RadarSkillChart
              activeDomain={activeRadarDomain}
              onSelectDomain={setActiveRadarDomain}
            />

            {/* Categorized Skills Catalog */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-slate-300">Skills Catalog</span>
                <button
                  onClick={() => handleLockOnInPortfolio('skills')}
                  className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Lock On in Skills</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 30).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-950 border border-slate-800/80 text-slate-300 hover:border-purple-400/40 transition-colors"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" /> Production Repositories & Schematics
              </span>
              <button
                onClick={() => handleLockOnInPortfolio('projects')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Crosshair className="w-3 h-3" />
                <span>Lock On in Projects</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projects.map((proj) => {
                let bullets = [];
                try {
                  bullets = typeof proj.bullets === 'string' ? JSON.parse(proj.bullets) : proj.bullets || [];
                } catch {
                  bullets = [];
                }
                const techList = proj.tech_stack ? proj.tech_stack.split(',').map((t) => t.trim()) : [];

                return (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                        {proj.featured && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-500/40 text-cyan-300 shrink-0">
                            FEATURED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.description}</p>

                      {bullets.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {bullets.slice(0, 2).map((b, bIdx) => (
                            <div key={bIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5 font-mono">
                              <span className="text-cyan-400 mt-0.5">▹</span>
                              <span className="line-clamp-1">{b}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-800/80">
                      {techList.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {techList.slice(0, 4).map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {proj.github_url && (
                          <a
                            href={proj.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                          >
                            <GithubIcon className="w-3.5 h-3.5" />
                            <span>Source</span>
                          </a>
                        )}
                        {proj.live_url && (
                          <a
                            href={proj.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Demo</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" /> Career Milestones & Tenures
              </span>
              <button
                onClick={() => handleLockOnInPortfolio('experience')}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <Crosshair className="w-3 h-3" />
                <span>Lock On in Experience</span>
              </button>
            </div>

            <div className="space-y-3">
              {experiences.map((exp) => {
                let bullets = [];
                try {
                  bullets = typeof exp.bullets === 'string' ? JSON.parse(exp.bullets) : exp.bullets || [];
                } catch {
                  bullets = [];
                }

                return (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                        <span className="text-xs font-mono font-bold text-emerald-400">{exp.company}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {exp.start_date} — {exp.end_date || 'Present'}
                      </span>
                    </div>

                    {bullets.length > 0 && (
                      <div className="space-y-1">
                        {bullets.slice(0, 2).map((b, bIdx) => (
                          <div key={bIdx} className="text-xs text-slate-300 flex items-start gap-1.5 font-sans">
                            <span className="text-emerald-400 font-mono mt-0.5">▹</span>
                            <span className="line-clamp-2">{b}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {exp.skills_text && (
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                        <span className="text-slate-500">TECHNOLOGIES: </span>
                        {exp.skills_text}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'blog':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Published Engineering Blueprints
              </span>
              <button
                onClick={() => handleLockOnInPortfolio('blog')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Crosshair className="w-3 h-3" />
                <span>Lock On in Blog</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                      {post.tags?.split(',')[0] || 'ENGINEERING'}
                    </span>
                    <h4 className="text-sm font-bold text-white hover:text-cyan-300 transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{post.excerpt}</p>
                  </div>

                  <button
                    onClick={() => setSelectedArticle(post)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Schematics</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-300">Direct Contact Transmission</span>
              <button
                onClick={() => handleLockOnInPortfolio('contact')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Crosshair className="w-3 h-3" />
                <span>Jump to Contact Form</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 font-sans">
              Connect directly with {firstName} for distributed systems architecture, cloud data modernization, or engineering leadership:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 hover:bg-cyan-500/30"
                >
                  <span>✉ {profile.email}</span>
                </a>
              )}
              {profile?.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 hover:bg-slate-700"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub Profile</span>
                </a>
              )}
              {profile?.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5 hover:bg-blue-500/30"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                  <span>LinkedIn Network</span>
                </a>
              )}
            </div>
          </div>
        );

      default:
        // Overview Visual Presets Bar & Competency Radar
        return (
          <div className="space-y-4 pt-1 animate-fadeIn">
            {/* Interactive Radar Chart */}
            <RadarSkillChart
              activeDomain={activeRadarDomain}
              onSelectDomain={setActiveRadarDomain}
            />

            {/* Quick Dossier Launcher Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() =>
                  handleSend(`Tell me about ${firstName}'s GenAI & LLM engineering work`, 'omni', 'genai')
                }
                className="p-3 rounded-xl bg-slate-900/60 border border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-900 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 group-hover:text-cyan-200">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>GenAI & Grounding Flow</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  LiteLLM, MCP Specialist Agents & Input Hash Cache
                </p>
              </button>

              <button
                onClick={() =>
                  handleSend(`What are ${firstName}'s API and Postgres performance patterns?`, 'omni', 'performance')
                }
                className="p-3 rounded-xl bg-slate-900/60 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-900 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 group-hover:text-amber-200">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Postgres & API Tuning</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  Query plans, HyperLogLog distinct counts & compression
                </p>
              </button>

              <button
                onClick={() =>
                  handleSend(`What is ${firstName}'s enterprise career trajectory?`, 'omni', 'experience')
                }
                className="p-3 rounded-xl bg-slate-900/60 border border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-900 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-300 group-hover:text-emerald-200">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enterprise Career Journey</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  Deloitte USI, PwC AC India, and TCS milestones
                </p>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* Floating Holographic Launch Button                   */}
      {/* ---------------------------------------------------- */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Personal Command Center"
            className="relative group cursor-pointer flex items-center gap-3 p-2 pr-4 rounded-full bg-[#050811]/90 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.35)] hover:shadow-[0_0_55px_rgba(6,182,212,0.6)] transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {/* Spinning Arc Reactor Core Animation */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/80 animate-jarvis-spin" />
              <div className="absolute inset-1 rounded-full border border-dotted border-cyan-300/70 animate-jarvis-spin-reverse" />
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-300 animate-jarvis-pulse flex items-center justify-center shadow-[0_0_15px_#06b6d4]">
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              </div>
            </div>

            {/* AI HUD Label */}
            <div className="flex flex-col text-left">
              <span className="text-xs font-mono font-bold text-cyan-300 tracking-widest flex items-center gap-1.5">
                {fullName ? `${firstName}'s AI Agent` : 'AI COMMAND CENTER'}
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </span>
              <span className="text-[9px] font-mono text-cyan-500/90 tracking-wider uppercase flex items-center gap-1">
                <span>PRESS</span>
                <kbd className="px-1 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-[8px] text-cyan-300">
                  Ctrl+K
                </kbd>
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Full-Screen Holographic Neural Search Command Center */}
      {/* ---------------------------------------------------- */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isFullScreen
              ? 'inset-0 bg-[#030611]/98 backdrop-blur-3xl flex flex-col'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-full sm:w-[94vw] sm:max-w-5xl h-[92vh] rounded-2xl bg-[#050811]/98 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.35)] flex flex-col overflow-hidden'
          }`}
        >
          {/* Futuristic HUD Corner Brackets */}
          <div className="jarvis-corner-tl" />
          <div className="jarvis-corner-tr" />
          <div className="jarvis-corner-bl" />
          <div className="jarvis-corner-br" />

          {/* Background Holographic Grid Scan */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

          {/* Top Telemetry Header Bar */}
          <div className="px-4 sm:px-6 py-3 bg-[#060a17]/95 border-b border-cyan-500/30 flex items-center justify-between shrink-0 relative z-10">
            {/* Left: Holographic Reactor Status */}
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400 animate-jarvis-spin" />
                <div className="w-4 h-4 rounded-full bg-cyan-400 animate-jarvis-pulse flex items-center justify-center shadow-[0_0_12px_#06b6d4]">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-mono font-extrabold text-white tracking-widest uppercase">
                    {firstName}'s Neural Command Center
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    TELEMETRY SYNCHRONIZED
                  </span>
                </div>
                <p className="text-[10px] font-mono text-cyan-400/80 hidden sm:block">
                  FULL-SCREEN VISUAL SEARCH ENGINE // REAL-TIME COMPONENT SYNTHESIS
                </p>
              </div>
            </div>

            {/* Right: Controls & Dismissal */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                aria-label={isFullScreen ? 'Dock Window' : 'Full Screen'}
                className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer"
                title={isFullScreen ? 'Dock Window' : 'Maximize Full Screen'}
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  playHudSound('close');
                }}
                aria-label="Close Command Center"
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-500/50 transition-colors cursor-pointer group"
                title="Close (Esc)"
              >
                <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Center-Stage Holographic Omnibar */}
          <div className="px-4 sm:px-6 py-4 bg-[#050811]/90 border-b border-cyan-500/20 shrink-0 relative z-10">
            <div className="max-w-4xl mx-auto space-y-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative flex items-center"
              >
                <div className="absolute left-4 flex items-center gap-2 text-cyan-400 pointer-events-none">
                  <Terminal className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold text-cyan-400">λ &gt;</span>
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Search anything about ${firstName}: "Show GenAI pipeline", "Postgres query tuning", "Radar skills", "Deloitte experience"...`}
                  className="w-full pl-16 pr-28 py-3.5 text-sm sm:text-base font-mono rounded-2xl bg-slate-950/90 border border-cyan-500/40 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all"
                />

                <div className="absolute right-3 flex items-center gap-1.5">
                  {/* Voice Input Button */}
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    aria-label={isListening ? 'Stop Listening' : 'Voice Input'}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_#f43f5e]'
                        : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-transparent hover:border-cyan-500/30'
                    }`}
                    title={isListening ? 'Listening...' : 'Voice Search'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    aria-label="Send Query"
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">QUERY</span>
                  </button>
                </div>
              </form>

              {/* Fast Visual Story Preset Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
                <span className="text-[10px] text-cyan-400/80 uppercase tracking-widest shrink-0">
                  STORY TELEMETRY:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleSend(
                      `Show me ${firstName}'s GenAI, LiteLLM and Grounded Architecture work`,
                      'omni',
                      'genai'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 shrink-0 transition-colors cursor-pointer"
                >
                  ⚡ GenAI & Grounding
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSend(
                      `Explain ${firstName}'s API and Postgres performance optimization patterns`,
                      'omni',
                      'performance'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 shrink-0 transition-colors cursor-pointer"
                >
                  🚀 Query Plans & Performance
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSend(
                      `Display ${firstName}'s competency radar and skills matrix`,
                      'omni',
                      'skills'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 shrink-0 transition-colors cursor-pointer"
                >
                  📊 Competency Radar Chart
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSend(
                      `What are ${firstName}'s featured production code projects?`,
                      'omni',
                      'projects'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-300 shrink-0 transition-colors cursor-pointer"
                >
                  🛠️ Projects & Code
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSend(
                      `Summarize ${firstName}'s enterprise career milestones`,
                      'omni',
                      'experience'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 shrink-0 transition-colors cursor-pointer"
                >
                  🏛️ Enterprise Milestones
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSend(
                      `List ${firstName}'s technical blog publications`,
                      'omni',
                      'blog'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 shrink-0 transition-colors cursor-pointer"
                >
                  📖 Publications & Blueprints
                </button>
              </div>
            </div>
          </div>

          {/* Dossier & Story Results Viewport */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';

              if (isUser) {
                return (
                  <div key={index} className="flex justify-end animate-fadeIn">
                    <div className="max-w-2xl px-4 py-2.5 rounded-2xl rounded-tr-none bg-cyan-950/60 border border-cyan-500/40 text-cyan-100 text-sm font-mono shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{msg.text}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className="p-5 sm:p-7 rounded-2xl bg-[#060a17]/90 border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.15)] space-y-5 animate-fadeIn"
                >
                  {/* Executive AI Header & Audio Equalizer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-xs font-mono font-extrabold text-cyan-300 uppercase tracking-widest">
                        INTELLIGENCE DOSSIER // {msg.storyType?.toUpperCase() || 'SYNTHESIS'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Neural Voice Waveform & Listen Button */}
                      <NeuralVoiceWave
                        isSpeaking={isSpeaking}
                        isListening={isListening}
                        hasText={Boolean(msg.text)}
                        onToggleSpeech={() => toggleSpeechSynthesis(msg.text)}
                      />

                      {/* Copy Dossier */}
                      <button
                        onClick={() => copyToClipboard(msg.text, index)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                        title="Copy Dossier Text"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* AI Agent Narrative Briefing */}
                  <div className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                    {msg.text.replace(/\[NAV:[a-zA-Z0-9_-]+\]/g, '').trim()}
                  </div>

                  {/* Render Rich Visual Story, Real Charts, Graphs & Interactive Components */}
                  {renderVisualStory(msg.storyType, msg.text)}
                </div>
              );
            })}

            {loading && (
              <div className="p-6 rounded-2xl bg-[#070c1b]/80 border border-cyan-500/30 flex items-center gap-3 text-cyan-400 font-mono text-xs animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                <span>SYNTHESIZING VISUAL DOSSIER // ACCESSING SYSTEM TELEMETRY...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ---------------------------------------------------- */}
          {/* In-Place Technical Article Reader Drawer             */}
          {/* ---------------------------------------------------- */}
          {selectedArticle && (
            <div className="absolute inset-0 z-50 bg-[#050811]/98 backdrop-blur-3xl p-6 sm:p-10 overflow-y-auto flex flex-col justify-between animate-fadeIn">
              <div className="max-w-4xl mx-auto w-full">
                <div className="flex items-center justify-between pb-4 border-b border-cyan-500/30 mb-6">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                      TECHNICAL PUBLICATION SCHEMATICS
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{selectedArticle.title}</h2>
                    {selectedArticle.tags && (
                      <div className="text-xs font-mono text-slate-400 mt-1">Tags: {selectedArticle.tags}</div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 font-sans whitespace-pre-line">
                  {selectedArticle.content}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  >
                    Close Reader
                  </button>
                  <button
                    onClick={() => {
                      setSelectedArticle(null);
                      handleLockOnInPortfolio('blog');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View In Blog Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
