import React, { useState, useRef } from 'react';
import { PeerDevice } from '../../types/peer';
import { FileItem, ClipboardItem, TransferSession } from '../../types/transfer';
import { Laptop, Camera, UploadCloud, Clipboard, Send, Copy, Check, Download, Inbox, ArrowDownToLine, RefreshCw, Eye, Radio, Image, Video, Music, QrCode } from 'lucide-react';

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
      rawBlob: f,
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

  const handleDirectDownload = async (fileRecord: FileItem) => {
    // 1. Try Native Android / iOS Web Share API (Saves directly to Gallery / Files)
    try {
      let blobToShare = fileRecord.rawBlob;
      if (!blobToShare && fileRecord.blobUrl) {
        const resp = await fetch(fileRecord.blobUrl);
        blobToShare = await resp.blob();
      }

      if (blobToShare && (navigator as any).canShare) {
        const fileObj = new File([blobToShare], fileRecord.name, {
          type: fileRecord.type || 'application/octet-stream',
        });
        if ((navigator as any).canShare({ files: [fileObj] })) {
          await navigator.share({
            files: [fileObj],
            title: fileRecord.name,
          });
          return;
        }
      }
    } catch (err) {
      console.log('Share API fallback to standard download:', err);
    }

    // 2. Standard direct browser download
    const url = fileRecord.blobUrl || fileRecord.previewUrl || fileRecord.downloadUrl || (fileRecord.rawFile ? URL.createObjectURL(fileRecord.rawFile) : '');
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileRecord.name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try {
          document.body.removeChild(a);
        } catch {}
      }, 1000);
    }
  };

  const allReceivedFiles: { file: FileItem; session: TransferSession }[] = [];
  transfers.forEach((s) => {
    if (s.status === 'completed') {
      s.files.forEach((f) => allReceivedFiles.push({ file: f, session: s }));
    }
  });

  return (
    <div className="min-h-screen bg-black text-[#ededed] flex flex-col font-mono max-w-lg mx-auto pb-20 select-none">
      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" multiple onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />
      <input ref={imageInputRef} type="file" multiple accept="image/*" onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />
      <input ref={videoInputRef} type="file" multiple accept="video/*" onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />
      <input ref={audioInputRef} type="file" multiple accept="audio/*" onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />

      {/* Top Mobile Header */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-black border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-white" />
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider text-white">{selfDevice.name}</h1>
            <div className="text-[9px] text-zinc-500 uppercase">
              {targetDesktop ? `CONNECTED: ${targetDesktop.name}` : 'P2P STANDBY'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenQrPairing && (
            <button
              onClick={onOpenQrPairing}
              className="p-1.5 bg-zinc-900 border border-white/10 text-white"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onOpenHotspotModal}
            className="px-2 py-1 bg-zinc-900 border border-white/10 text-white text-[10px] uppercase"
          >
            <Radio className="w-3 h-3 inline mr-1" />
            <span>P2P</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="p-1.5 bg-zinc-900 border border-white/10 text-zinc-400"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-3">
        {/* TAB 1: SEND */}
        {activeTab === 'send' && (
          <div className="space-y-2.5">
            {/* Big Tap Card */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 text-center flex flex-col items-center justify-center space-y-2 cursor-pointer border border-white/20 bg-[#0c0c0e] hover:bg-[#141417] transition-colors"
            >
              <div className="w-10 h-10 bg-black border border-white/20 text-white flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-white block">
                  Tap to Send Files
                </span>
                <span className="text-[10px] text-zinc-500 mt-0.5 block uppercase">
                  {targetDesktop ? `Direct P2P: ${targetDesktop.name}` : 'Ready to stream'}
                </span>
              </div>

              <div className="px-4 py-1.5 bg-white text-black font-bold text-xs uppercase tracking-wider mt-1">
                Browse Files
              </div>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="p-3 bg-[#0c0c0e] border border-white/10 flex items-center gap-2 hover:bg-zinc-900 transition-colors text-left"
              >
                <div className="p-1.5 bg-black border border-white/10 text-white">
                  <Image className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white uppercase text-[10px]">Photos</span>
                  <span className="text-[9px] text-zinc-500 block uppercase">Gallery</span>
                </div>
              </button>

              <button
                onClick={() => videoInputRef.current?.click()}
                className="p-3 bg-[#0c0c0e] border border-white/10 flex items-center gap-2 hover:bg-zinc-900 transition-colors text-left"
              >
                <div className="p-1.5 bg-black border border-white/10 text-white">
                  <Video className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white uppercase text-[10px]">Videos</span>
                  <span className="text-[9px] text-zinc-500 block uppercase">Clips</span>
                </div>
              </button>

              <button
                onClick={() => audioInputRef.current?.click()}
                className="p-3 bg-[#0c0c0e] border border-white/10 flex items-center gap-2 hover:bg-zinc-900 transition-colors text-left"
              >
                <div className="p-1.5 bg-black border border-white/10 text-white">
                  <Music className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white uppercase text-[10px]">Music</span>
                  <span className="text-[9px] text-zinc-500 block uppercase">Audio</span>
                </div>
              </button>

              <button
                onClick={() => cameraInputRef.current?.click()}
                className="p-3 bg-[#0c0c0e] border border-white/10 flex items-center gap-2 hover:bg-zinc-900 transition-colors text-left"
              >
                <div className="p-1.5 bg-black border border-white/10 text-white">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white uppercase text-[10px]">Camera</span>
                  <span className="text-[9px] text-zinc-500 block uppercase">Snap</span>
                </div>
              </button>
            </div>

            {/* Uploading progress */}
            {isUploading && (
              <div className="bg-[#0c0c0e] border border-white/10 p-3 space-y-1.5">
                <div className="flex justify-between text-[10px] text-zinc-300">
                  <span className="uppercase">Streaming to {targetDesktop?.name || 'Device'}</span>
                  <span>{uploadPercent}%</span>
                </div>
                <div className="w-full h-1 bg-black border border-white/10 overflow-hidden">
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
          <div className="space-y-2.5">
            <form onSubmit={handleSendText} className="space-y-1.5">
              <textarea
                value={mobileText}
                onChange={(e) => setMobileText(e.target.value)}
                placeholder="Type or paste text to sync across devices..."
                rows={3}
                className="w-full p-3 bg-[#0c0c0e] border border-white/15 text-white text-xs focus:outline-none focus:border-white rounded-none"
              />

              <button
                type="submit"
                disabled={!mobileText.trim()}
                className="w-full py-2 bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 disabled:opacity-30 rounded-none"
              >
                <Send className="w-3 h-3" />
                <span>Send Text</span>
              </button>
            </form>

            <div className="space-y-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">
                Clipboard Vault
              </span>

              {clipboardItems.length === 0 ? (
                <div className="bg-[#0c0c0e] border border-white/10 p-6 text-center text-xs text-zinc-500">
                  Text copied on PC or phone mirrors here.
                </div>
              ) : (
                clipboardItems.map((item) => {
                  const isCopied = copiedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="bg-[#0c0c0e] border border-white/10 p-3 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="text-white uppercase font-bold">{item.sourceDevice.name}</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="bg-black p-2 border border-white/10 text-zinc-200 break-all select-all text-[11px]">
                        {item.text}
                      </div>

                      <button
                        onClick={() => handleCopy(item.text, item.id)}
                        className={`w-full py-1.5 text-[11px] font-bold uppercase flex items-center justify-center gap-1 border border-white/10 transition-colors ${
                          isCopied ? 'bg-white text-black' : 'bg-black text-white hover:bg-zinc-900'
                        }`}
                      >
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
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
          <div className="space-y-2.5">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">
              Received Files ({allReceivedFiles.length})
            </span>

            {allReceivedFiles.length === 0 ? (
              <div className="bg-[#0c0c0e] border border-white/10 p-6 text-center space-y-1">
                <Inbox className="w-5 h-5 text-zinc-600 mx-auto" />
                <h3 className="text-xs font-bold text-white uppercase">No Received Files</h3>
                <p className="text-[10px] text-zinc-500">
                  Files dropped to this device will appear here.
                </p>
              </div>
            ) : (
              allReceivedFiles.map(({ file, session }) => (
                <div key={file.id} className="bg-[#0c0c0e] border border-white/10 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                    <span className="text-white uppercase font-bold flex items-center gap-1">
                      <Laptop className="w-3 h-3 text-zinc-400" />
                      {session.sender.name}
                    </span>
                    <span>{new Date(session.completedAt || session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-black border border-white/10 gap-2">
                    <div className="truncate flex-1">
                      <div className="text-white font-bold text-[11px] truncate">{file.name}</div>
                      <div className="text-zinc-500 text-[9px]">{formatBytes(file.size)}</div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onPreviewFile(file)}
                        className="p-1.5 bg-zinc-900 border border-white/10 text-white"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDirectDownload(file)}
                        className="px-2.5 py-1.5 bg-white text-black font-bold text-[10px] uppercase flex items-center gap-1"
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

      {/* Bottom App Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-black border-t border-white/10 flex items-center justify-around z-40">
        <button
          onClick={() => setActiveTab('send')}
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors border-r border-white/10 ${
            activeTab === 'send' ? 'bg-white text-black font-bold' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-wider">Send</span>
        </button>

        <button
          onClick={() => setActiveTab('clipboard')}
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors border-r border-white/10 ${
            activeTab === 'clipboard' ? 'bg-white text-black font-bold' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <Clipboard className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-wider">Clipboard</span>
        </button>

        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors relative ${
            activeTab === 'inbox' ? 'bg-white text-black font-bold' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-wider">Received</span>
          {allReceivedFiles.length > 0 && (
            <span className="absolute top-1 right-3 text-[8px] font-bold px-1 bg-zinc-800 text-white border border-white/20">
              {allReceivedFiles.length}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};
