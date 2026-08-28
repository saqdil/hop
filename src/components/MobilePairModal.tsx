import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full max-w-sm bg-[#0c0c0e] border border-white/15 p-6 space-y-5 shadow-2xl rounded-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-white font-bold">
              Pair Device
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">Scan QR or enter PIN</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Room PIN */}
        {roomPin && (
          <div className="p-3 bg-black border border-white/10 text-center space-y-0.5">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Room PIN</span>
            <div className="text-2xl font-mono font-bold tracking-widest text-white">
              {roomPin}
            </div>
          </div>
        )}

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center p-4 bg-black border border-white/10 space-y-3">
          <div className="p-2 bg-white rounded-none">
            <QRCodeSVG value={mobileUrl} size={160} level="H" />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono w-full justify-between pt-1">
            <span className="truncate max-w-[220px] text-zinc-300 text-[11px]">{mobileUrl}</span>
            <button
              onClick={handleCopy}
              className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Manual Connect */}
        <form onSubmit={handleManualConnect} className="space-y-1.5">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Connect to target PIN</span>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={manualPin}
              onChange={(e) => setManualPin(e.target.value)}
              placeholder="e.g. 549396"
              className="flex-1 px-3 py-2 bg-black border border-white/15 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-white rounded-none"
            />
            <button
              type="submit"
              disabled={!manualPin.trim()}
              className="px-4 py-2 bg-white text-black font-mono font-bold text-xs flex items-center gap-1 hover:bg-zinc-200 disabled:opacity-30 rounded-none transition-colors"
            >
              <span>Join</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </form>

        {/* Simulator */}
        <button
          onClick={() => {
            onClose();
            onOpenMobileSimulator();
          }}
          className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs border border-white/10 transition-colors rounded-none"
        >
          Open Mobile Simulator
        </button>

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-white/10">
          <span>P2P Encrypted</span>
          <span>Zero Server Storage</span>
        </div>
      </motion.div>
    </div>
  );
};
