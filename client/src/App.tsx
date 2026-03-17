import React, { useState } from 'react';
import { Upload, FileText, Send, ChevronDown, ChevronUp, Activity, Database, Network } from 'lucide-react';

export default function PercolationEngineApp() {
  const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste');
  const [dataInput, setDataInput] = useState('');
  const [activeDrillDown, setActiveDrillDown] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

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
            A working prototype demonstrating the mathematical coupling of metadata to detect cognitive collapse via network phase transitions.
          </p>
        </header>

        {/* Data Ingestion Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Step 1: Ingest Activity Data
          </h2>
          
          <div className="flex gap-4 border-b border-slate-200 mb-6">
            <button 
              className={`pb-2 px-1 font-medium ${inputMode === 'paste' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
              onClick={() => setInputMode('paste')}
            >
              Copy/Paste MyActivity
            </button>
            <button 
              className={`pb-2 px-1 font-medium ${inputMode === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
              onClick={() => setInputMode('upload')}
            >
              Google Takeout Upload
            </button>
          </div>

          {inputMode === 'paste' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm">
                <strong>Instructions:</strong> Navigate to your Google "My Activity" dashboard. Highlight the text covering the date range you wish to analyze (including timestamps and file names), copy it, and paste it directly below.
              </div>
              <textarea 
                className="w-full h-32 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Paste your MyActivity text data here..."
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm">
                <strong>Instructions:</strong> Go to Google Takeout. Deselect all, then select only "Drive". Choose JSON as the export format. Once downloaded and extracted, upload the resulting metadata file here.
              </div>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">Click to browse or drag and drop your Takeout JSON file</p>
                <input type="file" className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="mt-4 inline-block px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded cursor-pointer transition-colors">
                  Select File
                </label>
              </div>
            </div>
          )}
          
          <button className="mt-6 w-full py-3 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors">
            Run Diagnostic Pipeline
          </button>
        </section>

        {/* Academic Drill-Down Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-600" />
            Methodology & Technical Justification
          </h2>
          <p className="text-slate-600 mb-6 text-sm">
            Expand the modules below to review the specific mathematical and computational frameworks utilized in this pipeline.
          </p>

          <div className="space-y-3">
            {/* Drill-down 1 */}
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <button 
                onClick={() => toggleDrillDown('embeddings')}
                className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left font-medium"
              >
                <span>1. Vector Embeddings (Semantic Adjacency)</span>
                {activeDrillDown === 'embeddings' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {activeDrillDown === 'embeddings' && (
                <div className="p-4 bg-white text-slate-700 text-sm leading-relaxed border-t border-slate-200">
                  <p><strong>Method:</strong> Drive document metadata (titles, folder paths, timestamps) are encoded into high-dimensional vectors.</p>
                  <p className="mt-2"><strong>Justification:</strong> Rather than relying on rigid folder structures, cosine similarity between vectors reveals the actual "cognitive proximity" of files. This allows us to map the invisible edges of the user's workload, simulating the cognitive load required to context-switch between disparate nodes.</p>
                </div>
              )}
            </div>

            {/* Drill-down 2 */}
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <button 
                onClick={() => toggleDrillDown('clustering')}
                className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left font-medium"
              >
                <span>2. DBSCAN Clustering (Load Identification)</span>
                {activeDrillDown === 'clustering' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {activeDrillDown === 'clustering' && (
                <div className="p-4 bg-white text-slate-700 text-sm leading-relaxed border-t border-slate-200">
                  <p><strong>Method:</strong> Density-Based Spatial Clustering of Applications with Noise (DBSCAN) is applied to the vectorized document embeddings.</p>
                  <p className="mt-2"><strong>Justification:</strong> Unlike K-Means, DBSCAN does not require every file to belong to a cluster. This is crucial for isolating "paralysis events"—we are looking for extreme density (version sprawl, hyper-focus) surrounded by noise (abandoned threads). Clusters are then assigned AI-generated keywords to categorize the specific cognitive stressor.</p>
                </div>
              )}
            </div>

            {/* Drill-down 3 */}
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <button 
                onClick={() => toggleDrillDown('percolation')}
                className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left font-medium"
              >
                <span>3. Percolation Theory (Phase Transitions)</span>
                {activeDrillDown === 'percolation' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {activeDrillDown === 'percolation' && (
                <div className="p-4 bg-white text-slate-700 text-sm leading-relaxed border-t border-slate-200">
                  <p><strong>Method:</strong> Treating clusters as a biological network, "Stress" (calculated via edit frequency and temporal proximity) acts as the percolation parameter (p).</p>
                  <p className="mt-2"><strong>Justification:</strong> As stress increases, isolated cognitive tasks (nodes) suddenly merge into a giant connected component. When this global coupling occurs, the cognitive system undergoes a phase transition from "navigable" to "paralyzed." The UI tracks this transition to provide a 24-72 hour early warning system.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="bg-slate-900 text-slate-50 rounded-xl p-6 md:p-8 shadow-md">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">Academic & Peer Review</h2>
            <p className="text-slate-300 mb-6">
              This framework is actively in development. If you are reviewing this prototype, your critical feedback on the modeling parameters, edge definitions, or clustering logic is highly valued.
            </p>
            
            {/* REPLACE "YOUR_FORMSPREE_ENDPOINT" WITH YOUR ACTUAL URL FROM FORMSPREE */}
            <form action="YOUR_FORMSPREE_ENDPOINT" method="POST" className="text-left space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Your Name / Affiliation</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., Network Biology Lab"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Feedback / Observations</label>
                <textarea 
                  name="message"
                  required
                  className="w-full h-32 p-3 rounded bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Your thoughts on the percolation framing, DBSCAN utility, etc..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
              {/* This hidden field tells Formspree where to send it */}
              <input type="hidden" name="_replyto" value="erikssona@icloud.com" />
              
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex justify-center items-center gap-2 transition-colors">
                <Send className="w-4 h-4" />
                Submit Feedback to Annika
              </button>
            </form>
          </div>
        </section>

      </div>
    </div>
  );
}
