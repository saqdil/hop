import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEnterRoomCode?: (code: string) => void;
}

export const HotspotDirectModal: React.FC<Props> = ({ isOpen, onClose, onEnterRoomCode }) => {
  const [activeMode, setActiveMode] = useState<'hotspot' | 'webrtc'>('hotspot');
  const [roomInput, setRoomInput] = useState('');
  const [generatedCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full max-w-md bg-[#0c0c0e] border border-white/15 p-6 space-y-4 shadow-2xl rounded-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-white">
              Direct P2P & Hotspot
            </h3>
            <p className="text-[10px] text-zinc-400">Zero Internet / Offline Transport</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center border border-white/10 bg-black">
          <button
            onClick={() => setActiveMode('hotspot')}
            className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors border-r border-white/10 ${
              activeMode === 'hotspot' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Offline Hotspot
          </button>

          <button
            onClick={() => setActiveMode('webrtc')}
            className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              activeMode === 'webrtc' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Room PIN
          </button>
        </div>

        {/* HOTSPOT GUIDE */}
        {activeMode === 'hotspot' && (
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-black border border-white/10 space-y-1">
              <div className="font-bold text-white uppercase text-[11px]">1. Enable Portable Hotspot</div>
              <p className="text-zinc-400 text-[10px]">
                Turn on Hotspot on your Android or iPhone Settings.
              </p>
            </div>

            <div className="p-3 bg-black border border-white/10 space-y-1">
              <div className="font-bold text-white uppercase text-[11px]">2. Connect Other Device</div>
              <p className="text-zinc-400 text-[10px]">
                Join the hotspot Wi-Fi. 0 cellular data is consumed during local file transfers!
              </p>
            </div>

            <div className="p-3 bg-black border border-white/10 space-y-1">
              <div className="font-bold text-white uppercase text-[11px]">3. Open Hop</div>
              <p className="text-zinc-400 text-[10px]">
                Hop streams files at full local hardware speed (100+ MB/s).
              </p>
            </div>
          </div>
        )}

        {/* WEBRTC PIN */}
        {activeMode === 'webrtc' && (
          <div className="space-y-3">
            <div className="p-4 bg-black border border-white/10 text-center space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">Direct Room PIN</span>
              <div className="text-2xl font-bold text-white tracking-widest py-1">
                {generatedCode}
              </div>
              <span className="text-[10px] text-zinc-400 block">
                Enter this code on any device on 5G, 4G, or Wi-Fi.
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (roomInput.trim() && onEnterRoomCode) {
                  onEnterRoomCode(roomInput.trim());
                  onClose();
                }
              }}
              className="flex gap-1.5"
            >
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                placeholder="Enter 6-digit PIN..."
                className="flex-1 px-3 py-2 bg-black border border-white/15 text-white placeholder-zinc-600 focus:outline-none focus:border-white text-xs rounded-none"
              />
              <button
                type="submit"
                disabled={!roomInput.trim()}
                className="px-4 py-2 bg-white text-black font-bold text-xs uppercase flex items-center gap-1 hover:bg-zinc-200 disabled:opacity-30 rounded-none"
              >
                <span>Connect</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </form>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-zinc-400" />
            <span className="uppercase">Direct P2P Encrypted</span>
          </div>
          <span>v1.0</span>
        </div>
      </motion.div>
    </div>
  );
};
