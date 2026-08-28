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
    <div className="space-y-3">
      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" multiple onChange={(e) => processFileList(e.target.files)} className="hidden" />
      <input ref={imageInputRef} type="file" multiple accept="image/*" onChange={(e) => processFileList(e.target.files)} className="hidden" />
      <input ref={videoInputRef} type="file" multiple accept="video/*" onChange={(e) => processFileList(e.target.files)} className="hidden" />
      <input ref={audioInputRef} type="file" multiple accept="audio/*" onChange={(e) => processFileList(e.target.files)} className="hidden" />

      {/* Main Drag & Drop Zone */}
      <motion.div
        whileHover={{ scale: 1.002 }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full rounded-2xl p-8 border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center relative overflow-hidden ${
          isDragOver
            ? 'border-white bg-zinc-800/80 shadow-xl'
            : 'border-white/15 hover:border-white/30 bg-[#121214] hover:bg-[#161618]'
        }`}
      >
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 shadow-sm mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h3 className="text-sm font-semibold text-white font-sans">
          {selectedPeer ? `Drop files to send to ${selectedPeer.name}` : 'Drop files or browse'}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm">
          Encrypted P2P streaming. Photos, videos, documents, and folders without file size limits.
        </p>

        <div className="mt-4 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs">
          Browse Files
        </div>
      </motion.div>

      {/* Category Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-sans text-xs">
        <button
          onClick={() => imageInputRef.current?.click()}
          className="p-3 rounded-xl bg-[#121214] hover:bg-zinc-900 border border-white/[0.08] flex items-center gap-2.5 transition-colors text-left"
        >
          <div className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300">
            <Image className="w-4 h-4" />
          </div>
          <div>
            <span className="font-medium text-zinc-200 block">Photos</span>
            <span className="text-[10px] text-zinc-500 font-mono">PNG, JPG, HEIC</span>
          </div>
        </button>

        <button
          onClick={() => videoInputRef.current?.click()}
          className="p-3 rounded-xl bg-[#121214] hover:bg-zinc-900 border border-white/[0.08] flex items-center gap-2.5 transition-colors text-left"
        >
          <div className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <span className="font-medium text-zinc-200 block">Videos</span>
            <span className="text-[10px] text-zinc-500 font-mono">MP4, MOV, 4K</span>
          </div>
        </button>

        <button
          onClick={() => audioInputRef.current?.click()}
          className="p-3 rounded-xl bg-[#121214] hover:bg-zinc-900 border border-white/[0.08] flex items-center gap-2.5 transition-colors text-left"
        >
          <div className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <span className="font-medium text-zinc-200 block">Music</span>
            <span className="text-[10px] text-zinc-500 font-mono">Audio files</span>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-xl bg-[#121214] hover:bg-zinc-900 border border-white/[0.08] flex items-center gap-2.5 transition-colors text-left"
        >
          <div className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-medium text-zinc-200 block">Documents</span>
            <span className="text-[10px] text-zinc-500 font-mono">PDF, ZIP, DOC</span>
          </div>
        </button>
      </div>
    </div>
  );
};
