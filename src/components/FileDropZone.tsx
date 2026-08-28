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
    <div className="space-y-3 font-mono">
      {/* Hidden Inputs */}
      <input ref={fileInputRef} type="file" multiple onChange={(e) => processFileList(e.target.files)} className="hidden" />
      <input ref={imageInputRef} type="file" multiple accept="image/*" onChange={(e) => processFileList(e.target.files)} className="hidden" />
      <input ref={videoInputRef} type="file" multiple accept="video/*" onChange={(e) => processFileList(e.target.files)} className="hidden" />
      <input ref={audioInputRef} type="file" multiple accept="audio/*" onChange={(e) => processFileList(e.target.files)} className="hidden" />

      {/* Main Drag & Drop Zone */}
      <motion.div
        whileHover={{ scale: 1.001 }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full p-8 border border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center relative rounded-none ${
          isDragOver
            ? 'border-white bg-zinc-900 shadow-2xl'
            : 'border-white/20 hover:border-white/40 bg-[#0c0c0e] hover:bg-[#121214]'
        }`}
      >
        <div className="w-10 h-10 bg-black border border-white/20 flex items-center justify-center text-white mb-3">
          <UploadCloud className="w-5 h-5" />
        </div>

        <h3 className="text-xs font-bold uppercase tracking-wider text-white">
          {selectedPeer ? `Drop files to send to ${selectedPeer.name}` : 'Drop files or browse'}
        </h3>
        <p className="text-[11px] text-zinc-400 mt-1 max-w-sm">
          Encrypted P2P streaming. Photos, 4K videos, documents, music, and folders without file size limits.
        </p>

        <div className="mt-3 px-4 py-1.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider">
          Browse Files
        </div>
      </motion.div>

      {/* Category Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <button
          onClick={() => imageInputRef.current?.click()}
          className="p-3 bg-[#0c0c0e] hover:bg-zinc-900 border border-white/10 flex items-center gap-2.5 transition-colors text-left"
        >
          <div className="p-1.5 bg-black border border-white/10 text-white">
            <Image className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-white block uppercase tracking-wider text-[11px]">Photos</span>
            <span className="text-[9px] text-zinc-400">PNG, JPG, HEIC</span>
          </div>
        </button>

        <button
          onClick={() => videoInputRef.current?.click()}
          className="p-3 bg-[#0c0c0e] hover:bg-zinc-900 border border-white/10 flex items-center gap-2.5 transition-colors text-left"
        >
          <div className="p-1.5 bg-black border border-white/10 text-white">
            <Video className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-white block uppercase tracking-wider text-[11px]">Videos</span>
            <span className="text-[9px] text-zinc-400">MP4, MOV, 4K</span>
          </div>
        </button>

        <button
          onClick={() => audioInputRef.current?.click()}
          className="p-3 bg-[#0c0c0e] hover:bg-zinc-900 border border-white/10 flex items-center gap-2.5 transition-colors text-left"
        >
          <div className="p-1.5 bg-black border border-white/10 text-white">
            <Music className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-white block uppercase tracking-wider text-[11px]">Music</span>
            <span className="text-[9px] text-zinc-400">Audio files</span>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 bg-[#0c0c0e] hover:bg-zinc-900 border border-white/10 flex items-center gap-2.5 transition-colors text-left"
        >
          <div className="p-1.5 bg-black border border-white/10 text-white">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-white block uppercase tracking-wider text-[11px]">Documents</span>
            <span className="text-[9px] text-zinc-400">PDF, ZIP, DOC</span>
          </div>
        </button>
      </div>
    </div>
  );
};
