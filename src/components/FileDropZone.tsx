import React, { useState, useRef } from 'react';
import { FileItem } from '../types/transfer';
import { PeerDevice } from '../types/peer';
import { UploadCloud, FileText, Image, Video, Music, Archive, Trash2, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  selectedPeer: PeerDevice | null;
  onSendFiles: (files: FileItem[]) => void;
}

export const FileDropZone: React.FC<Props> = ({ selectedPeer, onSendFiles }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<FileItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('zip') || type.includes('tar') || type.includes('compressed')) return Archive;
    return FileText;
  };

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: FileItem[] = Array.from(files).map((f) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream',
      lastModified: f.lastModified,
      rawFile: f,
      previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }));

    setStagedFiles((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesAdded(e.dataTransfer.files);
  };

  const handleRemoveFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSend = () => {
    if (stagedFiles.length === 0 || !selectedPeer) return;
    onSendFiles(stagedFiles);
    setStagedFiles([]);
  };

  const handleInjectDemoFiles = () => {
    const demoItems: FileItem[] = [
      {
        id: `demo_1_${Date.now()}`,
        name: 'Photonics_Wafer_Scan_2026.csv',
        size: 14.8 * 1024 * 1024,
        type: 'text/csv',
      },
      {
        id: `demo_2_${Date.now()}`,
        name: 'Optical_Lab_Recording_4K.mov',
        size: 84.5 * 1024 * 1024,
        type: 'video/quicktime',
      },
      {
        id: `demo_3_${Date.now()}`,
        name: 'Architecture_Blueprint_v3.pdf',
        size: 3.2 * 1024 * 1024,
        type: 'application/pdf',
      },
    ];
    setStagedFiles((prev) => [...prev, ...demoItems]);
  };

  const totalSize = stagedFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="apple-card rounded-3xl p-5 space-y-4">
      {/* Drop Target Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white font-sans">
            {selectedPeer ? (
              <>
                Target Device: <span className="text-sky-400 font-mono">{selectedPeer.name}</span>
              </>
            ) : (
              'Select a device in the radar above to hop files'
            )}
          </span>
        </div>

        {stagedFiles.length === 0 && (
          <button
            onClick={handleInjectDemoFiles}
            className="text-[11px] font-mono text-zinc-400 hover:text-sky-300 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            Add Sample Files
          </button>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
          isDragging
            ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
            : 'border-white/10 hover:border-white/20 bg-black/20 hover:bg-black/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFilesAdded(e.target.files)}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300">
          <UploadCloud className="w-6 h-6 text-sky-400" />
        </div>

        <div>
          <span className="text-sm font-semibold text-white font-sans block">
            Drag & drop files here, or browse
          </span>
          <span className="text-xs font-mono text-zinc-400 mt-0.5 block">
            Unlimited file size • Line speed LAN transfer (100+ MB/s)
          </span>
        </div>
      </div>

      {/* Staged Files List */}
      <AnimatePresence>
        {stagedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-1"
          >
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>
                {stagedFiles.length} file{stagedFiles.length > 1 ? 's' : ''} staged ({formatBytes(totalSize)})
              </span>
              <button
                onClick={() => setStagedFiles([])}
                className="text-rose-400 hover:text-rose-300"
              >
                Clear all
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
              {stagedFiles.map((file) => {
                const Icon = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/[0.06] hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate mr-3">
                      <div className="p-1.5 rounded-lg bg-white/[0.08] text-zinc-300">
                        <Icon className="w-4 h-4 text-sky-400" />
                      </div>
                      <span className="text-white truncate max-w-sm">{file.name}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-zinc-400 text-[11px]">{formatBytes(file.size)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(file.id);
                        }}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!selectedPeer}
              className="w-full py-3 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white font-sans font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {selectedPeer ? `Hop ${stagedFiles.length} File${stagedFiles.length > 1 ? 's' : ''} to ${selectedPeer.name}` : 'Select a Target Device Above to Send'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
