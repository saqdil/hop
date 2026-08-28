import React, { useState } from 'react';
import { PeerDevice } from '../types/peer';
import { motion, AnimatePresence } from 'framer-motion';
import { Laptop, Smartphone, QrCode, Edit2, Check, Send, ShieldCheck } from 'lucide-react';

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
    <div className="relative w-full rounded-2xl bg-[#121214] border border-white/[0.08] p-6 sm:p-8 overflow-hidden min-h-[380px] flex flex-col justify-between shadow-xl">
      {/* Background Subtle Circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[180px] h-[180px] rounded-full border border-white/10" />
        <div className="w-[340px] h-[340px] rounded-full border border-white/5" />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-xs text-white">
            {peers.length > 0 ? `${peers.length} Device Connected` : 'Ready to Connect'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {roomPin && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-white/10 font-mono text-xs text-zinc-300">
              <span className="text-zinc-500">PIN:</span>
              <span className="font-bold text-white tracking-widest">{roomPin}</span>
            </div>
          )}

          <button
            onClick={onOpenQrPairing}
            className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium flex items-center gap-1.5 border border-white/10 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Pair Device</span>
          </button>
        </div>
      </div>

      {/* Center Device Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-6">
        {/* CENTER: SELF */}
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/15 flex items-center justify-center text-zinc-200 shadow-md">
            {selfDevice.platform === 'ios' || selfDevice.platform === 'android' ? (
              <Smartphone className="w-7 h-7" />
            ) : (
              <Laptop className="w-7 h-7" />
            )}
          </div>

          {/* Editable Name */}
          <div className="mt-2.5 flex items-center gap-1.5 text-center">
            {isEditingName ? (
              <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-lg border border-white/20">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="bg-transparent text-xs font-semibold text-white focus:outline-none w-28 text-center"
                  autoFocus
                />
                <button onClick={handleSaveName} className="text-white hover:text-zinc-300">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors px-2 py-0.5 rounded-md text-zinc-300"
              >
                <span className="font-semibold text-xs">{selfDevice.name}</span>
                <Edit2 className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
              </div>
            )}
          </div>
          <span className="text-[10px] font-mono text-zinc-500">{selfDevice.deviceModel} &bull; This Device</span>
        </div>

        {/* CONNECTED PEERS */}
        {peers.length > 0 ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <AnimatePresence>
              {peers.map((peer) => {
                const isSelected = selectedPeer?.id === peer.id;
                return (
                  <motion.div
                    key={peer.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => onSelectPeer(peer)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-zinc-800 border border-white/20 shadow-md'
                        : 'bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-white border border-white/10">
                      {getPlatformIcon(peer.platform)}
                    </div>

                    <div className="text-left">
                      <div className="font-semibold text-xs text-white truncate max-w-[130px]">
                        {peer.name}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="mt-6 text-center space-y-1 max-w-sm">
            <p className="text-xs text-zinc-400">
              Scan the QR Code on your phone or join via PIN to start dropping files directly.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Status */}
      <div className="relative z-10 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>Encrypted Peer-to-Peer</span>
        </div>

        {selectedPeer ? (
          <div className="flex items-center gap-1 text-zinc-200 font-semibold">
            <Send className="w-3.5 h-3.5" />
            <span>Target: {selectedPeer.name}</span>
          </div>
        ) : (
          <span>Select or connect a device to drop</span>
        )}
      </div>
    </div>
  );
};
