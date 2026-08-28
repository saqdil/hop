import React, { useState } from 'react';
import { PeerDevice } from '../types/peer';
import { motion, AnimatePresence } from 'framer-motion';
import { Laptop, Smartphone, QrCode, Edit2, Check, Radio, Send, ShieldCheck } from 'lucide-react';

interface Props {
  selfDevice: PeerDevice;
  peers: PeerDevice[];
  selectedPeer: PeerDevice | null;
  onSelectPeer: (peer: PeerDevice) => void;
  onOpenQrPairing: () => void;
  onUpdateDeviceName?: (name: string) => void;
  roomPin?: string;
}

export const RadarView: React.FC<Props> = ({
  selfDevice,
  peers,
  selectedPeer,
  onSelectPeer,
  onOpenQrPairing,
  onUpdateDeviceName,
  roomPin,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(selfDevice.name);

  const handleSaveName = () => {
    if (tempName.trim() && onUpdateDeviceName) {
      onUpdateDeviceName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === 'mac' || platform === 'windows' || platform === 'linux') {
      return <Laptop className="w-5 h-5" />;
    }
    return <Smartphone className="w-5 h-5" />;
  };

  return (
    <div className="relative w-full rounded-3xl apple-card border border-white/[0.08] p-6 sm:p-8 overflow-hidden min-h-[440px] flex flex-col justify-between shadow-2xl">
      {/* Background Animated Concentric Radar Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[180px] h-[180px] rounded-full border border-sky-400/20 animate-ping opacity-25" style={{ animationDuration: '4s' }} />
        <div className="w-[320px] h-[320px] rounded-full border border-white/[0.05]" />
        <div className="w-[460px] h-[460px] rounded-full border border-white/[0.03]" />
      </div>

      {/* Top Bar: Room PIN & Quick Actions */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-sm">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-xs text-white block">P2P Radar</span>
            <span className="text-[11px] text-zinc-400 font-mono">
              {peers.length > 0 ? `${peers.length} device(s) connected` : 'Ready to pair'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {roomPin && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-zinc-300">
              <span className="text-zinc-500">PIN:</span>
              <span className="font-bold text-sky-400 tracking-wider">{roomPin}</span>
            </div>
          )}

          <button
            onClick={onOpenQrPairing}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-sky-300 font-sans font-semibold text-xs flex items-center gap-1.5 border border-white/10 shadow-sm active:scale-[0.98] transition-all"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Connect Phone</span>
          </button>
        </div>
      </div>

      {/* Center Radar Orbit */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-6">
        {/* CENTER: YOU */}
        <div className="relative flex flex-col items-center group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 p-0.5 shadow-xl flex items-center justify-center cursor-pointer"
          >
            <div className="w-full h-full rounded-full bg-[#161618] flex flex-col items-center justify-center text-white">
              {selfDevice.platform === 'ios' || selfDevice.platform === 'android' ? (
                <Smartphone className="w-7 h-7 text-sky-400" />
              ) : (
                <Laptop className="w-7 h-7 text-sky-400" />
              )}
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase mt-0.5">YOU</span>
            </div>
          </motion.div>

          {/* Editable Device Name */}
          <div className="mt-2.5 flex items-center gap-1.5 text-center">
            {isEditingName ? (
              <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-lg border border-sky-400/50">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="bg-transparent text-xs font-semibold text-white focus:outline-none w-28 text-center"
                  autoFocus
                />
                <button onClick={handleSaveName} className="text-emerald-400 hover:text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-1.5 cursor-pointer hover:text-sky-300 transition-colors px-2 py-0.5 rounded-md hover:bg-white/[0.05]"
              >
                <span className="font-semibold text-xs text-white">{selfDevice.name}</span>
                <Edit2 className="w-3 h-3 text-zinc-500 hover:text-sky-400" />
              </div>
            )}
          </div>
          <span className="text-[10px] font-mono text-zinc-500">{selfDevice.deviceModel}</span>
        </div>

        {/* CONNECTED REMOTE PEERS */}
        {peers.length > 0 ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <AnimatePresence>
              {peers.map((peer) => {
                const isSelected = selectedPeer?.id === peer.id;
                return (
                  <motion.div
                    key={peer.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => onSelectPeer(peer)}
                    className={`flex flex-col items-center p-3.5 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-500/15 border border-sky-400/40 shadow-lg scale-105'
                        : 'bg-black/30 hover:bg-black/50 border border-white/[0.08]'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-[#1c1c1e] border border-white/15 flex items-center justify-center text-sky-400 shadow-md">
                        {getPlatformIcon(peer.platform)}
                      </div>
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
                    </div>

                    <span className="mt-2 font-semibold text-xs text-white truncate max-w-[120px]">
                      {peer.name}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">Connected</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="mt-6 text-center space-y-2 max-w-sm">
            <p className="text-xs text-zinc-400 font-sans">
              Scan the QR Code on your phone to connect and drop files directly at maximum speed.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Status / Selection Helper */}
      <div className="relative z-10 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Direct Encrypted P2P (No Cloud Uploads)</span>
        </div>

        {selectedPeer ? (
          <div className="flex items-center gap-1 text-sky-300 font-semibold">
            <Send className="w-3.5 h-3.5" />
            <span>Target: {selectedPeer.name}</span>
          </div>
        ) : (
          <span>Select or connect a device above to drop</span>
        )}
      </div>
    </div>
  );
};
