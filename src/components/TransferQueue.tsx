import React from 'react';
import { TransferSession, FileItem } from '../types/transfer';
import { ArrowUpDown, Check, Pause, Play, X, Download, FileText, Smartphone, Laptop, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  transfers: TransferSession[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onClearHistory: () => void;
  onPreviewFile?: (file: FileItem) => void;
}

export const TransferQueue: React.FC<Props> = ({
  transfers,
  onPause,
  onResume,
  onCancel,
  onClearHistory,
  onPreviewFile,
}) => {
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatETA = (session: TransferSession) => {
    if (session.status === 'completed') return '';
    const remainingBytes = Math.max(0, session.totalBytes - session.transferredBytes);
    const speedBytesPerSec = (session.speedMBs || 1) * 1024 * 1024;
    const seconds = speedBytesPerSec > 0 ? Math.ceil(remainingBytes / speedBytesPerSec) : 0;

    if (seconds <= 0) return 'Almost done...';
    if (seconds < 60) return `ETA: ${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const remSec = seconds % 60;
    return `ETA: ${mins}m ${remSec.toString().padStart(2, '0')}s`;
  };

  const handleDownloadFile = (file: FileItem) => {
    const url = file.blobUrl || file.previewUrl || file.downloadUrl || (file.rawFile ? URL.createObjectURL(file.rawFile) : '');
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
    } else if (file.rawBlob) {
      const blobUrl = URL.createObjectURL(file.rawBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(blobUrl);
    }
  };

  return (
    <div className="space-y-3 font-mono">
      {/* Header */}
      <div className="bg-[#0c0c0e] border border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-black border border-white/10 flex items-center justify-center text-white">
            <ArrowUpDown className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              Transfer Activity
              <span className="text-[10px] px-1.5 py-0.2 bg-black border border-white/10 text-zinc-400">
                {transfers.length}
              </span>
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase">
              Direct P2P Encrypted Stream
            </p>
          </div>
        </div>

        {transfers.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-2.5 py-1 bg-black hover:bg-zinc-900 text-zinc-300 text-[10px] uppercase tracking-wider transition-colors border border-white/10"
          >
            Clear
          </button>
        )}
      </div>

      {/* Transfer Sessions List */}
      <div className="space-y-2">
        {transfers.length === 0 ? (
          <div className="bg-[#0c0c0e] border border-white/10 p-8 text-center space-y-1">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">No Active Transfers</h3>
            <p className="text-[11px] text-zinc-500">
              Select a device and drop files to start an instant transfer.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {transfers.map((session) => {
              const isCompleted = session.status === 'completed';
              const isTransferring = session.status === 'transferring';

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#0c0c0e] border border-white/10 p-3.5 space-y-2.5 text-xs"
                >
                  {/* Top: Devices & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="text-white font-bold flex items-center gap-1 uppercase text-[11px]">
                        <Laptop className="w-3 h-3 text-zinc-400" />
                        {session.sender.name}
                      </span>
                      <span className="text-zinc-600">&rarr;</span>
                      <span className="text-white font-bold flex items-center gap-1 uppercase text-[11px]">
                        <Smartphone className="w-3 h-3 text-zinc-400" />
                        {session.receiver.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <span className="px-1.5 py-0.5 bg-black text-white border border-white/20 font-bold text-[10px] uppercase flex items-center gap-1">
                          <Check className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-black text-white border border-white/20 font-bold text-[10px]">
                          {session.speedMBs} MB/s
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Files List */}
                  <div className="space-y-1 bg-black p-2 border border-white/10">
                    {session.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between text-zinc-300">
                        <div className="flex items-center gap-2 truncate mr-2">
                          <FileText className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate text-[11px]">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-zinc-500 text-[10px]">{formatBytes(file.size)}</span>
                          {isCompleted && (
                            <div className="flex items-center gap-1">
                              {onPreviewFile && (
                                <button
                                  onClick={() => onPreviewFile(file)}
                                  className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 transition-colors"
                                  title="Preview"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDownloadFile(file)}
                                className="p-1 bg-white text-black hover:bg-zinc-200 transition-colors font-bold"
                                title="Download"
                              >
                                <Download className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar & Calculated ETA */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>
                        {formatBytes(session.transferredBytes)} of {formatBytes(session.totalBytes)} ({session.progressPercent}%)
                      </span>
                      <span>{formatETA(session)}</span>
                    </div>

                    <div className="w-full h-1 bg-black border border-white/10 overflow-hidden">
                      <motion.div
                        className="h-full bg-white transition-all duration-150"
                        style={{ width: `${session.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  {!isCompleted && (
                    <div className="flex justify-end gap-1.5 pt-1">
                      {isTransferring ? (
                        <button
                          onClick={() => onPause(session.id)}
                          className="px-2 py-0.5 bg-black hover:bg-zinc-900 text-zinc-300 transition-colors flex items-center gap-1 border border-white/10 text-[10px] uppercase"
                        >
                          <Pause className="w-2.5 h-2.5" /> Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => onResume(session.id)}
                          className="px-2 py-0.5 bg-black hover:bg-zinc-900 text-zinc-300 transition-colors flex items-center gap-1 border border-white/10 text-[10px] uppercase"
                        >
                          <Play className="w-2.5 h-2.5" /> Resume
                        </button>
                      )}

                      <button
                        onClick={() => onCancel(session.id)}
                        className="px-2 py-0.5 bg-black hover:bg-zinc-900 text-zinc-300 transition-colors flex items-center gap-1 border border-white/10 text-[10px] uppercase"
                      >
                        <X className="w-2.5 h-2.5" /> Cancel
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
