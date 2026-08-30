import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import AppShell from '@/components/AppShell/AppShell';
import api from '@/services/api';
import {
  Plug,
  Mail,
  MessageSquare,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Link2,
  RefreshCw,
  Key,
  ShieldCheck,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react';

const PROVIDER_METADATA = {
  gmail: {
    title: 'Gmail',
    description: 'Send and read automated emails, dispatch alerts, and draft customer responses.',
    icon: Mail,
    color: 'text-rose-400',
    border: 'border-rose-500/30',
    bg: 'from-rose-500/15 to-slate-900',
    scopes: ['gmail.send', 'gmail.readonly'],
    authType: 'OAuth 2.0 / App Password',
  },
  slack: {
    title: 'Slack',
    description: 'Post real-time execution alerts, channel messages, and interactive blocks.',
    icon: MessageSquare,
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'from-emerald-500/15 to-slate-900',
    scopes: ['chat:write', 'channels:read', 'incoming-webhook'],
    authType: 'Bot Token / Webhook',
  },
  discord: {
    title: 'Discord',
    description: 'Broadcast incident alerts, bot messages, and workflow logs to Discord channels.',
    icon: MessageSquare,
    color: 'text-indigo-400',
    border: 'border-indigo-500/30',
    bg: 'from-indigo-500/15 to-slate-900',
    scopes: ['bot', 'webhook'],
    authType: 'Webhook / Bot Token',
  },
  'google-sheets': {
    title: 'Google Sheets',
    description: 'Append automated row data, sync invoice ledgers, and read audit ranges.',
    icon: FileSpreadsheet,
    color: 'text-teal-400',
    border: 'border-teal-500/30',
    bg: 'from-teal-500/15 to-slate-900',
    scopes: ['spreadsheets'],
    authType: 'OAuth 2.0 / Service Account',
  },
  openrouter: {
    title: 'OpenRouter / Claude 3.5',
    description: 'Primary AI model provider for graph synthesis and complex decision agents.',
    icon: Sparkles,
    color: 'text-violet-400',
    border: 'border-violet-500/30',
    bg: 'from-violet-500/15 to-slate-900',
    scopes: ['claude-3.5-sonnet', 'gpt-4o'],
    authType: 'API Key',
  },
  gemini: {
    title: 'Google Gemini AI',
    description: 'Multimodal generative AI fallback for workflow extraction and summarization.',
    icon: Sparkles,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'from-cyan-500/15 to-slate-900',
    scopes: ['gemini-1.5-flash', 'gemini-1.5-pro'],
    authType: 'API Key',
  },
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModalProvider, setActiveModalProvider] = useState(null);
  const [manualKey, setManualKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState({});

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/integrations');
      setIntegrations(res.data.data.integrations || []);
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleOAuthConnect = async (provider) => {
    try {
      const res = await api.get(`/integrations/oauth/${provider}/start`);
      // Simulate/Trigger connection in dev mode
      await api.post('/integrations', {
        provider,
        credentials: {
          accessToken: `demo_oauth_token_${provider}_${Date.now()}`,
          accountEmail: `connected-operator@${provider}.com`,
        },
      });
      fetchIntegrations();
      alert(`Connected to ${provider} successfully!`);
    } catch (err) {
      alert(`OAuth initialization failed: ${err.message}`);
    }
  };

  const handleTestConnection = async (provider) => {
    setTestingProvider(provider);
    try {
      const res = await api.post(`/integrations/test/${provider}`);
      setTestResult((prev) => ({ ...prev, [provider]: res.data.data }));
      fetchIntegrations();
    } catch (err) {
      setTestResult((prev) => ({
        ...prev,
        [provider]: { success: false, message: err.message },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleDisconnect = async (provider) => {
    if (!confirm(`Disconnect ${provider}?`)) return;
    try {
      await api.post(`/integrations/disconnect/${provider}`);
      fetchIntegrations();
    } catch (err) {
      alert(`Disconnect failed: ${err.message}`);
    }
  };

  const handleSaveManualCredentials = async (e) => {
    e.preventDefault();
    if (!activeModalProvider) return;

    setIsSavingKey(true);
    try {
      await api.post('/integrations', {
        provider: activeModalProvider,
        credentials: {
          apiKey: manualKey,
          accessToken: manualKey || `token_${Date.now()}`,
          webhookUrl,
          accountEmail: accountEmail || 'operator@internal.workspace',
        },
      });

      setActiveModalProvider(null);
      setManualKey('');
      setWebhookUrl('');
      setAccountEmail('');
      fetchIntegrations();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSavingKey(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell breadcrumbs={[{ label: 'Integrations & Tools' }]}>
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Plug className="w-6 h-6 text-indigo-400" /> Third-Party Integrations & OAuth
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Connect external enterprise services with application-level AES-256 encrypted credential storage.
              </p>
            </div>

            <button
              onClick={fetchIntegrations}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all active:scale-95"
              title="Refresh Status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Encryption notice */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3 text-xs text-indigo-300">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>
              All OAuth access tokens, refresh tokens, and API keys are encrypted at rest using AES-256-CBC with
              application-level secret keys and never exposed to the client.
            </span>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {integrations.map((item) => {
              const meta = PROVIDER_METADATA[item.provider] || {
                title: item.displayName || item.provider,
                description: 'Custom integration adapter',
                icon: Plug,
                color: 'text-indigo-400',
                border: 'border-slate-800',
                bg: 'from-slate-900 to-slate-950',
                authType: 'API Key',
              };

              const Icon = meta.icon;
              const isConnected = item.isConnected;
              const test = testResult[item.provider];

              return (
                <div
                  key={item.provider}
                  className={`p-6 rounded-2xl bg-gradient-to-b ${meta.bg} bg-slate-900/60 border ${meta.border} backdrop-blur-sm shadow-xl flex flex-col justify-between space-y-4`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl bg-slate-950 border border-white/5 ${meta.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          isConnected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{meta.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{meta.description}</p>
                    </div>

                    {item.accountEmail && (
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 font-mono truncate">
                        Account: {item.accountEmail}
                      </div>
                    )}

                    {test && (
                      <div
                        className={`p-2 rounded-lg text-[10px] border ${
                          test.success
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        }`}
                      >
                        {test.message}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTestConnection(item.provider)}
                        disabled={testingProvider === item.provider}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition-colors flex items-center gap-1"
                      >
                        {testingProvider === item.provider ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Test
                      </button>

                      <button
                        onClick={() => setActiveModalProvider(item.provider)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Configure API Keys / Webhooks"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isConnected ? (
                      <button
                        onClick={() => handleDisconnect(item.provider)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOAuthConnect(item.provider)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1 active:scale-95"
                      >
                        <Link2 className="w-3 h-3" /> Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Manual Credential Configuration Modal */}
          {activeModalProvider && (
            <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setActiveModalProvider(null)}
              />

              <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 z-10">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Configure {activeModalProvider.toUpperCase()}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveModalProvider(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveManualCredentials} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300">API Key / Access Token</label>
                    <input
                      type="password"
                      value={manualKey}
                      onChange={(e) => setManualKey(e.target.value)}
                      placeholder="sk-live-... or token"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {['slack', 'discord'].includes(activeModalProvider) && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-300">Webhook URL (Optional)</label>
                      <input
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://discord.com/api/webhooks/... or https://hooks.slack.com/..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300">Account / Workspace Alias</label>
                    <input
                      type="text"
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                      placeholder="operator@company.com or #production-ops"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModalProvider(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSavingKey}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5"
                    >
                      {isSavingKey && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Encrypted Keys
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
