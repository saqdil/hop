import React, { useState } from 'react';
import { ClipboardItem } from '../types/transfer';
import { Copy, Check, Pin, Trash2, Send, Laptop, Smartphone, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  clipboardItems: ClipboardItem[];
  onAddClipboardItem: (text: string) => void;
  onTogglePin: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  autoSyncEnabled: boolean;
  onToggleAutoSync: () => void;
}

export const ClipboardSync: React.FC<Props> = ({
  clipboardItems,
  onAddClipboardItem,
  onTogglePin,
  onDeleteItem,
  onClearAll,
  autoSyncEnabled,
  onToggleAutoSync,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (item: ClipboardItem) => {
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddClipboardItem(inputText);
    setInputText('');
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header & Toggle */}
      <div className="rounded-2xl bg-[#121214] border border-white/[0.08] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Shared Clipboard</h2>
          <p className="text-xs text-zinc-400">
            Text and snippets copied on any connected device mirror here automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAutoSync}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              autoSyncEnabled
                ? 'bg-zinc-800 text-white border-white/20'
                : 'bg-zinc-900 text-zinc-500 border-white/[0.06]'
            }`}
          >
            <span>Auto Copy: {autoSyncEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {clipboardItems.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors border border-white/[0.06]"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="space-y-2">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste text to broadcast to connected devices..."
            rows={3}
            className="w-full p-4 rounded-2xl bg-[#121214] border border-white/[0.08] text-white font-mono text-xs focus:outline-none focus:border-white/30"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2 rounded-lg bg-white text-zinc-950 font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to Devices</span>
          </button>
        </div>
      </form>

      {/* History List */}
      <div className="space-y-2.5">
        {clipboardItems.length === 0 ? (
          <div className="rounded-2xl bg-[#121214] border border-white/[0.08] p-10 text-center text-xs text-zinc-500 font-mono">
            No clipboard history yet. Copy or send text above.
          </div>
        ) : (
          <AnimatePresence>
            {clipboardItems.map((item) => {
              const isCopied = copiedId === item.id;
              const DeviceIcon = item.sourceDevice.platform === 'ios' || item.sourceDevice.platform === 'android' ? Smartphone : Laptop;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="rounded-xl bg-[#121214] border border-white/[0.08] p-4 space-y-2.5 font-mono text-xs"
                >
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <DeviceIcon className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{item.sourceDevice.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.isSensitive && (
                        <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 text-[10px] flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Sensitive
                        </span>
                      )}
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="bg-black/50 p-3 rounded-lg border border-white/[0.06] text-zinc-200 break-all select-all font-mono">
                    {item.text}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onTogglePin(item.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.isPinned ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                      title={item.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleCopy(item)}
                        className={`px-3 py-1.5 rounded-lg font-sans font-medium text-xs flex items-center gap-1.5 transition-colors ${
                          isCopied ? 'bg-zinc-800 text-emerald-400' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
