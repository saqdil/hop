import React from 'react';
import { PeerDevice } from '../types/peer';
import { Radio, QrCode, Clipboard, ArrowUpDown, Laptop, Smartphone, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

export type AppView = 'radar' | 'clipboard' | 'transfers';

interface Props {
  selfDevice: PeerDevice;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onOpenQrPairing: () => void;
  activeTransfersCount: number;
  clipboardItemsCount: number;
}

export const Navbar: React.FC<Props> = ({
  selfDevice,
  currentView,
  onChangeView,
  onOpenQrPairing,
  activeTransfersCount,
  clipboardItemsCount,
}) => {
  const views = [
    { id: 'radar' as AppView, label: 'AirDrop Radar', icon: Radio },
    { id: 'clipboard' as AppView, label: 'Live Clipboard', icon: Clipboard, badge: clipboardItemsCount },
    { id: 'transfers' as AppView, label: 'Transfers', icon: ArrowUpDown, badge: activeTransfersCount },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#161618]/75 backdrop-blur-3xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand & Segmented Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-sm">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white font-mono hidden sm:inline">
              AirDrop<span className="text-sky-400">X</span>
            </span>
          </div>

          {/* Apple HIG Segmented Control Switcher */}
          <div className="flex items-center p-1 rounded-xl apple-segmented">
            {views.map((v) => {
              const Icon = v.icon;
              const isActive = currentView === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => onChangeView(v.id)}
                  className={`relative px-3.5 py-1 text-xs rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
                    isActive ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-[#3a3a3c]/90 rounded-lg border border-white/15 shadow-sm -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <Icon className="w-3.5 h-3.5" />
                  <span>{v.label}</span>
                  {typeof v.badge === 'number' && v.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500/30 text-sky-200 font-mono font-bold">
                      {v.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Controls: Device Status & QR Mobile Pair */}
        <div className="flex items-center gap-2.5 font-mono text-xs">
          {/* LAN IP & Device Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.06] border border-white/[0.08] text-zinc-300 text-[11px]">
            {selfDevice.platform === 'mac' ? (
              <Laptop className="w-3.5 h-3.5 text-zinc-400" />
            ) : selfDevice.platform === 'ios' || selfDevice.platform === 'android' ? (
              <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
            ) : (
              <Laptop className="w-3.5 h-3.5 text-zinc-400" />
            )}
            <span className="font-semibold text-white truncate max-w-[120px]">{selfDevice.name}</span>
            <span className="text-zinc-500">•</span>
            <div className="flex items-center gap-1 text-emerald-400">
              <Wifi className="w-3 h-3" />
              <span>{selfDevice.ip}</span>
            </div>
          </div>

          {/* QR Code Pair Button (Instant iPhone & Android Pairing) */}
          <button
            onClick={onOpenQrPairing}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white font-sans font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-[0.98]"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Pair Phone</span>
          </button>
        </div>
      </div>
    </header>
  );
};
