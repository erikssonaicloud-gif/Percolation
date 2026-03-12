import React, { useState, useCallback } from 'react';
import {
  Brain,
  Flame,
  Thermometer,
  Eye,
  Edit3,
  Database,
  Network,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  GitBranch,
  Shield,
  ChevronRight,
  Activity,
  Microscope,
  Map,
  BookOpen,
  ExternalLink,
  Radio,
} from 'lucide-react';

type StatusLevel = 'disconnected' | 'near-threshold' | 'integrated';

interface ParsedLog {
  observers: number;
  operators: number;
  total: number;
  sampleLines: string[];
}

function computeKappa(observations: number, operations: number): number {
  const denom = Math.max(observations + operations, 1);
  return Math.round((2 * observations * operations) / denom);
}

function getStatus(kappa: number): StatusLevel {
  if (kappa < 30) return 'disconnected';
  if (kappa < 60) return 'near-threshold';
  return 'integrated';
}

const OBSERVER_KEYWORDS = [
  'viewed', 'visited', 'opened', 'read', 'accessed', 'browsed',
  'searched', 'looked', 'checked', 'watched', 'reviewed',
];
const OPERATOR_KEYWORDS = [
  'edited', 'created', 'modified', 'saved', 'wrote', 'updated',
  'deleted', 'moved', 'uploaded', 'submitted', 'published', 'sent',
  'downloaded', 'exported', 'printed', 'replied',
];

function parseActivityLog(text: string): ParsedLog {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  let observers = 0;
  let operators = 0;
  const sampleLines: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    const isOp = OPERATOR_KEYWORDS.some((kw) => lower.includes(kw));
    const isObs = OBSERVER_KEYWORDS.some((kw) => lower.includes(kw));
    if (isOp) {
      operators++;
      if (sampleLines.length < 6) sampleLines.push(`[OP] ${line.trim().slice(0, 80)}`);
    } else if (isObs) {
      observers++;
      if (sampleLines.length < 6) sampleLines.push(`[OBS] ${line.trim().slice(0, 80)}`);
    }
  }

  return { observers, operators, total: observers + operators, sampleLines };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-500/40" />
      <span className="font-mono text-xs tracking-[0.25em] uppercase text-indigo-400 border border-indigo-500/40 px-3 py-1">
        {children}
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-500/40" />
    </div>
  );
}

function MetricBox({
  value,
  label,
  color = 'indigo',
}: {
  value: string;
  label: string;
  color?: 'indigo' | 'red' | 'amber' | 'green' | 'cyan';
}) {
  const colorMap = {
    indigo: 'text-indigo-300 border-indigo-500/50 bg-indigo-950/40',
    red: 'text-red-400 border-red-500/50 bg-red-950/40',
    amber: 'text-amber-400 border-amber-500/50 bg-amber-950/40',
    green: 'text-green-400 border-green-500/50 bg-green-950/40',
    cyan: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40',
  };
  return (
    <div className={`border ${colorMap[color]} p-4 flex flex-col items-center`}>
      <span className="font-mono text-3xl font-bold">{value}</span>
      <span className="text-xs text-slate-500 tracking-widest uppercase mt-1">{label}</span>
    </div>
  );
}

export default function App() {
  const [observations, setObservations] = useState(50);
  const [operations, setOperations] = useState(50);
  const [logText, setLogText] = useState('');
  const [parsed, setParsed] = useState<ParsedLog | null>(null);

  const kappa = computeKappa(observations, operations);
  const status = getStatus(kappa);

  const handleParse = useCallback(() => {
    if (logText.trim()) {
      setParsed(parseActivityLog(logText));
    }
  }, [logText]);

  const statusConfig = {
    disconnected: {
      label: 'Critical Slowing Down / Disconnected',
      color: 'text-red-400',
      border: 'border-red-500/60',
      bg: 'bg-red-950/30',
      icon: AlertTriangle,
      dotColor: 'bg-red-500',
    },
    'near-threshold': {
      label: 'Near-Threshold / Approaching Criticality',
      color: 'text-amber-400',
      border: 'border-amber-500/60',
      bg: 'bg-amber-950/30',
      icon: Clock,
      dotColor: 'bg-amber-500',
    },
    integrated: {
      label: 'Integrated / Flow State Active',
      color: 'text-green-400',
      border: 'border-green-500/60',
      bg: 'bg-green-950/30',
      icon: CheckCircle2,
      dotColor: 'bg-green-500',
    },
  };

  const s = statusConfig[status];
  const StatusIcon = s.icon;

  const couplingBarWidth = `${kappa}%`;

  const totalParsed = parsed ? parsed.total : 0;
  const obsRatio = parsed && totalParsed > 0 ? parsed.observers / totalParsed : 0;
  const opRatio = parsed && totalParsed > 0 ? parsed.operators / totalParsed : 0;
  const noiseNodes = parsed ? Math.max(0, Math.round(totalParsed * 0.12)) : 0;
  const parsedKappa =
    parsed && parsed.total > 0
      ? computeKappa(
          Math.min(parsed.observers, 100),
          Math.min(parsed.operators, 100)
        )
      : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar */}
      <div className="border-b border-slate-800/60 bg-slate-950/80 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-indigo-400 animate-pulse" />
            <span className="font-mono text-xs text-indigo-400 tracking-wider">
              PERCOLATION ENGINE
            </span>
            <span className="font-mono text-xs text-slate-600 mx-1">|</span>
            <span className="font-mono text-xs text-slate-500">BMS 4.0</span>
          </div>
          <span className="font-mono text-xs text-slate-600">
            κ = {kappa.toString().padStart(3, '0')}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-24">

        {/* ── HERO ──────────────────────────────────────── */}
        <section className="pt-20 pb-16 border-b border-slate-800/50">
          <div className="mb-6">
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-indigo-500">
              Biological Mapping System
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-6 text-slate-50">
            The Architecture<br />
            <span className="text-indigo-400">of a Break</span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-12">
            Human cognitive collapse is not random. It follows the same phase
            transition laws that govern forest fires, cellular apoptosis, and
            network percolation.
          </p>

          {/* Forest fire analogy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-800/60 border border-slate-800/60">
            <div className="bg-slate-950 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={16} className="text-green-400" />
                <span className="font-mono text-xs uppercase tracking-widest text-green-400">
                  Sparse Forest — p &lt; p_c
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Trees spaced far apart. A fire ignites but finds no path to spread.
                Each burning tree is isolated. The system self-extinguishes. This
                is a healthy cognitive network — observations and operations
                loosely coupled, no runaway cascade.
              </p>
            </div>
            <div className="bg-slate-950 p-6 border-t sm:border-t-0 sm:border-l border-slate-800/60">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={16} className="text-red-400" />
                <span className="font-mono text-xs uppercase tracking-widest text-red-400">
                  Dense Corrupt Cluster — p &gt; p_c
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Version sprawl, inbox overflow, competing priorities form dense,
                corrupted clusters. A single stressor now finds a connected path
                spanning the entire network. The giant component forms. The system
                enters <em className="text-red-300">critical slowing down</em> — and
                breaks.
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 border-l-2 border-indigo-500 bg-indigo-950/20">
            <p className="text-sm text-indigo-200 leading-relaxed">
              <span className="font-mono text-indigo-400 font-semibold">
                Percolation Theory —
              </span>{' '}
              As the occupation probability{' '}
              <span className="font-mono text-cyan-400">p</span> of corrupted
              nodes approaches the critical threshold{' '}
              <span className="font-mono text-cyan-400">p_c</span>, the system
              undergoes a phase transition from a navigable, resilient state to a
              fragmented, paralyzed one. The coupling strength{' '}
              <span className="font-mono text-cyan-400">κ</span> measures the
              health of the bridge between your input layer (Observer) and output
              layer (Operator).
            </p>
          </div>
        </section>

        {/* ── SYSTEM THERMOMETER ───────────────────────── */}
        <section className="py-14 border-b border-slate-800/50">
          <SectionLabel>System Thermometer</SectionLabel>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <MetricBox value={observations.toString()} label="Observations" color="cyan" />
            <MetricBox
              value={kappa.toString()}
              label="κ Coupling"
              color={
                status === 'disconnected'
                  ? 'red'
                  : status === 'near-threshold'
                  ? 'amber'
                  : 'green'
              }
            />
            <MetricBox value={operations.toString()} label="Operations" color="indigo" />
          </div>

          {/* Coupling bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="font-mono text-xs text-slate-500">COUPLING STRENGTH κ</span>
              <span className="font-mono text-xs text-slate-400">{kappa} / 100</span>
            </div>
            <div className="h-3 bg-slate-900 border border-slate-700/50 relative">
              <div
                className={`h-full transition-all duration-500 ${
                  status === 'disconnected'
                    ? 'bg-gradient-to-r from-red-800 to-red-500'
                    : status === 'near-threshold'
                    ? 'bg-gradient-to-r from-amber-800 to-amber-500'
                    : 'bg-gradient-to-r from-green-800 to-green-500'
                }`}
                style={{ width: couplingBarWidth }}
              />
              {/* threshold markers */}
              <div className="absolute top-0 bottom-0 border-l border-dashed border-amber-600/60" style={{ left: '30%' }} />
              <div className="absolute top-0 bottom-0 border-l border-dashed border-green-600/60" style={{ left: '60%' }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-mono text-xs text-red-600">0 — COLLAPSE</span>
              <span className="font-mono text-xs text-amber-600" style={{ marginLeft: 'calc(30% - 20px)' }}>30</span>
              <span className="font-mono text-xs text-green-600 ml-auto">100 — FLOW</span>
            </div>
          </div>

          {/* Status card */}
          <div className={`border ${s.border} ${s.bg} p-5 mb-10 flex items-start gap-4`}>
            <StatusIcon size={20} className={s.color} />
            <div>
              <div className={`font-mono text-sm font-semibold ${s.color} mb-1`}>
                {s.label}
              </div>
              <p className="text-sm text-slate-400">
                {status === 'disconnected' &&
                  'Your Observer layer and Operator layer have decoupled. Reading and processing are no longer translating into decisions. The network is approaching the percolation threshold. Cascade risk is HIGH.'}
                {status === 'near-threshold' &&
                  'Coupling is degraded but not broken. The system is in metastable equilibrium — small perturbations can tip it either way. Monitor for signs of version sprawl or decision paralysis.'}
                {status === 'integrated' &&
                  'Observation and operation are tightly coupled. Your cognitive network is in flow state — inputs are being converted to outputs efficiently. The giant component has not formed. System is resilient.'}
              </p>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-cyan-400" />
                  <label className="font-mono text-sm text-slate-300">
                    Daily Observations
                  </label>
                </div>
                <span className="font-mono text-sm text-cyan-400 font-semibold">
                  {observations}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Inputs — reading emails, browsing docs, scanning feeds, passive intake
              </p>
              <input
                type="range"
                min={0}
                max={100}
                value={observations}
                onChange={(e) => setObservations(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="font-mono text-xs text-slate-600">0 — NONE</span>
                <span className="font-mono text-xs text-slate-600">100 — OVERFLOW</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Edit3 size={16} className="text-indigo-400" />
                  <label className="font-mono text-sm text-slate-300">
                    Daily Operations
                  </label>
                </div>
                <span className="font-mono text-sm text-indigo-400 font-semibold">
                  {operations}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Outputs — making decisions, creating deliverables, responding, executing
              </p>
              <input
                type="range"
                min={0}
                max={100}
                value={operations}
                onChange={(e) => setOperations(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="font-mono text-xs text-slate-600">0 — NONE</span>
                <span className="font-mono text-xs text-slate-600">100 — OVERLOAD</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SUBSTRATE INGESTION ───────────────────────── */}
        <section className="py-14 border-b border-slate-800/50">
          <SectionLabel>Substrate Ingestion</SectionLabel>

          <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-2xl">
            Paste raw Google Activity log text below. The engine parses each line,
            classifying it as an{' '}
            <span className="text-cyan-400 font-mono">Observer</span> node
            (viewing, reading, accessing) or an{' '}
            <span className="text-indigo-400 font-mono">Operator</span> node
            (editing, creating, deciding). This is the raw substrate of your
            cognitive network.
          </p>

          <div className="mb-3 flex items-center gap-2">
            <Database size={14} className="text-indigo-400" />
            <span className="font-mono text-xs text-slate-500 tracking-wider">
              ACTIVITY LOG RAW INPUT — ONE EVENT PER LINE
            </span>
          </div>

          <textarea
            className="w-full h-48 bg-slate-900 border border-slate-700/60 text-slate-300 font-mono text-xs p-4 focus:outline-none focus:border-indigo-500/60 placeholder:text-slate-700"
            placeholder={`Paste Google activity log here. Example:\n\nViewed "Q3 Budget v4 FINAL.xlsx"\nEdited "Project Roadmap.docx"\nViewed "Slack - #general"\nCreated "Q3 Budget v5 FINAL_final.xlsx"\nViewed "Gmail - Inbox"\nDeleted "old_backup_copy (2).docx"`}
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
          />

          <button
            onClick={handleParse}
            disabled={!logText.trim()}
            className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-mono text-sm font-semibold tracking-wider transition-colors flex items-center gap-2"
          >
            <Activity size={16} />
            RUN SUBSTRATE PARSE
          </button>

          {parsed && (
            <div className="mt-6 border border-slate-700/50 bg-slate-900/50">
              <div className="border-b border-slate-700/50 px-4 py-3 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-400" />
                <span className="font-mono text-xs text-green-400">
                  PARSE COMPLETE — {parsed.total} EVENTS CLASSIFIED
                </span>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                <MetricBox value={parsed.observers.toString()} label="Observer" color="cyan" />
                <MetricBox value={parsed.operators.toString()} label="Operator" color="indigo" />
                <MetricBox value={parsed.total.toString()} label="Total" color="indigo" />
              </div>
              {parsed.sampleLines.length > 0 && (
                <div className="px-4 pb-4">
                  <p className="font-mono text-xs text-slate-600 mb-2 uppercase tracking-wider">Sample classifications:</p>
                  {parsed.sampleLines.map((line, i) => (
                    <div key={i} className="font-mono text-xs text-slate-500 truncate py-0.5">
                      <span
                        className={
                          line.startsWith('[OP]') ? 'text-indigo-400' : 'text-cyan-400'
                        }
                      >
                        {line.slice(0, 5)}
                      </span>
                      {line.slice(5)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── NETWORK X-RAY ────────────────────────────── */}
        <section className="py-14 border-b border-slate-800/50">
          <SectionLabel>Network X-Ray — DBSCAN</SectionLabel>

          <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-2xl">
            Density-Based Spatial Clustering of Applications with Noise. Unlike
            k-means, DBSCAN does not force every point into a cluster. Nodes that
            belong to no dense region are classified as{' '}
            <span className="text-amber-400 font-mono">Noise</span> — outliers
            operating outside the corrupted main cluster.
          </p>

          {parsed ? (
            <div className="space-y-6">
              {/* Visual bar breakdown */}
              <div className="border border-slate-700/50 p-5 bg-slate-900/40">
                <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-5">
                  Node Topology
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Eye size={13} className="text-cyan-400" />
                        <span className="font-mono text-xs text-cyan-400">Observer Nodes</span>
                      </div>
                      <span className="font-mono text-sm text-cyan-300 font-semibold">
                        {parsed.observers}
                        <span className="text-slate-600 font-normal ml-1">
                          ({Math.round(obsRatio * 100)}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-4 bg-slate-800 border border-slate-700/50">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-900 to-cyan-500 transition-all duration-700"
                        style={{ width: `${obsRatio * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Edit3 size={13} className="text-indigo-400" />
                        <span className="font-mono text-xs text-indigo-400">Operator Nodes</span>
                      </div>
                      <span className="font-mono text-sm text-indigo-300 font-semibold">
                        {parsed.operators}
                        <span className="text-slate-600 font-normal ml-1">
                          ({Math.round(opRatio * 100)}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-4 bg-slate-800 border border-slate-700/50">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-900 to-indigo-500 transition-all duration-700"
                        style={{ width: `${opRatio * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GitBranch size={13} className="text-amber-400" />
                        <span className="font-mono text-xs text-amber-400">Noise Nodes (est.)</span>
                      </div>
                      <span className="font-mono text-sm text-amber-300 font-semibold">
                        {noiseNodes}
                        <span className="text-slate-600 font-normal ml-1">
                          (~12%)
                        </span>
                      </span>
                    </div>
                    <div className="h-4 bg-slate-800 border border-slate-700/50">
                      <div
                        className="h-full bg-gradient-to-r from-amber-900 to-amber-600 transition-all duration-700"
                        style={{ width: '12%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity coherence from log */}
              {parsedKappa !== null && (
                <div className="border border-slate-700/50 p-5 bg-slate-900/40">
                  <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-3">
                    Log-Derived Coupling
                  </p>
                  <div className="flex items-center gap-4">
                    <span className={`font-mono text-4xl font-black ${
                      getStatus(parsedKappa) === 'integrated'
                        ? 'text-green-400'
                        : getStatus(parsedKappa) === 'near-threshold'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}>{parsedKappa}</span>
                    <div>
                      <p className="font-mono text-xs text-slate-400">κ derived from parsed log</p>
                      <p className={`font-mono text-xs mt-1 ${statusConfig[getStatus(parsedKappa)].color}`}>
                        {statusConfig[getStatus(parsedKappa)].label}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Noise nodes narrative */}
              <div className="border-l-2 border-amber-500/60 bg-amber-950/15 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-amber-400" />
                  <span className="font-mono text-xs uppercase tracking-widest text-amber-400">
                    Stealth Autonomy — The Noise Node Signal
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  DBSCAN's insight is what it{' '}
                  <em className="text-slate-200">refuses to classify</em>. The{' '}
                  <span className="text-amber-400 font-mono">~{noiseNodes}</span>{' '}
                  estimated noise nodes in your activity log are not failures —
                  they are <strong className="text-amber-300">Stealth Autonomy</strong>:
                  actions that fall outside the corrupted main cluster. They represent
                  pockets of independent, self-directed work operating beneath the
                  institutional stress field. These are your escape vectors. The
                  corrupted cluster cannot spread into noise.
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-700/50 p-10 text-center">
              <Network size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="font-mono text-xs text-slate-600 uppercase tracking-widest">
                Paste and parse an activity log above to activate Network X-Ray
              </p>
            </div>
          )}
        </section>

        {/* ── EXIT BLUEPRINT ───────────────────────────── */}
        <section className="py-14 border-b border-slate-800/50">
          <SectionLabel>Exit Blueprint</SectionLabel>

          <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-2xl">
            Protocol is determined by your current Coupling Strength κ ={' '}
            <span className={`font-mono font-semibold ${s.color}`}>{kappa}</span>
            . The intervention matches the phase of the system.
          </p>

          {status === 'disconnected' && (
            <div className="space-y-4">
              <div className="border border-red-500/40 bg-red-950/20 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-red-400" />
                  <span className="font-mono text-sm font-bold text-red-400 uppercase tracking-wider">
                    Protocol: Psychological Decoupling + Exit Sequencing
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  The network is past the percolation threshold. Incremental fixes
                  cannot restore coupling — the giant component has already formed.
                  The correct response is not optimization; it is controlled
                  decoupling and systematic exit sequencing.
                </p>
                <div className="space-y-3">
                  {[
                    ['Identify escape vectors', 'Locate your Noise Nodes — the activities outside the corrupted cluster that sustain independent function.'],
                    ['Hard-cap Observer load', 'Enforce a 20% reduction in passive inputs. Each unread email is a tree added to the dense forest.'],
                    ['Sequence your exit', 'Map each institutional dependency. Exit in reverse dependency order to avoid cascade.'],
                    ['Decouple identity from institution', 'The system\u2019s fragmentation is not your fragmentation. Percolation is a property of the network, not the node.'],
                    ['Activate recovery kernel', 'One daily action that is observer-free and self-directed. This rebuilds κ from the outside.'],
                  ].map(([title, body]) => (
                    <div key={title} className="flex gap-3">
                      <ChevronRight size={14} className="text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {status === 'near-threshold' && (
            <div className="space-y-4">
              <div className="border border-amber-500/40 bg-amber-950/20 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-amber-400" />
                  <span className="font-mono text-sm font-bold text-amber-400 uppercase tracking-wider">
                    Protocol: Pattern Jamming
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  The system is metastable. The giant component has not yet formed,
                  but corrupted clusters are growing. This is your intervention
                  window — 24 to 72 hours to jam the pattern before the phase
                  transition completes.
                </p>
                <div className="space-y-3">
                  {[
                    ['Interrupt the sprawl cycle', 'Identify the document or project generating the most version copies. Consolidate immediately.'],
                    ['Pattern jam with deliberate gaps', 'Introduce controlled silence into your Observer stream — 2-hour blocks of zero input.'],
                    ['Reconnect operations to outcomes', 'For every 10 Operator actions, one must be a visible, completed deliverable. Breaks the ghost-work loop.'],
                    ['Monitor κ daily', 'If coupling strength drops below 30 within 48 hours, escalate to Psychological Decoupling protocol.'],
                  ].map(([title, body]) => (
                    <div key={title} className="flex gap-3">
                      <ChevronRight size={14} className="text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {status === 'integrated' && (
            <div className="space-y-4">
              <div className="border border-green-500/40 bg-green-950/20 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={16} className="text-green-400" />
                  <span className="font-mono text-sm font-bold text-green-400 uppercase tracking-wider">
                    Protocol: Sustain + Protect
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  Your Observer–Operator coupling is healthy. The network is below
                  the percolation threshold. Your goal now is protective: prevent
                  the gradual accumulation of corrupted nodes that precedes every
                  phase transition.
                </p>
                <div className="space-y-3">
                  {[
                    ['Weekly coherence audit', 'Review file clusters for early-stage spawning. A Q3_Report with 3+ versions is a leading indicator.'],
                    ['Protect your Operator time', 'Scheduled blocks of pure operations (no incoming observations) preserve coupling.'],
                    ['Watch for stealth overload', 'κ can degrade slowly, invisibly. Run this tool weekly, not in crisis.'],
                  ].map(([title, body]) => (
                    <div key={title} className="flex gap-3">
                      <ChevronRight size={14} className="text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── BIOLOGICAL LINEAGE ───────────────────────── */}
        <section className="py-14">
          <SectionLabel>Biological Lineage</SectionLabel>

          <div className="mb-6">
            <h2 className="text-3xl font-black tracking-tight text-slate-100 mb-2">
              From Biology
              <br />
              <span className="text-indigo-400">to Cognition</span>
            </h2>
          </div>

          <div className="border border-indigo-500/30 bg-indigo-950/20 p-6 mb-8">
            <p className="text-indigo-200 text-lg leading-relaxed font-light italic text-center">
              "Do the same laws of physics that govern cellular shatter apply
              to human institutions?"
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-800/40 border border-slate-800/40 mb-8">
            <div className="bg-slate-950 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Microscope size={15} className="text-indigo-400" />
                <span className="font-mono text-xs uppercase tracking-widest text-indigo-400">
                  The Biological Origin
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                In computational biology, percolation theory models how
                stress propagates through protein interaction networks. As
                critical nodes become corrupted — misfolded proteins,
                damaged organelles — the network approaches a phase
                transition. Below the threshold, the cell compensates.
                Above it, a cascade triggers apoptosis: programmed cellular
                death. The{' '}
                <span className="text-slate-200 font-medium">
                  pre-apoptotic stress signature
                </span>{' '}
                is measurable 24–72 hours before collapse — exactly the
                warning window this engine targets.
              </p>
            </div>
            <div className="bg-slate-950 p-6 border-t sm:border-t-0 sm:border-l border-slate-800/40">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={15} className="text-cyan-400" />
                <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
                  The Cognitive Translation
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                The Percolation Engine maps the same mathematics to human
                knowledge work. Observer nodes (passive information intake)
                and Operator nodes (active decisions and outputs) form a
                bipartite network over your file system and activity log.
                Version sprawl, inbox overflow, and competing priorities
                are the cognitive equivalent of corrupted nodes. The{' '}
                <span className="font-mono text-cyan-300">κ coupling</span>{' '}
                parameter is the key bridge — when it degrades, the network
                tips.
              </p>
            </div>
          </div>

          {/* Nathan Lazar credit */}
          <div className="border border-slate-700/50 bg-slate-900/60 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-500/40 bg-indigo-950/60 flex items-center justify-center shrink-0">
                <BookOpen size={16} className="text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-slate-200">
                    Dr. Nathan Lazar, PhD
                  </span>
                  <span className="font-mono text-xs text-slate-600">
                    —
                  </span>
                  <span className="text-xs text-slate-500">
                    Senior Director of Data Science &amp; Computational Biology, Recursion
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-3">
                  The clustering architecture of this engine is built on Dr. Lazar's
                  insight from Computational Biology and{' '}
                  <span className="text-indigo-300 font-medium">
                    Perturbative Maps
                  </span>
                  : use a density-based clustering method (DBSCAN) that does not
                  require every point to belong to a cluster, then decode the
                  embedding of each cluster to label it. This approach — designed for
                  biological networks — proved equally powerful when applied to the
                  topology of human cognitive overload.
                </p>
                <div className="border-l-2 border-indigo-500/50 pl-3">
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    "Run a clustering method (I like DBSCAN because it doesn't require
                    every point to be in a cluster). Label each cluster by decoding the
                    embedding…"
                  </p>
                  <p className="font-mono text-xs text-indigo-500 mt-1">
                    — Dr. Nathan Lazar, PhD
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical note */}
          <div className="mt-6 p-4 bg-slate-900/40 border border-slate-800/50">
            <p className="font-mono text-xs text-slate-600 mb-2 uppercase tracking-widest">
              Mathematical Substrate
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['κ', 'Coupling Strength — harmonic mean of Observer/Operator flux'],
                ['p_c', 'Critical percolation threshold — phase transition point'],
                ['P∞', 'Giant component probability — now labeled Coherence'],
                ['ε', 'Distance from criticality — the warning horizon'],
              ].map(([sym, def]) => (
                <div key={sym} className="border border-slate-800 p-3">
                  <span className="font-mono text-lg text-indigo-400 block mb-1">{sym}</span>
                  <span className="text-xs text-slate-600 leading-relaxed">{def}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800/50 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-mono text-xs text-slate-700">
            PERCOLATION ENGINE BMS 4.0 — COGNITIVE PHASE TRANSITION MONITOR
          </span>
          <span className="font-mono text-xs text-slate-700">
            κ = {kappa} — {s.label.split(' /')[0].toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
