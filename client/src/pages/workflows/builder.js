import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import AppShell from '@/components/AppShell/AppShell';
import WorkflowCanvas from '@/components/WorkflowCanvas/WorkflowCanvas';
import api from '@/services/api';
import {
  Sparkles,
  Play,
  Save,
  ArrowRight,
  Loader2,
  Wand2,
  RefreshCw,
  Cpu,
  Layers,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

const SAMPLE_PROMPTS = [
  {
    title: 'Hostel Maintenance',
    prompt: 'A student reports poor water supply in the hostel. Route it to maintenance, assign priority, update the student on progress, and escalate if unresolved in 48 hours.',
  },
  {
    title: 'Classroom Issue',
    prompt: 'A classroom projector is not working. Log the complaint, assign it to the ICT department, and track repair updates until resolved.',
  },
  {
    title: 'Campus Wi-Fi Problem',
    prompt: 'Wi-Fi drops frequently in the library. Open the complaint, classify it as infrastructure, assign the IT team, and update status as work progresses.',
  },
];

export default function AIWorkflowBuilderPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [engineUsed, setEngineUsed] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (targetPrompt) => {
    const activePrompt = targetPrompt || prompt;
    if (!activePrompt || activePrompt.trim() === '') {
      setError('Please describe the complaint or issue to log.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    try {
      const res = await api.post('/workflows/generate', { prompt: activePrompt });
      const wf = res.data.data.workflow;
      setGeneratedWorkflow(wf);
      setNodes(wf.nodes || []);
      setEdges(wf.edges || []);
      setEngineUsed(wf.engine || 'AI Multi-Agent Engine');
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndOpen = async () => {
    if (!generatedWorkflow) return;
    setIsSaving(true);
    try {
      const res = await api.post('/workflows', {
        name: generatedWorkflow.name,
        description: generatedWorkflow.description,
        status: 'active',
        triggerConfig: generatedWorkflow.triggerConfig,
        tags: generatedWorkflow.tags,
        nodes,
        edges,
      });

      const newId = res.data.data.workflow._id;
      router.push(`/workflows/${newId}`);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell breadcrumbs={[{ label: 'Workflows', href: '/workflows' }, { label: 'AI Builder Studio' }]}>
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-[#090d16]">
          {/* Top Bar */}
          <div className="h-14 border-b border-slate-800 bg-slate-950/70 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Complaint Intake Form
                </h1>
                {engineUsed && (
                  <span className="text-[10px] text-emerald-400 font-mono">Engine: {engineUsed}</span>
                )}
              </div>
            </div>

            {generatedWorkflow && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveAndOpen}
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save to Canvas Editor &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Builder Body Split */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Prompt Input Panel */}
            <div className="w-96 bg-slate-950/90 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0 overflow-y-auto space-y-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">Describe the Issue</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Add the complaint details, issue type, urgency, and the department that should handle it.
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <textarea
                    rows={5}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Hostel Wi-Fi is failing in Block C, urgent fix needed, assign to IT support..."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none shadow-inner"
                  />

                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                    className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Logging complaint...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" /> Submit Complaint
                      </>
                    )}
                  </button>
                </div>

                {/* Sample Prompts */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Quick Sample Complaints:
                  </span>
                  <div className="space-y-2">
                    {SAMPLE_PROMPTS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPrompt(item.prompt);
                          handleGenerate(item.prompt);
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all group"
                      >
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{item.prompt}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Multi-agent engine badge */}
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Campus issue routing
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Routes issues to the relevant department and keeps status updates visible to students and staff.
                </p>
              </div>
            </div>

            {/* Right Graph Canvas Preview */}
            <div className="flex-1 relative bg-[#090d16] flex flex-col">
              {nodes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl">
                    <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-300">Awaiting complaint details</h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Describe the issue on the left or choose a common campus complaint to begin processing it.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  {/* Generated Workflow Info Header Overlay */}
                  <div className="absolute top-4 left-4 z-10 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-2xl space-y-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Complaint Draft
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate">{generatedWorkflow?.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{generatedWorkflow?.description}</p>
                  </div>

                  <WorkflowCanvas
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={() => {}}
                    onEdgesChange={() => {}}
                    readOnly={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
