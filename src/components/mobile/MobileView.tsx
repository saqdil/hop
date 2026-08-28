import React, { useState, useRef } from 'react';
import { PeerDevice } from '../../types/peer';
import { FileItem, ClipboardItem, TransferSession } from '../../types/transfer';
import { Laptop, Camera, UploadCloud, Clipboard, Send, Copy, Check, Sparkles, Download, Inbox, Zap, ArrowDownToLine, RefreshCw, Eye, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  selfDevice: PeerDevice;
  targetDesktop: PeerDevice;
  clipboardItems: ClipboardItem[];
  transfers: TransferSession[];
  onSendFilesToDesktop: (files: FileItem[]) => void;
  onSendClipboardText: (text: string) => void;
  onOpenHotspotModal: () => void;
  onPreviewFile: (file: FileItem) => void;
  onExitMobileView: () => void;
}

export const MobileView: React.FC<Props> = ({
  targetDesktop,
  clipboardItems,
  transfers,
  onSendFilesToDesktop,
  onSendClipboardText,
  onOpenHotspotModal,
  onPreviewFile,
}) => {
  const [activeTab, setActiveTab] = useState<'send' | 'clipboard' | 'inbox'>('send');
  const [mobileText, setMobileText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadPercent(20);

    const fileItems: FileItem[] = Array.from(files).map((f) => ({
      id: `m_file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream',
      lastModified: f.lastModified,
      rawFile: f,
      previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
      blobUrl: URL.createObjectURL(f),
    }));

    onSendFilesToDesktop(fileItems);
    setTimeout(() => {
      setUploadPercent(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadPercent(0);
      }, 600);
    }, 1000);
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

  const handleDirectDownload = (fileRecord: FileItem) => {
    const url = fileRecord.blobUrl || fileRecord.previewUrl || fileRecord.downloadUrl || (fileRecord.rawFile ? URL.createObjectURL(fileRecord.rawFile) : '');
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileRecord.name;
      a.click();
    }
  };

  const allReceivedFiles: { file: FileItem; session: TransferSession }[] = [];
  transfers.forEach((s) => {
    if (s.status === 'completed') {
      s.files.forEach((f) => allReceivedFiles.push({ file: f, session: s }));
    }
  });

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col font-sans max-w-lg mx-auto pb-24 select-none">
      {/* Top Mobile Header */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-[#121214]/90 backdrop-blur-2xl border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white font-sans tracking-tight">Hop Mobile</h1>
            <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Target: {targetDesktop.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHotspotModal}
            className="px-2.5 py-1 rounded-xl bg-white/[0.08] text-sky-400 text-xs font-mono flex items-center gap-1 border border-white/10"
          >
            <Radio className="w-3 h-3 animate-pulse" />
            <span>P2P Mode</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="p-1.5 rounded-xl bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 space-y-4">
        {/* PWA 1-Tap Home Screen Tip Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-500/15 to-blue-600/15 border border-sky-400/25 flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="text-base">📱</span>
            <span className="text-zinc-200 text-[11px]">
              Tap <strong>Share &rarr; Add to Home Screen</strong> to use Hop as a native app!
            </span>
          </div>
        </div>

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

            {/* Big Tap Card */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="apple-card rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-3 cursor-pointer border border-sky-400/30 bg-gradient-to-b from-sky-500/10 via-[#1c1c1e] to-[#121214] shadow-xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-lg">
                <Camera className="w-8 h-8" />
              </div>

              <div>
                <span className="text-lg font-bold text-white font-sans block">
                  Tap to Send Photos & Files
                </span>
                <span className="text-xs text-zinc-400 mt-1 block">
                  Direct from Camera Roll, Gallery, or Files
                </span>
              </div>

              <div className="mt-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs shadow-md">
                Choose from Phone
              </div>
            </motion.div>

            {/* Uploading progress banner */}
            {isUploading && (
              <div className="apple-card rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-xs font-mono text-zinc-300">
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <UploadCloud className="w-4 h-4 animate-bounce" /> Streaming direct to {targetDesktop.name}...
                  </span>
                  <span>{uploadPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                  <div
                    className="h-full bg-sky-400 transition-all duration-300"
                    style={{ width: `${uploadPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick Sample Photo */}
            <button
              onClick={() => {
                const sample: FileItem = {
                  id: `sample_${Date.now()}`,
                  name: 'RAW_Camera_Sample_2026.jpg',
                  size: 6.2 * 1024 * 1024,
                  type: 'image/jpeg',
                };
                onSendFilesToDesktop([sample]);
              }}
              className="w-full py-3 rounded-2xl bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-zinc-300 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Send Sample 4K Photo (6.2 MB)
            </button>
          </div>
        )}

        {/* TAB 2: UNIVERSAL LIVE CLIPBOARD */}
        {activeTab === 'clipboard' && (
          <div className="space-y-4">
            {/* Send to PC Input */}
            <form onSubmit={handleSendText} className="space-y-2">
              <textarea
                value={mobileText}
                onChange={(e) => setMobileText(e.target.value)}
                placeholder="Type or paste anything on your phone to instantly mirror to PC/Mac..."
                rows={3}
                className="w-full p-3.5 rounded-2xl bg-[#1c1c1e] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-sky-400 shadow-inner"
              />

              <button
                type="submit"
                disabled={!mobileText.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 text-white font-sans font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Hop Text to Connected Devices</span>
              </button>
            </form>

            {/* Incoming Items */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 block uppercase tracking-wider">
                Live Shared Clipboard
              </span>

              {clipboardItems.length === 0 ? (
                <div className="apple-card rounded-2xl p-6 text-center text-xs text-zinc-500 font-mono">
                  Copy anything on your PC/Mac and it appears here in real time.
                </div>
              ) : (
                clipboardItems.map((item) => {
                  const isCopied = copiedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="apple-card rounded-2xl p-3.5 space-y-2 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="text-sky-300 font-medium">{item.sourceDevice.name}</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="bg-black/40 p-2.5 rounded-xl border border-white/[0.06] text-white break-all select-all">
                        {item.text}
                      </div>

                      <button
                        onClick={() => handleCopy(item.text, item.id)}
                        className={`w-full py-2 rounded-xl font-sans font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                          isCopied
                            ? 'bg-emerald-500 text-black shadow-md'
                            : 'bg-white/[0.08] hover:bg-white/15 text-white'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied to Phone Clipboard!' : 'Copy to Phone'}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: INCOMING & RECEIVED FILES */}
        {activeTab === 'inbox' && (
          <div className="space-y-3">
            <span className="text-[11px] font-mono text-zinc-400 block uppercase tracking-wider">
              Received Files ({allReceivedFiles.length})
            </span>

            {allReceivedFiles.length === 0 ? (
              <div className="apple-card rounded-2xl p-8 text-center space-y-2">
                <Inbox className="w-8 h-8 text-zinc-600 mx-auto" />
                <h3 className="text-sm font-semibold text-white font-sans">No Files Received Yet</h3>
                <p className="text-xs text-zinc-400">
                  Drop files from your Mac/PC onto the phone avatar to view and save them here.
                </p>
              </div>
            ) : (
              allReceivedFiles.map(({ file, session }) => (
                <div key={file.id} className="apple-card rounded-2xl p-4 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span className="text-white font-semibold flex items-center gap-1">
                      <Laptop className="w-3 h-3 text-sky-400" />
                      From {session.sender.name}
                    </span>
                    <span>{new Date(session.completedAt || session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* File preview card */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.06] gap-2">
                    <div className="truncate flex-1">
                      <div className="text-white font-medium truncate">{file.name}</div>
                      <div className="text-zinc-500 text-[10px]">{formatBytes(file.size)} &bull; {file.type || 'File'}</div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onPreviewFile(file)}
                        className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/15 text-sky-300 transition-colors"
                        title="View Fullscreen"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDirectDownload(file)}
                        className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-bold text-xs flex items-center gap-1 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Native Bottom App Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-[#121214]/95 backdrop-blur-2xl border-t border-white/[0.08] px-3 py-2 flex items-center justify-around z-40">
        <button
          onClick={() => setActiveTab('send')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-colors ${
            activeTab === 'send' ? 'text-sky-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <UploadCloud className="w-5 h-5" />
          <span className="text-[10px] font-sans">Send</span>
        </button>

        <button
          onClick={() => setActiveTab('clipboard')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-colors ${
            activeTab === 'clipboard' ? 'text-sky-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Clipboard className="w-5 h-5" />
          <span className="text-[10px] font-sans">Clipboard</span>
        </button>

        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-colors relative ${
            activeTab === 'inbox' ? 'text-sky-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <ArrowDownToLine className="w-5 h-5" />
          <span className="text-[10px] font-sans">Received</span>
          {allReceivedFiles.length > 0 && (
            <span className="absolute top-0 right-3 w-4 h-4 rounded-full bg-emerald-500 text-black font-mono text-[9px] font-bold flex items-center justify-center">
              {allReceivedFiles.length}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};
