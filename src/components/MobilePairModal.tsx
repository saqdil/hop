import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Copy, Check, ExternalLink, ShieldCheck, Wifi, Edit3 } from 'lucide-react';
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
  localIp,
  onOpenMobileSimulator,
}) => {
  const [customIp, setCustomIp] = useState<string>(localIp || '192.168.1.102');
  const [port] = useState<string>(window.location.port || '5180');
  const [isEditingIp, setIsEditingIp] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const mobileUrl = `http://${customIp}:${port}/?view=mobile`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        className="w-full max-w-md rounded-3xl apple-card border border-white/15 p-6 shadow-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 shadow-sm text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white font-sans">
                Pair iPhone or Android
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">Zero app install required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* IP Host Config Bar */}
        <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.06] flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            {isEditingIp ? (
              <input
                type="text"
                value={customIp}
                onChange={(e) => setCustomIp(e.target.value)}
                placeholder="192.168.1.102"
                className="w-36 h-6 px-1.5 rounded bg-zinc-800 text-white focus:outline-none focus:border-sky-400 border border-white/10"
              />
            ) : (
              <span>Host IP: <strong className="text-white">{customIp}</strong>:{port}</span>
            )}
          </div>

          <button
            onClick={() => setIsEditingIp(!isEditingIp)}
            className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <Edit3 className="w-3 h-3" />
            {isEditingIp ? 'Done' : 'Change IP'}
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white text-zinc-950 shadow-inner space-y-2.5">
          <QRCodeSVG
            value={mobileUrl}
            size={180}
            level="H"
            includeMargin={false}
          />
          <div className="text-center font-mono text-[11px] text-zinc-600 font-medium break-all">
            {mobileUrl}
          </div>
        </div>

        {/* Steps Guide */}
        <div className="space-y-2 text-xs text-zinc-300 font-sans">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/30 border border-white/[0.06]">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold flex items-center justify-center shrink-0">1</span>
            <span>Make sure your phone is connected to the same Wi-Fi (<strong>TL-WA850RE</strong>).</span>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/30 border border-white/[0.06]">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold flex items-center justify-center shrink-0">2</span>
            <span>Scan with phone Camera or type <strong>http://{customIp}:{port}/?view=mobile</strong> in Chrome/Safari.</span>
          </div>
        </div>

        {/* Direct Link Actions */}
        <div className="flex gap-2 font-mono text-xs">
          <button
            onClick={handleCopyUrl}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white flex items-center justify-center gap-1.5 transition-colors border border-white/10"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'URL Copied' : 'Copy Direct URL'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenMobileSimulator();
            }}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-sans font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-[0.98]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mobile View</span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Local Wi-Fi P2P &bull; 0 Cloud Uploads</span>
        </div>
      </motion.div>
    </div>
  );
};
