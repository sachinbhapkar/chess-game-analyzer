import React, { useState } from 'react';
import { X, Cpu, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, RefreshCw, Sparkles, Terminal } from 'lucide-react';
import type { EngineInfo } from '../types/chess';

interface EngineSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  engines: EngineInfo[];
  selectedEngineId: string;
  onSelectEngine: (engineId: string) => void;
  onRefreshEngines?: () => Promise<void>;
}

export const EngineSelectorModal: React.FC<EngineSelectorModalProps> = ({
  isOpen,
  onClose,
  engines,
  selectedEngineId,
  onSelectEngine,
  onRefreshEngines,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastCopiedText, setLastCopiedText] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, id: string) => {
    let success = false;

    // Strategy 1: Modern Async Clipboard API
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch (err) {
        console.warn('Async clipboard write failed, trying execCommand fallback', err);
      }
    }

    // Strategy 2: Hidden textarea fallback for non-secure contexts or restricted webviews
    if (!success) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (err) {
        console.error('execCommand copy fallback failed', err);
      }
    }

    if (success) {
      setCopiedId(id);
      setLastCopiedText(text);
      setTimeout(() => setCopiedId(null), 3000);
      setTimeout(() => setLastCopiedText(null), 5000);
    } else {
      // In case both browser APIs were blocked by permissions, prompt the user with prompt()
      window.prompt('Copy installation command (Press Cmd+C):', text);
    }
  };

  const handleRefresh = async () => {
    if (!onRefreshEngines) return;
    setIsRefreshing(true);
    try {
      await onRefreshEngines();
    } finally {
      setIsRefreshing(false);
    }
  };

  const selectedEngine = engines.find((e) => e.id === selectedEngineId) || engines[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-[#262421] border border-[#3d3b38] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#3d3b38] bg-[#1e1c19]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#81b64c]/20 border border-[#81b64c]/40 text-[#81b64c] flex items-center justify-center shadow">
              <Cpu size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Select Chess Engine</span>
                <span className="text-[10px] font-mono uppercase bg-[#81b64c]/15 text-[#81b64c] px-2 py-0.5 rounded-full border border-[#81b64c]/30 font-bold">
                  Open-Source
                </span>
              </h2>
              <p className="text-xs text-[#a09e9a]">
                Choose your analysis engine: World-class NNUE or deep neural network (MCTS)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRefreshEngines && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Scan system for newly installed engines"
                className="chess-btn-secondary p-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Detect</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-[#8b8987] hover:text-white rounded-lg hover:bg-[#302e2b] transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Dynamic Copied Notification Toast */}
        {lastCopiedText && (
          <div className="bg-[#81b64c]/20 border-b border-[#81b64c]/40 px-5 py-2.5 flex items-center justify-between text-xs text-[#81b64c] animate-in fade-in">
            <div className="flex items-center gap-2 overflow-hidden">
              <Check size={14} className="shrink-0 text-[#81b64c]" />
              <span className="font-bold shrink-0 text-white">Copied Command:</span>
              <code className="bg-[#1e1c19] px-2 py-0.5 rounded text-[#e2e1e0] font-mono truncate text-[11px] border border-[#3d3b38]">
                {lastCopiedText}
              </code>
            </div>
            <span className="text-[10px] text-[#8b8987] shrink-0 ml-2 hidden sm:inline">Paste in Terminal</span>
          </div>
        )}

        {/* Active Engine Summary Banner */}
        {selectedEngine && (
          <div className="bg-[#1e1c19]/60 px-5 py-3 border-b border-[#3d3b38] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8b8987]">Active Engine:</span>
              <span className="text-xs font-black text-white">{selectedEngine.name}</span>
              <span className="text-[10px] font-mono font-bold bg-[#81b64c]/20 text-[#81b64c] px-2 py-0.5 rounded">
                {selectedEngine.rating}
              </span>
              <span className="text-[10px] text-[#a09e9a] hidden sm:inline">({selectedEngine.type})</span>
            </div>

            <span className="text-[11px] text-[#81b64c] flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#81b64c] animate-pulse" />
              Engine ready for Game Review
            </span>
          </div>
        )}

        {/* Engine List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {engines.map((engine) => {
            const isSelected = engine.id === selectedEngineId;
            const isAvailable = engine.available;

            return (
              <div
                key={engine.id}
                onClick={() => {
                  if (isAvailable) {
                    onSelectEngine(engine.id);
                  }
                }}
                className={`p-4 rounded-xl border transition relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isAvailable
                    ? isSelected
                      ? 'bg-[#81b64c]/10 border-[#81b64c] shadow-md ring-1 ring-[#81b64c]/50 cursor-pointer'
                      : 'bg-[#1e1c19] border-[#3d3b38] hover:border-[#524f4b] hover:bg-[#22201d] cursor-pointer'
                    : 'bg-[#1a1917] border-[#33312e] opacity-90'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  {/* Selection Radio / Status Icon */}
                  <div className="pt-0.5">
                    {isAvailable ? (
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                          isSelected
                            ? 'border-[#81b64c] bg-[#81b64c] text-white'
                            : 'border-[#524f4b] bg-transparent'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-[#44423e] flex items-center justify-center text-[#666460]">
                        <AlertCircle size={12} />
                      </div>
                    )}
                  </div>

                  {/* Engine Details */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-black text-white">{engine.name}</h4>

                      {/* ELO Rating Badge */}
                      <span className="text-[10px] font-mono font-bold bg-[#302e2b] text-[#f0c15c] px-2 py-0.5 rounded border border-[#3d3b38]">
                        {engine.rating}
                      </span>

                      {/* Engine Architecture Tag */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          engine.type.includes('Neural')
                            ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                            : engine.type.includes('Multi')
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                            : 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                        }`}
                      >
                        {engine.type}
                      </span>

                      {/* Availability status badge */}
                      {isAvailable ? (
                        <span className="text-[10px] font-bold text-[#81b64c] flex items-center gap-1 bg-[#81b64c]/10 px-1.5 py-0.5 rounded">
                          <CheckCircle2 size={11} />
                          Installed & Ready
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#8b8987] bg-[#2a2825] px-1.5 py-0.5 rounded border border-[#383632]">
                          Not Installed
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#a09e9a] leading-relaxed">{engine.description}</p>

                    <div className="flex items-center gap-3 pt-0.5 text-[11px] text-[#6d6b68]">
                      <span>Author: {engine.author}</span>
                      {engine.projectUrl && (
                        <a
                          href={engine.projectUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#81b64c] hover:underline flex items-center gap-0.5"
                        >
                          <span>Website</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action: Choose button or Copy Install Command */}
                <div className="sm:self-center shrink-0">
                  {isAvailable ? (
                    <button
                      onClick={() => onSelectEngine(engine.id)}
                      className={`w-full sm:w-auto px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#81b64c] text-white shadow'
                          : 'chess-btn-secondary'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Select'}
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                      {engine.installCommand && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(engine.installCommand!, engine.id);
                          }}
                          title={`Click to copy: ${engine.installCommand}`}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 border transition cursor-pointer active:scale-95 ${
                            copiedId === engine.id
                              ? 'bg-[#81b64c] text-white border-[#81b64c] font-bold shadow'
                              : 'bg-[#2d2b28] hover:bg-[#383632] text-[#e2e1e0] border-[#44423e]'
                          }`}
                        >
                          {copiedId === engine.id ? (
                            <>
                              <Check size={13} className="text-white" />
                              <span className="font-sans font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Terminal size={12} className="text-[#81b64c]" />
                              <Copy size={12} />
                              <span className="font-sans font-semibold">Copy Command</span>
                            </>
                          )}
                        </button>
                      )}

                      {engine.projectUrl && (
                        <a
                          href={engine.projectUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1.5 rounded-lg bg-[#1e1c19] hover:bg-[#2c2a27] text-[#8b8987] hover:text-white text-xs flex items-center justify-center gap-1 border border-[#3d3b38] transition"
                          title="Open release page"
                        >
                          <ExternalLink size={12} />
                          <span className="font-sans">Release</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#3d3b38] bg-[#1e1c19] flex items-center justify-between text-xs text-[#8b8987]">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#81b64c]" />
            <span>All engines communicate via the universal UCI protocol.</span>
          </div>

          <button
            onClick={onClose}
            className="chess-btn-green px-5 py-2 rounded-lg font-bold text-xs cursor-pointer shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
