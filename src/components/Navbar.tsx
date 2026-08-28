import React from 'react';
import { PeerDevice } from '../types/peer';
import { Radio, QrCode, Clipboard, ArrowUpDown, Download } from 'lucide-react';

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
    { id: 'radar' as AppView, label: 'DROP', icon: Radio },
    { id: 'clipboard' as AppView, label: 'CLIPBOARD', icon: Clipboard, badge: clipboardItemsCount },
    { id: 'transfers' as AppView, label: 'TRANSFERS', icon: ArrowUpDown, badge: activeTransfersCount },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#050507]/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-13 flex items-center justify-between">
        {/* Brand & Tabs */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm tracking-widest text-white uppercase">
              HOP<span className="text-zinc-500">_</span>
            </span>
          </div>

          {/* Minimal Tabs */}
          <div className="flex items-center border border-white/10 bg-black">
            {views.map((v) => {
              const Icon = v.icon;
              const isActive = currentView === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => onChangeView(v.id)}
                  className={`relative px-3.5 py-1.5 text-[11px] font-mono tracking-wider transition-colors flex items-center gap-1.5 border-r last:border-r-0 border-white/10 ${
                    isActive ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{v.label}</span>
                  {typeof v.badge === 'number' && v.badge > 0 && (
                    <span className={`px-1 text-[9px] font-mono ${isActive ? 'bg-black text-white' : 'bg-white/15 text-zinc-300'}`}>
                      {v.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {/* Direct Mode */}
          <button
            onClick={onOpenHotspotModal}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-black hover:bg-zinc-900 text-zinc-300 border border-white/10 text-[11px] uppercase tracking-wider transition-colors"
          >
            <span>Direct</span>
          </button>

          {/* Get App */}
          <button
            onClick={onOpenDownloadModal}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-black hover:bg-zinc-900 text-zinc-300 border border-white/10 text-[11px] uppercase tracking-wider transition-colors"
          >
            <Download className="w-3 h-3 text-zinc-400" />
            <span>Install</span>
          </button>

          {/* Current Device Tag */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-black border border-white/10 text-zinc-400 text-[11px]">
            <span className="w-1.5 h-1.5 bg-white" />
            <span className="truncate max-w-[120px] text-zinc-200 uppercase">{selfDevice.name}</span>
          </div>

          {/* Pair Phone Button */}
          <button
            onClick={onOpenQrPairing}
            className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Pair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
