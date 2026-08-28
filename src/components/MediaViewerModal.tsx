import React from 'react';
import { FileItem } from '../types/transfer';
import { X, Download, FileText, ExternalLink, Image, Video, Music } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<Props> = ({ file, isOpen, onClose }) => {
  if (!isOpen || !file) return null;

  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg|heic)$/i.test(file.name);
  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
  const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|ogg|aac|m4a)$/i.test(file.name);
  const isPdf = file.type.includes('pdf') || /\.pdf$/i.test(file.name);

  const fileUrl = file.blobUrl || file.previewUrl || file.downloadUrl || (file.rawFile ? URL.createObjectURL(file.rawFile) : '');

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (fileUrl) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = file.name;
      a.click();
    } else if (file.rawBlob) {
      const url = URL.createObjectURL(file.rawBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl rounded-3xl apple-card border border-white/15 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#161618] flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate mr-3">
            <div className="p-1.5 rounded-lg bg-white/[0.08] text-sky-400">
              {isImage ? <Image className="w-4 h-4" /> : isVideo ? <Video className="w-4 h-4" /> : isAudio ? <Music className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="truncate">
              <span className="font-semibold text-xs text-white block truncate">{file.name}</span>
              <span className="font-mono text-[10px] text-zinc-400">{formatBytes(file.size)} &bull; {file.type || 'Binary file'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save File</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Preview Container */}
        <div className="flex-1 bg-[#09090b] flex items-center justify-center p-4 min-h-[300px] overflow-auto">
          {isImage && fileUrl ? (
            <img
              src={fileUrl}
              alt={file.name}
              className="max-h-[65vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/[0.06]"
            />
          ) : isVideo && fileUrl ? (
            <video
              src={fileUrl}
              controls
              autoPlay
              className="max-h-[65vh] max-w-full rounded-2xl shadow-2xl border border-white/[0.06]"
            />
          ) : isAudio && fileUrl ? (
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#1c1c1e] border border-white/10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center mx-auto text-white shadow-lg">
                <Music className="w-8 h-8" />
              </div>
              <audio src={fileUrl} controls className="w-full" />
            </div>
          ) : isPdf && fileUrl ? (
            <iframe
              src={fileUrl}
              title={file.name}
              className="w-full h-[65vh] rounded-2xl border border-white/10 bg-white"
            />
          ) : (
            <div className="text-center p-8 space-y-3">
              <FileText className="w-16 h-16 text-sky-400 mx-auto opacity-70" />
              <div className="text-sm font-semibold text-white">{file.name}</div>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Ready to save directly to your device. Tap "Save File" to store it in your Downloads / Camera Roll.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3 border-t border-white/[0.08] bg-[#161618] flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>Encrypted Authentic Binary Payload</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> Direct Open
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
