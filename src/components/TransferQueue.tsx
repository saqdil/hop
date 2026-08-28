import React from 'react';
import { TransferSession } from '../types/transfer';
import { ArrowUpDown, Zap, CheckCircle2, Pause, Play, XCircle, Download, FileText, Smartphone, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  transfers: TransferSession[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onClearHistory: () => void;
}

export const TransferQueue: React.FC<Props> = ({
  transfers,
  onPause,
  onResume,
  onCancel,
  onClearHistory,
}) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownloadFile = (fileName: string) => {
    const blob = new Blob([`Hop Transferred Payload for ${fileName}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="apple-card rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 shadow-sm text-white">
            <ArrowUpDown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2 font-sans">
              Hop Transfer Activity
              <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-white/[0.08] text-zinc-300 border border-white/10">
                {transfers.length} sessions
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Zero-cloud binary streaming direct over local network sockets.
            </p>
          </div>
        </div>

        {transfers.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-zinc-300 text-xs font-mono transition-colors self-start sm:self-auto"
          >
            Clear Finished Transfers
          </button>
        )}
      </div>

      {/* Transfer Sessions List */}
      <div className="space-y-3">
        {transfers.length === 0 ? (
          <div className="apple-card rounded-2xl p-10 text-center space-y-2">
            <ArrowUpDown className="w-8 h-8 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white font-sans">No Active Transfers</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Select a device on the radar and drop files to start an encrypted high-speed LAN hop.
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="apple-card rounded-2xl p-4 space-y-3 font-mono text-xs"
                >
                  {/* Top: Devices & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="text-white font-semibold flex items-center gap-1">
                        <Laptop className="w-3.5 h-3.5 text-sky-400" />
                        {session.sender.name}
                      </span>
                      <span className="text-zinc-600">&rarr;</span>
                      <span className="text-sky-300 font-semibold flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                        {session.receiver.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold text-[11px] flex items-center gap-1">
                          <Zap className="w-3 h-3 animate-pulse" /> {session.speedMBs} MB/s
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Files List in Session */}
                  <div className="space-y-1 bg-black/30 p-2.5 rounded-xl border border-white/[0.06]">
                    {session.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between text-zinc-300">
                        <div className="flex items-center gap-2 truncate mr-2">
                          <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-zinc-400 text-[11px]">{formatBytes(file.size)}</span>
                          {isCompleted && (
                            <button
                              onClick={() => handleDownloadFile(file.name)}
                              className="p-1 rounded bg-white/[0.08] hover:bg-white/20 text-white transition-colors"
                              title="Download to system"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar & ETA */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>
                        {formatBytes(session.transferredBytes)} of {formatBytes(session.totalBytes)} ({session.progressPercent}%)
                      </span>
                      {!isCompleted && <span>ETA: ~{session.etaSeconds}s</span>}
                    </div>

                    <div className="w-full h-2 rounded-full bg-black/40 border border-white/[0.08] overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-sky-400 to-blue-500'
                        }`}
                        style={{ width: `${session.progressPercent}%` }}
                        transition={{ ease: 'linear' }}
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  {!isCompleted && (
                    <div className="flex justify-end gap-2 pt-1">
                      {isTransferring ? (
                        <button
                          onClick={() => onPause(session.id)}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/15 text-zinc-200 transition-colors flex items-center gap-1"
                        >
                          <Pause className="w-3 h-3" /> Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => onResume(session.id)}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/15 text-zinc-200 transition-colors flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> Resume
                        </button>
                      )}

                      <button
                        onClick={() => onCancel(session.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Cancel
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
