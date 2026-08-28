import React, { useState, useRef } from 'react';
import { PeerDevice } from '../../types/peer';
import { FileItem, ClipboardItem } from '../../types/transfer';
import { Smartphone, Laptop, Radio, Camera, UploadCloud, Clipboard, Send, Copy, Check, Sparkles, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  selfDevice: PeerDevice;
  targetDesktop: PeerDevice;
  clipboardItems: ClipboardItem[];
  onSendFilesToDesktop: (files: FileItem[]) => void;
  onSendClipboardText: (text: string) => void;
  onExitMobileView: () => void;
}

export const MobileView: React.FC<Props> = ({
  targetDesktop,
  clipboardItems,
  onSendFilesToDesktop,
  onSendClipboardText,
  onExitMobileView,
}) => {
  const [activeTab, setActiveTab] = useState<'send' | 'clipboard'>('send');
  const [mobileText, setMobileText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileItems: FileItem[] = Array.from(files).map((f) => ({
      id: `m_file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      size: f.size,
      type: f.type || 'image/jpeg',
      lastModified: f.lastModified,
      previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }));

    onSendFilesToDesktop(fileItems);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileText.trim()) return;
    onSendClipboardText(mobileText);
    setMobileText('');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f5f5f7] flex flex-col font-sans max-w-md mx-auto p-4 space-y-4">
      {/* Mobile Top App Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onExitMobileView}
            className="p-1.5 rounded-xl bg-white/[0.08] text-zinc-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>Hop Mobile</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-400">
              Connected to {targetDesktop.name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
          <Radio className="w-2.5 h-2.5 animate-pulse" />
          <span>LAN P2P</span>
        </div>
      </div>

      {/* Target Desktop Status Pill */}
      <div className="apple-card rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-sm">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white block">{targetDesktop.name}</span>
            <span className="text-[10px] font-mono text-zinc-400">{targetDesktop.ip} • Ready to receive</span>
          </div>
        </div>
      </div>

      {/* Mobile Segmented Switcher */}
      <div className="flex items-center p-1 rounded-xl apple-segmented font-mono text-xs">
        <button
          onClick={() => setActiveTab('send')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'send' ? 'bg-white/15 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Send Photos & Files</span>
        </button>
        <button
          onClick={() => setActiveTab('clipboard')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'clipboard' ? 'bg-white/15 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Clipboard className="w-3.5 h-3.5" />
          <span>Shared Clipboard</span>
        </button>
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {sentSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/35 text-emerald-300 text-xs font-mono flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Hopped to {targetDesktop.name} at line speed!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB 1: SEND PHOTOS & FILES */}
      {activeTab === 'send' && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="hidden"
          />

          {/* Big Tap to Drop Card */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="apple-card rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-3 cursor-pointer border-2 border-dashed border-sky-400/40 hover:border-sky-400 active:scale-[0.98] transition-all bg-gradient-to-b from-sky-500/5 to-transparent"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-lg">
              <Camera className="w-8 h-8" />
            </div>

            <div>
              <span className="text-base font-bold text-white font-sans block">
                Select Photos or Files
              </span>
              <span className="text-xs text-zinc-400 mt-1 block">
                Tap to open Photo Gallery, Camera, or Files
              </span>
            </div>

            <button
              type="button"
              className="mt-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-xs transition-colors shadow-md"
            >
              Choose from Phone
            </button>
          </div>

          {/* Quick Demo Sample */}
          <button
            onClick={() => {
              const demoPhoto: FileItem = {
                id: `phone_pic_${Date.now()}`,
                name: 'IMG_4892_Photonics_Lab_Sample.heic',
                size: 6.4 * 1024 * 1024,
                type: 'image/heic',
              };
              onSendFilesToDesktop([demoPhoto]);
              setSentSuccess(true);
              setTimeout(() => setSentSuccess(false), 3000);
            }}
            className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-xs font-mono text-zinc-300 flex items-center justify-center gap-1.5 border border-white/[0.08]"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Hop Sample Photo to Desktop (6.4 MB)
          </button>
        </div>
      )}

      {/* TAB 2: REAL-TIME CLIPBOARD */}
      {activeTab === 'clipboard' && (
        <div className="space-y-4">
          {/* Mobile Send Box */}
          <form onSubmit={handleSendText} className="space-y-2">
            <div className="relative">
              <textarea
                value={mobileText}
                onChange={(e) => setMobileText(e.target.value)}
                placeholder="Type or paste text/link to instantly mirror on PC..."
                rows={3}
                className="w-full p-3 rounded-2xl bg-black/40 border border-white/[0.08] text-white font-mono text-xs focus:outline-none focus:border-white/30"
              />
            </div>

            <button
              type="submit"
              disabled={!mobileText.trim()}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-sans font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Hop Text to Desktop</span>
            </button>
          </form>

          {/* Incoming Items Stream */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-zinc-400 block uppercase tracking-wider">
              Live Clipboard Stream from PC
            </span>

            {clipboardItems.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="apple-card rounded-2xl p-3.5 space-y-2 font-mono text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="text-zinc-300 font-medium">{item.sourceDevice.name}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.06] text-white break-all">
                    {item.text}
                  </div>

                  <button
                    onClick={() => handleCopy(item.text, item.id)}
                    className={`w-full py-1.5 rounded-xl font-sans font-medium text-xs flex items-center justify-center gap-1.5 transition-colors ${
                      isCopied
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-white/[0.08] hover:bg-white/15 text-white'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied to Phone Clipboard!' : 'Copy to Phone'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
