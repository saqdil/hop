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
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="rounded-2xl bg-[#121214] border border-white/[0.08] p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-200">
            <ArrowUpDown className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              Transfer Activity
              <span className="text-[11px] font-mono px-2 py-0.2 rounded-md bg-zinc-900 text-zinc-400 border border-white/[0.06]">
                {transfers.length}
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Encrypted direct peer-to-peer streaming
            </p>
          </div>
        </div>

        {transfers.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors border border-white/[0.06]"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Transfer Sessions List */}
      <div className="space-y-3">
        {transfers.length === 0 ? (
          <div className="rounded-2xl bg-[#121214] border border-white/[0.08] p-10 text-center space-y-2">
            <ArrowUpDown className="w-6 h-6 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Active Transfers</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
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
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="rounded-2xl bg-[#121214] border border-white/[0.08] p-4 space-y-3 font-mono text-xs"
                >
                  {/* Top: Devices & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="text-white font-medium flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-zinc-400" />
                        {session.sender.name}
                      </span>
                      <span className="text-zinc-600">&rarr;</span>
                      <span className="text-white font-medium flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                        {session.receiver.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-emerald-400 border border-white/10 font-bold text-[11px] flex items-center gap-1">
                          <Check className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-200 border border-white/10 font-medium text-[11px]">
                          {session.speedMBs} MB/s
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Files List */}
                  <div className="space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/[0.06]">
                    {session.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between text-zinc-300">
                        <div className="flex items-center gap-2 truncate mr-2">
                          <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-zinc-500 text-[11px]">{formatBytes(file.size)}</span>
                          {isCompleted && (
                            <div className="flex items-center gap-1">
                              {onPreviewFile && (
                                <button
                                  onClick={() => onPreviewFile(file)}
                                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                                  title="Preview"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDownloadFile(file)}
                                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
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
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>
                        {formatBytes(session.transferredBytes)} of {formatBytes(session.totalBytes)} ({session.progressPercent}%)
                      </span>
                      <span>{formatETA(session)}</span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-zinc-900 border border-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full bg-white transition-all duration-150"
                        style={{ width: `${session.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  {!isCompleted && (
                    <div className="flex justify-end gap-2 pt-1">
                      {isTransferring ? (
                        <button
                          onClick={() => onPause(session.id)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors flex items-center gap-1 border border-white/[0.06]"
                        >
                          <Pause className="w-3 h-3" /> Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => onResume(session.id)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors flex items-center gap-1 border border-white/[0.06]"
                        >
                          <Play className="w-3 h-3" /> Resume
                        </button>
                      )}

                      <button
                        onClick={() => onCancel(session.id)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-rose-400 transition-colors flex items-center gap-1 border border-white/[0.06]"
                      >
                        <X className="w-3 h-3" /> Cancel
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
