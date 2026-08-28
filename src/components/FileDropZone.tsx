import React, { useRef, useState } from 'react';
import { PeerDevice } from '../types/peer';
import { FileItem } from '../types/transfer';
import { UploadCloud, Image, Video, Music, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  selectedPeer: PeerDevice | null;
  onSendFiles: (files: FileItem[]) => void;
}

export const FileDropZone: React.FC<Props> = ({ selectedPeer, onSendFiles }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const processFileList = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileItems: FileItem[] = Array.from(files).map((f) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream',
      lastModified: f.lastModified,
      rawFile: f,
      previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
      blobUrl: URL.createObjectURL(f),
    }));

    onSendFiles(fileItems);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFileList(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" multiple onChange={(e) => processFileList(e.target.files)} className="hidden" />
      <input ref={imageInputRef} type="file" multiple accept="image/*" onChange={(e) => processFileList(e.target.files)} className="hidden" />
      <input ref={videoInputRef} type="file" multiple accept="video/*" onChange={(e) => processFileList(e.target.files)} className="hidden" />
      <input ref={audioInputRef} type="file" multiple accept="audio/*" onChange={(e) => processFileList(e.target.files)} className="hidden" />

      {/* Main Drag & Drop Zone */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full rounded-3xl p-8 sm:p-10 border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl ${
          isDragOver
            ? 'border-sky-400 bg-sky-500/10 shadow-2xl scale-[1.01]'
            : 'border-white/15 hover:border-white/30 bg-[#121214]/60 hover:bg-[#161618]/80'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-white font-sans">
          {selectedPeer ? `Drop files to send to ${selectedPeer.name}` : 'Drop files or browse from device'}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-md">
          High-speed direct P2P streaming. Photos, 4K videos, documents, music, and folders without file size limits.
        </p>

        <div className="mt-4 px-5 py-2 rounded-xl bg-white text-zinc-950 font-semibold text-xs shadow-md">
          Browse Files
        </div>
      </motion.div>

      {/* Quick Category Buttons (like Xender) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans text-xs">
        <button
          onClick={() => imageInputRef.current?.click()}
          className="p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] flex items-center gap-3 transition-colors text-left group"
        >
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 group-hover:scale-110 transition-transform">
            <Image className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white block">Photos</span>
            <span className="text-[10px] text-zinc-400 font-mono">PNG, JPG, HEIC</span>
          </div>
        </button>

        <button
          onClick={() => videoInputRef.current?.click()}
          className="p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] flex items-center gap-3 transition-colors text-left group"
        >
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 group-hover:scale-110 transition-transform">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white block">Videos</span>
            <span className="text-[10px] text-zinc-400 font-mono">MP4, MOV, 4K</span>
          </div>
        </button>

        <button
          onClick={() => audioInputRef.current?.click()}
          className="p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] flex items-center gap-3 transition-colors text-left group"
        >
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 group-hover:scale-110 transition-transform">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white block">Music</span>
            <span className="text-[10px] text-zinc-400 font-mono">MP3, WAV, FLAC</span>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] flex items-center gap-3 transition-colors text-left group"
        >
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 group-hover:scale-110 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white block">Documents</span>
            <span className="text-[10px] text-zinc-400 font-mono">PDF, DOC, ZIP</span>
          </div>
        </button>
      </div>
    </div>
  );
};
