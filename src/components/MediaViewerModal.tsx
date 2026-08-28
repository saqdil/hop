import React from 'react';
import { FileItem } from '../types/transfer';
import { X, Download, FileText, Image, Video, Music } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full max-w-3xl bg-[#0c0c0e] border border-white/15 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl rounded-none"
      >
        {/* Top Bar */}
        <div className="px-4 py-3 border-b border-white/10 bg-black flex items-center justify-between">
          <div className="flex items-center gap-2 truncate mr-3">
            <div className="p-1 border border-white/10 text-white">
              {isImage ? <Image className="w-3.5 h-3.5" /> : isVideo ? <Video className="w-3.5 h-3.5" /> : isAudio ? <Music className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            </div>
            <div className="truncate">
              <span className="font-bold text-xs text-white block truncate uppercase">{file.name}</span>
              <span className="text-[10px] text-zinc-500">{formatBytes(file.size)} &bull; {file.type || 'Binary file'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase flex items-center gap-1.5 rounded-none transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save File</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Container */}
        <div className="flex-1 bg-black flex items-center justify-center p-4 min-h-[280px] overflow-auto">
          {isImage && fileUrl ? (
            <img
              src={fileUrl}
              alt={file.name}
              className="max-h-[65vh] max-w-full object-contain border border-white/10 rounded-none"
            />
          ) : isVideo && fileUrl ? (
            <video
              src={fileUrl}
              controls
              autoPlay
              className="max-h-[65vh] max-w-full border border-white/10 rounded-none"
            />
          ) : isAudio && fileUrl ? (
            <div className="w-full max-w-md p-6 bg-[#0c0c0e] border border-white/10 text-center space-y-4">
              <Music className="w-8 h-8 mx-auto text-white" />
              <audio src={fileUrl} controls className="w-full" />
            </div>
          ) : isPdf && fileUrl ? (
            <iframe
              src={fileUrl}
              title={file.name}
              className="w-full h-[65vh] border border-white/10 bg-white"
            />
          ) : (
            <div className="text-center p-8 space-y-2">
              <FileText className="w-10 h-10 text-white mx-auto opacity-80" />
              <div className="text-xs font-bold text-white uppercase">{file.name}</div>
              <p className="text-[11px] text-zinc-400">
                Ready to save. Click "Save File" to store locally.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/10 bg-black flex items-center justify-between text-[10px] text-zinc-500">
          <span>PAYLOAD: RAW BINARY</span>
          <span>100% INTEGRITY</span>
        </div>
      </motion.div>
    </div>
  );
};
