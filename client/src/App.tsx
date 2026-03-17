import React, { useState } from 'react';
import { Upload, FileText, Send, ChevronDown, ChevronUp, Activity, Database, Network, AlertTriangle, CheckCircle } from 'lucide-react';

export default function PercolationEngineApp() {
  const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste');
  const [dataInput, setDataInput] = useState('');
  const [activeDrillDown, setActiveDrillDown] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: dataInput }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleDrillDown = (section: string) => {
    setActiveDrillDown(activeDrillDown === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="border-b border-slate-300 pb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Percolation Engine: Diagnostic Pipeline</h1>
          <p className="text-slate-600 mt-2 text-lg">
            BMS 4.0: Mapping cognitive stress to biological network phase transitions.
          </p>
        </header>

        {/* Results Dashboard (Only shows when results exist) */}
        {results && (
          <section className={`p-6 rounded-xl border-2 ${results.system_status === 'STABLE' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200 shadow-lg'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {results.system_status === 'STABLE' ? <CheckCircle className="text-green-600" /> : <AlertTriangle className="text-red-600 animate-pulse" />}
                System Status: {results.system_status}
              </h2>
              <span className="text-3xl font-black">{results.metrics.percolation_stress_percent}% Stress</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium">
              <div className="bg-white p-3 rounded shadow-sm text-center">
                <div className="text-slate-500">Nodes</div>
                <div className="text-lg">{results.metrics.total_nodes_analyzed}</div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm text-center">
                <div className="text-slate-500">Clusters</div>
                <div className="text-lg">{results.metrics.clusters_identified}</div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm text-center">
                <div className="text-slate-500">Noise</div>
                <div className="text-lg">{results.metrics.noise_nodes_isolated}</div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm text-center">
                <div className="text-slate-500">GCC Size</div>
                <div className="text-lg">{results.metrics.percolation_stress_percent}%</div>
              </div>
            </div>
          </section>
        )}

        {/* Data Ingestion Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Step 1: Ingest Activity Data
          </h2>
          
          <div className="flex gap-4 border-b border-slate-200 mb-6">
            <button className={`pb-2 px-1 font-medium ${inputMode === 'paste' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-50'}`} onClick={() => setInputMode('paste')}>Copy/Paste</button>
            <button className={`pb-2 px-1 font-medium ${inputMode === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`} onClick={() => setInputMode('upload')}>Takeout Upload</button>
          </div>

          {inputMode === 'paste' ? (
            <textarea 
              className="w-full h-32 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Paste your MyActivity text data here..."
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
            />
          ) : (
             <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">Google Takeout JSON Support Coming Soon</p>
             </div>
          )}
          
          <button 
            disabled={isAnalyzing || !dataInput}
            onClick={runAnalysis}
            className="mt-6 w-full py-3 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 disabled:bg-slate-300 transition-colors"
          >
            {isAnalyzing ? "Calculating Phase Transition..." : "Run Diagnostic Pipeline"}
          </button>
        </section>

        {/* Technical Justification Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-600" />
            Methodology & Technical Justification
          </h2>
          <div className="space-y-3">
            <div className="border border-slate-200 rounded-md">
              <button onClick={() => toggleDrillDown('embeddings')} className="w-full flex justify-between p-4 bg-slate-50 hover:bg-slate-100 font-medium">
                <span>1. Vector Embeddings (Semantic Adjacency)</span>
                {activeDrillDown === 'embeddings' ? <ChevronUp /> : <ChevronDown />}
              </button>
              {activeDrillDown === 'embeddings' && <div className="p-4 bg-white text-sm">Translates metadata into high-dimensional vectors to measure "cognitive proximity" via cosine similarity.</div>}
            </div>
            <div className="border border-slate-200 rounded-md">
              <button onClick={() => toggleDrillDown('clustering')} className="w-full flex justify-between p-4 bg-slate-50 hover:bg-slate-100 font-medium">
                <span>2. DBSCAN Clustering (Load Identification)</span>
                {activeDrillDown === 'clustering' ? <ChevronUp /> : <ChevronDown />}
              </button>
              {activeDrillDown === 'clustering' && <div className="p-4 bg-white text-sm">Identifies dense hubs of activity (sprawl) without forcing unrelated tasks into clusters.</div>}
            </div>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="bg-slate-900 text-slate-50 rounded-xl p-8 shadow-md">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">Academic & Peer Review</h2>
            <form action="https://formspree.io/f/mdawpwlj" method="POST" className="text-left space-y-4">
              <input type="text" name="name" placeholder="Name / Affiliation" className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white" required />
              <textarea name="message" placeholder="Observations for Annika..." className="w-full h-32 p-3 rounded bg-slate-800 border border-slate-700 text-white" required />
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex justify-center items-center gap-2">
                <Send className="w-4 h-4" /> Submit Feedback
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
