'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, Smartphone, Monitor, Globe, Check, Radio, Activity, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  BackendConfig,
  BackendType,
  getStoredBackendConfig,
  saveBackendConfig,
  resolveWebSocketUrl,
  testBackendConnection,
  DEFAULT_RENDER_URL,
} from '@/lib/backendConfig';

interface BackendSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode?: string;
  onConfigChanged?: (config: BackendConfig) => void;
}

export const BackendSelectorModal: React.FC<BackendSelectorModalProps> = ({
  isOpen,
  onClose,
  roomCode = 'TEST',
  onConfigChanged,
}) => {
  const [config, setConfig] = useState<BackendConfig>({ type: 'render', customUrl: DEFAULT_RENDER_URL });
  const [testResult, setTestResult] = useState<{
    testing: boolean;
    success?: boolean;
    latencyMs?: number;
    error?: string;
  }>({ testing: false });

  useEffect(() => {
    if (isOpen) {
      const current = getStoredBackendConfig();
      setConfig(current);
      setTestResult({ testing: false });
    }
  }, [isOpen]);

  const handleSelectType = (type: BackendType) => {
    let url = config.customUrl;
    if (type === 'render' && !url) url = DEFAULT_RENDER_URL;
    if (type === 'termux' && !url) url = '192.168.1.100:8765';
    setConfig({ type, customUrl: url });
    setTestResult({ testing: false });
  };

  const handleTest = async () => {
    const wsUrl = resolveWebSocketUrl(config, roomCode);
    setTestResult({ testing: true });
    const result = await testBackendConnection(wsUrl);
    setTestResult({
      testing: false,
      success: result.success,
      latencyMs: result.latencyMs,
      error: result.error,
    });
  };

  const handleSave = () => {
    saveBackendConfig(config);
    if (onConfigChanged) {
      onConfigChanged(config);
    }
    onClose();
  };

  const presets: Array<{
    type: BackendType;
    icon: React.ReactNode;
    title: string;
    badge: string;
    desc: string;
  }> = [
    {
      type: 'render',
      icon: <Cloud size={20} className="text-sky-400" />,
      title: 'Render.com Cloud Relay',
      badge: 'Recommended for Global Sync',
      desc: 'Free cloud hosting with automatic SSL (wss://). Seamlessly connects to GitHub Pages.',
    },
    {
      type: 'termux',
      icon: <Smartphone size={20} className="text-mint" />,
      title: 'Termux (Android Phone)',
      badge: 'Mobile Hosted',
      desc: 'Run backend on your phone using termux-start.sh. Connect via local WiFi IP or Cloudflare tunnel.',
    },
    {
      type: 'localhost',
      icon: <Monitor size={20} className="text-gold" />,
      title: 'PC / Localhost',
      badge: 'Local Testing',
      desc: 'Connect to livedrive or ld running on your computer at ws://localhost:8765.',
    },
    {
      type: 'mesh',
      icon: <Globe size={20} className="text-purple-400" />,
      title: 'Public Mesh Relay',
      badge: 'Zero Setup',
      desc: 'Public signaling network (SocketsBay). No backend installation required.',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Backend Relay Connection Manager" maxWidth="max-w-xl">
      <div className="space-y-4">
        <p className="text-xs text-cream-muted leading-relaxed">
          The GitHub Pages UI can connect to any LiveDRIVE backend running on Render, Termux, your PC, or free public mesh relays.
        </p>

        {/* Preset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presets.map((p) => {
            const isSelected = config.type === p.type;
            return (
              <div
                key={p.type}
                onClick={() => handleSelectType(p.type)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gold/15 border-gold shadow-[0_0_15px_rgba(242,193,46,0.2)] ring-1 ring-gold/40'
                    : 'bg-bg-card/70 border-white/10 hover:border-white/20 hover:bg-bg-elevated'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/5">{p.icon}</div>
                      <span className="text-xs font-bold font-display text-cream">{p.title}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-gold" />}
                  </div>
                  <p className="text-[11px] text-cream-muted leading-relaxed mb-2">{p.desc}</p>
                </div>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-cream-darker">
                  {p.badge}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Inputs based on type */}
        {config.type === 'render' && (
          <div className="p-3.5 rounded-xl bg-bg-card border border-white/10 space-y-2">
            <label className="block text-xs font-semibold text-cream">
              Render Application URL:
            </label>
            <Input
              value={config.customUrl || ''}
              placeholder="https://your-livedrive.onrender.com"
              onChange={(e) => setConfig({ ...config, customUrl: e.target.value })}
            />
            <p className="text-[11px] text-cream-darker">
              Default is community instance or your own free Render deployment. Automatically formats to WebSocket endpoint.
            </p>
          </div>
        )}

        {config.type === 'termux' && (
          <div className="p-3.5 rounded-xl bg-bg-card border border-white/10 space-y-2">
            <label className="block text-xs font-semibold text-cream">
              Termux IP or Tunnel Address:
            </label>
            <Input
              value={config.customUrl || ''}
              placeholder="e.g. 192.168.1.50:8765 or https://xyz.trycloudflare.com"
              onChange={(e) => setConfig({ ...config, customUrl: e.target.value })}
            />
            <p className="text-[11px] text-cream-darker">
              Run <code className="text-gold font-mono">./termux-start.sh</code> in Termux to get your phone's exact IP or tunnel URL.
            </p>
          </div>
        )}

        {/* Resolved Target URL Preview */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-bg-subtle border border-white/5 text-[11px] font-mono text-cream-darker">
          <span className="truncate max-w-[320px] sm:max-w-[380px]">
            Target: <span className="text-gold">{resolveWebSocketUrl(config, roomCode)}</span>
          </span>
          <button
            onClick={handleTest}
            disabled={testResult.testing}
            className="flex items-center gap-1 text-cream hover:text-gold transition-colors font-sans text-xs px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 ml-2 whitespace-nowrap"
          >
            <RefreshCw size={12} className={testResult.testing ? 'animate-spin' : ''} />
            <span>{testResult.testing ? 'Pinging...' : 'Test Ping'}</span>
          </button>
        </div>

        {/* Test Result Display */}
        {testResult.success !== undefined && (
          <div
            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
              testResult.success
                ? 'bg-mint/10 border-mint/30 text-mint'
                : 'bg-crimson/10 border-crimson/30 text-crimson'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity size={14} />
              <span>
                {testResult.success
                  ? `Connected successfully! Latency: ${testResult.latencyMs}ms`
                  : `Connection Failed: ${testResult.error || 'Server unreachable'}`}
              </span>
            </div>
            {testResult.success && <span className="text-[10px] font-bold uppercase">Ready</span>}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
          <Button variant="subtle" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" size="sm" onClick={handleSave}>
            Save & Connect
          </Button>
        </div>
      </div>
    </Modal>
  );
};
