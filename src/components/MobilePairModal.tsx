import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, ShieldCheck, Copy, Check, Sparkles, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  localIp: string;
  onOpenMobileSimulator: () => void;
}

export const MobilePairModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpenMobileSimulator,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://hop-transfer.vercel.app';
  const mobileUrl = `${currentOrigin}/?view=mobile`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-3xl apple-card border border-white/15 p-6 shadow-2xl space-y-6"
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
              <p className="text-[11px] text-zinc-400 font-mono">Scan QR to connect instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3 shadow-inner">
          <div className="p-4 bg-white rounded-2xl shadow-xl">
            <QRCodeSVG value={mobileUrl} size={180} level="H" />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="truncate max-w-[260px] text-zinc-300">{mobileUrl}</span>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2 text-xs text-zinc-300 font-sans">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-mono font-bold">1</span>
            <span>Open Camera on iPhone or Chrome / Google Lens on Android.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-mono font-bold">2</span>
            <span>Point at the QR code and tap the link to connect.</span>
          </div>
        </div>

        {/* Action Simulator Button */}
        <button
          onClick={() => {
            onClose();
            onOpenMobileSimulator();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-sky-300 font-sans font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-white/10"
        >
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Test Mobile View on this Screen</span>
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
