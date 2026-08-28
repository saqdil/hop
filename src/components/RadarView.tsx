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
      return <Laptop className="w-4 h-4" />;
    }
    return <Smartphone className="w-4 h-4" />;
  };

  return (
    <div className="relative w-full bg-[#0c0c0e] border border-white/10 p-6 flex flex-col justify-between min-h-[320px] rounded-none shadow-xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-white" />
          <span className="font-mono text-xs uppercase tracking-wider text-white">
            {peers.length > 0 ? `${peers.length} DEVICE CONNECTED` : 'READY TO CONNECT'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {roomPin && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black border border-white/10 font-mono text-xs text-zinc-300">
              <span className="text-zinc-500">PIN:</span>
              <span className="font-bold text-white tracking-widest">{roomPin}</span>
            </div>
          )}

          <button
            onClick={onOpenQrPairing}
            className="px-3 py-1 bg-black hover:bg-zinc-900 text-zinc-200 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 border border-white/10 transition-colors"
          >
            <QrCode className="w-3 h-3" />
            <span>Pair Device</span>
          </button>
        </div>
      </div>

      {/* Center Device Area */}
      <div className="flex-1 flex flex-col items-center justify-center my-6">
        {/* CENTER: SELF */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-black border border-white/20 flex items-center justify-center text-white">
            {selfDevice.platform === 'ios' || selfDevice.platform === 'android' ? (
              <Smartphone className="w-6 h-6" />
            ) : (
              <Laptop className="w-6 h-6" />
            )}
          </div>

          {/* Editable Name */}
          <div className="mt-2.5 flex items-center gap-1.5 text-center">
            {isEditingName ? (
              <div className="flex items-center gap-1 bg-black px-2 py-1 border border-white/20">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="bg-transparent text-xs font-mono font-semibold text-white focus:outline-none w-28 text-center"
                  autoFocus
                />
                <button onClick={handleSaveName} className="text-white hover:text-zinc-300">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors px-2 py-0.5 text-zinc-300 font-mono text-xs"
              >
                <span className="font-bold text-white uppercase">{selfDevice.name}</span>
                <Edit2 className="w-3 h-3 text-zinc-500 hover:text-white" />
              </div>
            )}
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">{selfDevice.deviceModel} &bull; HOST</span>
        </div>

        {/* CONNECTED PEERS */}
        {peers.length > 0 ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <AnimatePresence>
              {peers.map((peer) => {
                const isSelected = selectedPeer?.id === peer.id;
                return (
                  <motion.div
                    key={peer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => onSelectPeer(peer)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-white text-black border-white'
                        : 'bg-black text-white hover:bg-zinc-900 border-white/10'
                    }`}
                  >
                    <div className="p-1 border border-current">
                      {getPlatformIcon(peer.platform)}
                    </div>

                    <div className="text-left font-mono">
                      <div className="font-bold text-xs uppercase truncate max-w-[130px]">
                        {peer.name}
                      </div>
                      <div className="text-[10px] opacity-70 uppercase">
                        CONNECTED
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="mt-4 text-center space-y-1 max-w-sm">
            <p className="text-xs text-zinc-500 font-mono">
              Scan the QR Code on your phone or join via PIN to start dropping files.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Status */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span className="uppercase">Direct P2P Encrypted</span>
        </div>

        {selectedPeer ? (
          <div className="flex items-center gap-1 text-white font-bold uppercase">
            <Send className="w-3 h-3" />
            <span>Target: {selectedPeer.name}</span>
          </div>
        ) : (
          <span className="uppercase">Select device to drop</span>
        )}
      </div>
    </div>
  );
};
