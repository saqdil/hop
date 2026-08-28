import React, { useState } from 'react';
import { ClipboardItem, ClipboardCategory } from '../types/transfer';
import { PeerDevice } from '../types/peer';
import { Clipboard, Send, Pin, Trash2, Copy, Check, Link, Key, Code, Sparkles, Smartphone, Laptop } from 'lucide-react';
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
  const [activeCategory, setActiveCategory] = useState<ClipboardCategory | 'all'>('all');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddClipboardItem(inputText);
    setInputText('');
  };

  const handleCopy = (item: ClipboardItem) => {
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (category: ClipboardCategory) => {
    switch (category) {
      case 'url':
        return Link;
      case 'otp':
        return Key;
      case 'code':
        return Code;
      default:
        return Clipboard;
    }
  };

  const getDeviceIcon = (platform: PeerDevice['platform']) => {
    switch (platform) {
      case 'ios':
      case 'android':
        return Smartphone;
      default:
        return Laptop;
    }
  };

  const filtered = clipboardItems.filter((i) => {
    if (activeCategory === 'all') return true;
    return i.category === activeCategory;
  });

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="apple-card rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 shadow-sm text-white">
            <Clipboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2 font-sans">
              Universal Cross-Device Clipboard
              <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-white/[0.08] text-zinc-300 border border-white/10">
                {clipboardItems.length} items
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Copy on your PC, Mac, iPhone, or Android and it appears here in real time.
            </p>
          </div>
        </div>

        {/* Auto Sync Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAutoSync}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
              autoSyncEnabled
                ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300 shadow-sm'
                : 'bg-black/30 border-white/[0.08] text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Mirror: {autoSyncEnabled ? 'ACTIVE' : 'PAUSED'}</span>
          </button>

          {clipboardItems.length > 0 && (
            <button
              onClick={onClearAll}
              className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-white/[0.08] transition-colors"
              title="Clear vault history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Input Blast Form */}
      <form onSubmit={handleSend} className="apple-card rounded-2xl p-3 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or paste text, URLs, OTP codes, or code snippets to hop to all devices..."
          className="flex-1 h-10 px-3.5 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-zinc-500 font-mono text-xs focus:outline-none focus:border-white/30"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="h-10 px-5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-sans font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Hop to LAN</span>
        </button>
      </form>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
        {[
          { id: 'all', label: 'All Snippets' },
          { id: 'url', label: 'Links (URLs)' },
          { id: 'otp', label: 'OTP & 2FA Codes' },
          { id: 'code', label: 'Code Snippets' },
          { id: 'text', label: 'Plain Text' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 ${
              activeCategory === tab.id
                ? 'bg-white/15 text-white font-semibold border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 bg-black/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Clipboard Items Stream */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="apple-card rounded-2xl p-10 text-center space-y-2">
            <Clipboard className="w-8 h-8 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white font-sans">No Clipboard History Yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Whenever you copy text on your phone or PC, Hop synchronizes it here instantly.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((item) => {
              const CategoryIcon = getCategoryIcon(item.category);
              const DeviceIcon = getDeviceIcon(item.sourceDevice.platform);
              const isCopied = copiedId === item.id;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`apple-card apple-card-hover rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.isPinned ? 'border-l-4 border-l-sky-400' : ''
                  }`}
                >
                  {/* Left: Device Info & Text Content */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                      <span className="flex items-center gap-1 text-zinc-300 font-medium">
                        <DeviceIcon className="w-3 h-3 text-sky-400" />
                        {item.sourceDevice.name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 uppercase text-zinc-500">
                        <CategoryIcon className="w-3 h-3" />
                        {item.category}
                      </span>
                      <span>•</span>
                      <span className="text-zinc-500">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-zinc-100 break-all select-all bg-black/30 p-2.5 rounded-xl border border-white/[0.06]">
                      {item.text}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center font-mono text-xs">
                    <button
                      onClick={() => handleCopy(item)}
                      className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98] ${
                        isCopied
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white hover:bg-zinc-100 text-zinc-950'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => onTogglePin(item.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        item.isPinned
                          ? 'text-sky-400 bg-sky-500/10'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.08]'
                      }`}
                      title={item.isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-white/[0.08] transition-colors"
                      title="Delete from vault"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
