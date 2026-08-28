import React from 'react';
import { PeerDevice } from '../types/peer';
import { ShieldCheck, X, Check, Laptop, Smartphone, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export interface SecurityRequest {
  id: string;
  sender: PeerDevice;
  action: 'file_transfer' | 'clipboard_push' | 'peer_pairing';
  details: string;
  pin: string;
  timestamp: number;
}

interface Props {
  request: SecurityRequest | null;
  onAllow: (request: SecurityRequest, trustAlways: boolean) => void;
  onDecline: (request: SecurityRequest) => void;
}

export const SecurityPromptModal: React.FC<Props> = ({ request, onAllow, onDecline }) => {
  const [trustAlways, setTrustAlways] = React.useState(false);

  if (!request) return null;

  const DeviceIcon = request.sender.platform === 'ios' || request.sender.platform === 'android' ? Smartphone : Laptop;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="w-full max-w-md rounded-3xl apple-card border border-sky-400/30 p-6 shadow-2xl space-y-5 bg-gradient-to-b from-[#1c1c1e] to-[#121214]"
      >
        {/* Top Shield Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-sans">
                Incoming Connection Request
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">End-to-End Encrypted Link</p>
            </div>
          </div>

          <div className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>AES-256</span>
          </div>
        </div>

        {/* Sender Device Card */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DeviceIcon className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-xs text-white">{request.sender.name}</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase bg-white/[0.06] px-2 py-0.5 rounded-md">
              {request.sender.platform}
            </span>
          </div>

          <div className="text-xs text-zinc-300 font-sans">
            {request.action === 'file_transfer' && (
              <span>Wants to drop files to your device: <strong>{request.details}</strong></span>
            )}
            {request.action === 'clipboard_push' && (
              <span>Wants to sync clipboard snippet: <strong>{request.details}</strong></span>
            )}
            {request.action === 'peer_pairing' && (
              <span>Wants to pair with this device.</span>
            )}
          </div>

          <div className="text-[10px] font-mono text-zinc-500">
            Network IP: {request.sender.ip}
          </div>
        </div>

        {/* Security PIN Code Confirmation */}
        <div className="text-center p-3 rounded-2xl bg-[#242426] border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 block">Security Verification Code</span>
          <div className="text-2xl font-mono font-bold tracking-widest text-sky-300">
            {request.pin}
          </div>
          <span className="text-[10px] text-zinc-500">Verify this matches the code on the sending screen</span>
        </div>

        {/* Trust Toggle */}
        <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer font-sans select-none">
          <input
            type="checkbox"
            checked={trustAlways}
            onChange={(e) => setTrustAlways(e.target.checked)}
            className="w-4 h-4 rounded bg-zinc-800 border-white/20 text-sky-500 focus:ring-0"
          />
          <span>Always trust this device on this Wi-Fi (skip prompt next time)</span>
        </label>

        {/* Action Buttons */}
        <div className="flex gap-2.5 font-sans">
          <button
            onClick={() => onDecline(request)}
            className="flex-1 py-3 rounded-2xl bg-white/[0.08] hover:bg-rose-500/20 text-zinc-300 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/10"
          >
            <X className="w-4 h-4" />
            <span>Decline</span>
          </button>

          <button
            onClick={() => onAllow(request, trustAlways)}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-[0.98] transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Accept & Connect</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
