import React from 'react';
import { PeerDevice } from '../types/peer';
import { Smartphone, Laptop, Monitor, Battery, Check, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  selfDevice: PeerDevice;
  peers: PeerDevice[];
  selectedPeer: PeerDevice | null;
  onSelectPeer: (peer: PeerDevice) => void;
  onOpenQrPairing: () => void;
}

export const RadarView: React.FC<Props> = ({
  selfDevice,
  peers,
  selectedPeer,
  onSelectPeer,
  onOpenQrPairing,
}) => {
  const getDeviceIcon = (platform: PeerDevice['platform']) => {
    switch (platform) {
      case 'ios':
      case 'android':
        return Smartphone;
      case 'mac':
      case 'linux':
        return Laptop;
      default:
        return Monitor;
    }
  };

  // Fixed orbital positioning for discovered peers
  const peerPositions = [
    { top: '18%', left: '22%' },
    { top: '22%', right: '20%' },
    { bottom: '22%', left: '24%' },
    { bottom: '18%', right: '22%' },
  ];

  return (
    <div className="relative w-full rounded-3xl apple-card p-6 md:p-8 flex flex-col items-center justify-between min-h-[440px] overflow-hidden">
      {/* Radar Background Pulsing Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Wave 1 */}
        <div className="absolute w-48 h-48 rounded-full border border-sky-400/30 radar-wave" />
        {/* Wave 2 */}
        <div className="absolute w-48 h-48 rounded-full border border-sky-400/20 radar-wave-delayed-1" />
        {/* Wave 3 */}
        <div className="absolute w-48 h-48 rounded-full border border-sky-400/10 radar-wave-delayed-2" />

        {/* Static concentric radar lines */}
        <div className="w-[180px] h-[180px] rounded-full border border-white/[0.06]" />
        <div className="w-[300px] h-[300px] rounded-full border border-white/[0.05]" />
        <div className="w-[420px] h-[420px] rounded-full border border-white/[0.04]" />
      </div>

      {/* Top Header Information */}
      <div className="relative z-10 w-full flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
          <span>Scanning local network ({selfDevice.ip.split('.').slice(0, 3).join('.')}.*)</span>
        </div>

        <button
          onClick={onOpenQrPairing}
          className="text-xs font-mono text-sky-400 hover:text-sky-300 underline underline-offset-4 transition-colors"
        >
          Don't see your phone? Pair via QR Code &rarr;
        </button>
      </div>

      {/* Center Radar Circle: Self Device */}
      <div className="relative z-20 my-auto flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative w-20 h-20 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 p-[2px] shadow-2xl flex items-center justify-center cursor-pointer"
        >
          <div className="w-full h-full rounded-full bg-[#161618] flex flex-col items-center justify-center text-white">
            <span className="text-xl font-bold font-mono uppercase">
              {selfDevice.name.slice(0, 2)}
            </span>
            <span className="text-[9px] font-mono text-sky-400 font-semibold mt-0.5">YOU</span>
          </div>
        </motion.div>

        <div className="mt-2.5 text-center">
          <div className="text-sm font-semibold text-white font-sans">{selfDevice.name}</div>
          <div className="text-[11px] font-mono text-zinc-400">{selfDevice.deviceModel}</div>
        </div>
      </div>

      {/* Discovered Orbiting Peers */}
      {peers.map((peer, idx) => {
        const Icon = getDeviceIcon(peer.platform);
        const isSelected = selectedPeer?.id === peer.id;
        const pos = peerPositions[idx % peerPositions.length];

        return (
          <motion.div
            key={peer.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
            style={{
              position: 'absolute',
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              right: pos.right,
            }}
            className="z-20 cursor-pointer"
            onClick={() => onSelectPeer(peer)}
          >
            <div className="flex flex-col items-center group">
              <div
                className={`relative w-14 h-14 rounded-full p-[2px] transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-sky-400 to-blue-600 scale-110 shadow-lg shadow-sky-500/20'
                    : 'bg-white/10 group-hover:bg-white/20 group-hover:scale-105'
                }`}
              >
                <div className="w-full h-full rounded-full bg-[#1c1c1e] flex items-center justify-center text-zinc-200">
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-sky-300' : 'text-zinc-300'}`} />
                </div>

                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>

              <div className="mt-1.5 text-center max-w-[110px]">
                <span className={`text-xs font-semibold block truncate ${isSelected ? 'text-sky-300' : 'text-white'}`}>
                  {peer.name}
                </span>
                <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-zinc-400">
                  <span>{peer.platform.toUpperCase()}</span>
                  {typeof peer.batteryPercent === 'number' && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-emerald-400">
                        <Battery className="w-2.5 h-2.5" />
                        {peer.batteryPercent}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Bottom Hint */}
      <div className="relative z-10 w-full text-center">
        <span className="text-xs text-zinc-400 font-mono">
          {selectedPeer
            ? `Target device selected: ${selectedPeer.name} (${selectedPeer.deviceModel})`
            : 'Click any device in your radar to send files or clipboard'}
        </span>
      </div>
    </div>
  );
};
