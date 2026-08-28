import React, { useState } from 'react';
import { X, Wifi, Radio, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-3xl apple-card border border-white/15 p-6 shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 shadow-sm text-white">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white font-sans">
                Direct P2P & Hotspot Transfer
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">No same Wi-Fi required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center p-1 rounded-xl apple-segmented font-mono text-xs">
          <button
            onClick={() => setActiveMode('hotspot')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeMode === 'hotspot' ? 'bg-white/15 text-white font-semibold' : 'text-zinc-400'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Wi-Fi Hotspot (Offline)</span>
          </button>

          <button
            onClick={() => setActiveMode('webrtc')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeMode === 'webrtc' ? 'bg-white/15 text-white font-semibold' : 'text-zinc-400'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>WebRTC (5G / Any Wi-Fi)</span>
          </button>
        </div>

        {/* MODE 1: OFFLINE MOBILE HOTSPOT GUIDE */}
        {activeMode === 'hotspot' && (
          <div className="space-y-3 font-sans text-xs">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-white">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-mono">1</span>
                <span>Turn on Portable Hotspot on Phone</span>
              </div>
              <p className="text-zinc-400 pl-7 text-[11px]">
                On Android: Settings &rarr; Network &rarr; Hotspot. On iPhone: Settings &rarr; Personal Hotspot.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-white">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-mono">2</span>
                <span>Connect your other Phone or Mac to the Hotspot</span>
              </div>
              <p className="text-zinc-400 pl-7 text-[11px]">
                Join the hotspot Wi-Fi. 0 cellular data is consumed during local file transfers!
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-white">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-mono">3</span>
                <span>Open Hop &rarr; Instant 100+ MB/s Drop</span>
              </div>
              <p className="text-zinc-400 pl-7 text-[11px]">
                Hop detects the gateway (192.168.43.1 / 172.20.10.1) and transfers at full Wi-Fi line speed.
              </p>
            </div>
          </div>
        )}

        {/* MODE 2: WEBRTC DIRECT ROOM CODE (5G / Separate Networks) */}
        {activeMode === 'webrtc' && (
          <div className="space-y-4">
            <div className="apple-card rounded-2xl p-4 text-center space-y-2">
              <span className="text-xs text-zinc-400 font-mono block">Your Direct P2P Room Code</span>
              <div className="text-3xl font-mono font-bold text-white tracking-widest bg-black/40 py-2.5 rounded-xl border border-white/10">
                {generatedCode}
              </div>
              <span className="text-[11px] text-zinc-400 block">
                Enter this code on any device connected to 5G, 4G, or any Wi-Fi to establish a direct P2P link.
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
              className="flex gap-2 font-mono text-xs"
            >
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                placeholder="Enter 6-digit room code..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                disabled={!roomInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-semibold font-sans flex items-center gap-1.5 shadow-md disabled:opacity-40"
              >
                <span>Connect</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Direct P2P &bull; Zero Server Storage</span>
        </div>
      </motion.div>
    </div>
  );
};
