import React from 'react';
import { PeerDevice } from '../types/peer';
import { Radio, QrCode, Clipboard, ArrowUpDown, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export type AppView = 'radar' | 'clipboard' | 'transfers';

interface Props {
  selfDevice: PeerDevice;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onOpenQrPairing: () => void;
  onOpenHotspotModal: () => void;
  onOpenDownloadModal: () => void;
  activeTransfersCount: number;
  clipboardItemsCount: number;
}

export const Navbar: React.FC<Props> = ({
  selfDevice,
  currentView,
  onChangeView,
  onOpenQrPairing,
  onOpenHotspotModal,
  onOpenDownloadModal,
  activeTransfersCount,
  clipboardItemsCount,
}) => {
  const views = [
    { id: 'radar' as AppView, label: 'Drop', icon: Radio },
    { id: 'clipboard' as AppView, label: 'Clipboard', icon: Clipboard, badge: clipboardItemsCount },
    { id: 'transfers' as AppView, label: 'Transfers', icon: ArrowUpDown, badge: activeTransfersCount },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand & Clean Segmented Control */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-white text-zinc-950 flex items-center justify-center font-bold text-xs font-mono tracking-tighter">
              H
            </div>
            <span className="font-semibold text-sm tracking-tight text-white font-sans">
              Hop
            </span>
          </div>

          {/* Segmented Control */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-white/[0.08]">
            {views.map((v) => {
              const Icon = v.icon;
              const isActive = currentView === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => onChangeView(v.id)}
                  className={`relative px-3 py-1 text-xs rounded-md transition-colors font-medium flex items-center gap-1.5 ${
                    isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-zinc-800 rounded-md border border-white/10 shadow-sm -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className="w-3.5 h-3.5" />
                  <span>{v.label}</span>
                  {typeof v.badge === 'number' && v.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/15 text-white font-mono font-medium">
                      {v.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Direct P2P Hotspot */}
          <button
            onClick={onOpenHotspotModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/[0.08] transition-colors"
          >
            <span>Direct Mode</span>
          </button>

          {/* Download App */}
          <button
            onClick={onOpenDownloadModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/[0.08] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Get App</span>
          </button>

          {/* Current Device Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-white/[0.06] text-zinc-400 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="truncate max-w-[130px] text-zinc-200">{selfDevice.name}</span>
          </div>

          {/* Pair Phone Button */}
          <button
            onClick={onOpenQrPairing}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Pair Device</span>
          </button>
        </div>
      </div>
    </header>
  );
};
