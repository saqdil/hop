import React, { useState, useRef } from 'react';
import { PeerDevice } from '../../types/peer';
import { FileItem, ClipboardItem, TransferSession } from '../../types/transfer';
import { Laptop, Camera, UploadCloud, Clipboard, Send, Copy, Check, Download, Inbox, ArrowDownToLine, RefreshCw, Eye, Radio, Image, Video, Music, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  selfDevice: PeerDevice;
  targetDesktop: PeerDevice | null;
  clipboardItems: ClipboardItem[];
  transfers: TransferSession[];
  onSendFilesToDesktop: (files: FileItem[]) => void;
  onSendClipboardText: (text: string) => void;
  onOpenHotspotModal: () => void;
  onPreviewFile: (file: FileItem) => void;
  onExitMobileView: () => void;
  onUpdateDeviceName?: (name: string) => void;
  onOpenQrPairing?: () => void;
}

export const MobileView: React.FC<Props> = ({
  selfDevice,
  targetDesktop,
  clipboardItems,
  transfers,
  onSendFilesToDesktop,
  onSendClipboardText,
  onOpenHotspotModal,
  onPreviewFile,
  onOpenQrPairing,
}) => {
  const [activeTab, setActiveTab] = useState<'send' | 'clipboard' | 'inbox'>('send');
  const [mobileText, setMobileText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
    setUploadPercent(30);

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
      }, 500);
    }, 800);
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
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col font-sans max-w-lg mx-auto pb-24 select-none">
      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" multiple onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />
      <input ref={imageInputRef} type="file" multiple accept="image/*" onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />
      <input ref={videoInputRef} type="file" multiple accept="video/*" onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />
      <input ref={audioInputRef} type="file" multiple accept="audio/*" onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />

      {/* Top Mobile Header */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-[#0d0d0f]/90 backdrop-blur-2xl border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-white text-zinc-950 flex items-center justify-center font-bold text-xs font-mono">
            H
          </div>
          <div>
            <h1 className="text-xs font-semibold text-white tracking-tight">{selfDevice.name}</h1>
            <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{targetDesktop ? `Connected: ${targetDesktop.name}` : 'P2P Ready'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenQrPairing && (
            <button
              onClick={onOpenQrPairing}
              className="p-1.5 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white border border-white/[0.08] transition-colors"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenHotspotModal}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 text-xs font-mono flex items-center gap-1 border border-white/[0.08]"
          >
            <Radio className="w-3 h-3" />
            <span>P2P</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-white/[0.08] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        {/* TAB 1: SEND */}
        {activeTab === 'send' && (
          <div className="space-y-3">
            {/* Big Tap Card */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl p-7 text-center flex flex-col items-center justify-center space-y-3 cursor-pointer border border-white/[0.12] bg-[#121214] hover:bg-[#161618] transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 text-white flex items-center justify-center">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div>
                <span className="text-base font-semibold text-white block">
                  Tap to Send Files
                </span>
                <span className="text-xs text-zinc-400 mt-0.5 block">
                  {targetDesktop ? `Direct stream to ${targetDesktop.name}` : 'Drop files to connected device'}
                </span>
              </div>

              <div className="px-4 py-2 rounded-lg bg-white text-zinc-950 font-semibold text-xs shadow-sm">
                Choose Files
              </div>
            </motion.div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="p-3.5 rounded-xl bg-[#121214] border border-white/[0.08] flex items-center gap-2.5 hover:bg-zinc-900 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300">
                  <Image className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-medium text-zinc-200 block">Photos</span>
                  <span className="text-[10px] text-zinc-500">Gallery</span>
                </div>
              </button>

              <button
                onClick={() => videoInputRef.current?.click()}
                className="p-3.5 rounded-xl bg-[#121214] border border-white/[0.08] flex items-center gap-2.5 hover:bg-zinc-900 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-medium text-zinc-200 block">Videos</span>
                  <span className="text-[10px] text-zinc-500">Clips</span>
                </div>
              </button>

              <button
                onClick={() => audioInputRef.current?.click()}
                className="p-3.5 rounded-xl bg-[#121214] border border-white/[0.08] flex items-center gap-2.5 hover:bg-zinc-900 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-medium text-zinc-200 block">Music</span>
                  <span className="text-[10px] text-zinc-500">Audio</span>
                </div>
              </button>

              <button
                onClick={() => cameraInputRef.current?.click()}
                className="p-3.5 rounded-xl bg-[#121214] border border-white/[0.08] flex items-center gap-2.5 hover:bg-zinc-900 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-medium text-zinc-200 block">Camera</span>
                  <span className="text-[10px] text-zinc-500">Take Photo</span>
                </div>
              </button>
            </div>

            {/* Uploading progress */}
            {isUploading && (
              <div className="rounded-xl bg-[#121214] border border-white/[0.08] p-4 space-y-2">
                <div className="flex justify-between text-xs font-mono text-zinc-300">
                  <span>Streaming to {targetDesktop?.name || 'Device'}...</span>
                  <span>{uploadPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-200"
                    style={{ width: `${uploadPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLIPBOARD */}
        {activeTab === 'clipboard' && (
          <div className="space-y-3">
            <form onSubmit={handleSendText} className="space-y-2">
              <textarea
                value={mobileText}
                onChange={(e) => setMobileText(e.target.value)}
                placeholder="Type or paste text to share across devices..."
                rows={3}
                className="w-full p-3.5 rounded-xl bg-[#121214] border border-white/[0.08] text-white font-mono text-xs focus:outline-none focus:border-white/30"
              />

              <button
                type="submit"
                disabled={!mobileText.trim()}
                className="w-full py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Text to Devices</span>
              </button>
            </form>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-zinc-500 block uppercase tracking-wider">
                Shared Clipboard
              </span>

              {clipboardItems.length === 0 ? (
                <div className="rounded-xl bg-[#121214] border border-white/[0.08] p-6 text-center text-xs text-zinc-500 font-mono">
                  Copied text from PC or phone appears here instantly.
                </div>
              ) : (
                clipboardItems.map((item) => {
                  const isCopied = copiedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl bg-[#121214] border border-white/[0.08] p-3.5 space-y-2 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="text-zinc-200">{item.sourceDevice.name}</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="bg-black/50 p-2.5 rounded-lg border border-white/[0.06] text-zinc-200 break-all select-all">
                        {item.text}
                      </div>

                      <button
                        onClick={() => handleCopy(item.text, item.id)}
                        className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                          isCopied ? 'bg-zinc-800 text-emerald-400' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RECEIVED */}
        {activeTab === 'inbox' && (
          <div className="space-y-3">
            <span className="text-[11px] font-mono text-zinc-500 block uppercase tracking-wider">
              Received ({allReceivedFiles.length})
            </span>

            {allReceivedFiles.length === 0 ? (
              <div className="rounded-xl bg-[#121214] border border-white/[0.08] p-8 text-center space-y-2">
                <Inbox className="w-6 h-6 text-zinc-600 mx-auto" />
                <h3 className="text-sm font-semibold text-white">No Received Files</h3>
                <p className="text-xs text-zinc-500">
                  Files dropped to this device will appear here.
                </p>
              </div>
            ) : (
              allReceivedFiles.map(({ file, session }) => (
                <div key={file.id} className="rounded-xl bg-[#121214] border border-white/[0.08] p-3.5 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span className="text-zinc-200 flex items-center gap-1">
                      <Laptop className="w-3 h-3 text-zinc-400" />
                      {session.sender.name}
                    </span>
                    <span>{new Date(session.completedAt || session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/[0.06] gap-2">
                    <div className="truncate flex-1">
                      <div className="text-white font-medium truncate">{file.name}</div>
                      <div className="text-zinc-500 text-[10px]">{formatBytes(file.size)}</div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onPreviewFile(file)}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDirectDownload(file)}
                        className="px-2.5 py-1.5 rounded-lg bg-white text-zinc-950 font-bold text-xs flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
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

      {/* Bottom App Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-[#0d0d0f]/95 backdrop-blur-2xl border-t border-white/[0.08] px-4 py-2 flex items-center justify-around z-40">
        <button
          onClick={() => setActiveTab('send')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-colors ${
            activeTab === 'send' ? 'text-white font-bold' : 'text-zinc-500'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span className="text-[10px]">Send</span>
        </button>

        <button
          onClick={() => setActiveTab('clipboard')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-colors ${
            activeTab === 'clipboard' ? 'text-white font-bold' : 'text-zinc-500'
          }`}
        >
          <Clipboard className="w-4 h-4" />
          <span className="text-[10px]">Clipboard</span>
        </button>

        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-colors relative ${
            activeTab === 'inbox' ? 'text-white font-bold' : 'text-zinc-500'
          }`}
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span className="text-[10px]">Received</span>
          {allReceivedFiles.length > 0 && (
            <span className="absolute top-0 right-2 w-3.5 h-3.5 rounded-full bg-white text-zinc-950 font-mono text-[9px] font-bold flex items-center justify-center">
              {allReceivedFiles.length}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};
