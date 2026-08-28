import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, ShieldCheck, Copy, Check, Sparkles, Globe, ArrowRight, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  localIp: string;
  roomPin: string;
  onOpenMobileSimulator: () => void;
  onConnectToPin?: (pin: string) => void;
}

export const MobilePairModal: React.FC<Props> = ({
  isOpen,
  onClose,
  roomPin,
  onOpenMobileSimulator,
  onConnectToPin,
}) => {
  const [copied, setCopied] = useState(false);
  const [manualPin, setManualPin] = useState('');

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://hop-transfer.vercel.app';
  const mobileUrl = `${currentOrigin}/?join=${roomPin || '123456'}&view=mobile`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualPin.trim() && onConnectToPin) {
      onConnectToPin(manualPin.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-3xl apple-card border border-white/15 p-6 shadow-2xl space-y-5"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 shadow-sm text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white font-sans">
                Pair Phone (Android & iOS)
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">Scan QR or enter Room PIN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PIN Code Badge */}
        {roomPin && (
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] text-center space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Your Room PIN</span>
            <div className="text-3xl font-mono font-bold tracking-widest text-sky-400">
              {roomPin}
            </div>
          </div>
        )}

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3 shadow-inner">
          <div className="p-3.5 bg-white rounded-2xl shadow-xl">
            <QRCodeSVG value={mobileUrl} size={170} level="H" />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="truncate max-w-[240px] text-zinc-300">{mobileUrl}</span>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Manual PIN Input Option */}
        <form onSubmit={handleManualConnect} className="space-y-1.5">
          <span className="text-[10px] font-mono text-zinc-400 block">Or Connect to another device PIN:</span>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <KeyRound className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                value={manualPin}
                onChange={(e) => setManualPin(e.target.value)}
                placeholder="Enter 6-digit PIN..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400"
              />
            </div>
            <button
              type="submit"
              disabled={!manualPin.trim()}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-sans font-bold text-xs flex items-center gap-1 disabled:opacity-40 shadow-sm"
            >
              <span>Join</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Action Simulator Button */}
        <button
          onClick={() => {
            onClose();
            onOpenMobileSimulator();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-sky-300 font-sans font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-white/10"
        >
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Open Mobile Simulator</span>
        </button>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Direct P2P</span>
          </div>
          <span>v1.0 Studio</span>
        </div>
      </motion.div>
    </div>
  );
};
