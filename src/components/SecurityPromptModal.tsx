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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full max-w-md bg-[#0c0c0e] border border-white/15 p-6 space-y-4 shadow-2xl rounded-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white" />
            <h3 className="font-bold text-xs uppercase tracking-widest text-white">
              Connection Request
            </h3>
          </div>

          <div className="px-1.5 py-0.5 border border-white/20 text-white text-[9px] uppercase">
            <Lock className="w-2.5 h-2.5 inline mr-1" />
            <span>AES-256</span>
          </div>
        </div>

        {/* Sender Device Card */}
        <div className="p-3 bg-black border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DeviceIcon className="w-4 h-4 text-white" />
              <span className="font-bold text-xs text-white uppercase">{request.sender.name}</span>
            </div>
            <span className="text-[9px] uppercase border border-white/10 px-1 text-zinc-400">
              {request.sender.platform}
            </span>
          </div>

          <div className="text-[11px] text-zinc-300">
            {request.action === 'file_transfer' && (
              <span>Wants to drop files: <strong>{request.details}</strong></span>
            )}
            {request.action === 'clipboard_push' && (
              <span>Wants to sync clipboard: <strong>{request.details}</strong></span>
            )}
            {request.action === 'peer_pairing' && (
              <span>Wants to pair with this device.</span>
            )}
          </div>
        </div>

        {/* Security PIN Code Confirmation */}
        <div className="text-center p-3 bg-black border border-white/10 space-y-0.5">
          <span className="text-[9px] uppercase text-zinc-500 tracking-widest block">Security PIN</span>
          <div className="text-xl font-bold tracking-widest text-white">
            {request.pin}
          </div>
        </div>

        {/* Trust Toggle */}
        <label className="flex items-center gap-2 text-[11px] text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={trustAlways}
            onChange={(e) => setTrustAlways(e.target.checked)}
            className="rounded-none bg-black border-white/20 text-white"
          />
          <span>Always trust this device on this network</span>
        </label>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onDecline(request)}
            className="flex-1 py-2 bg-black hover:bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white text-xs uppercase font-bold flex items-center justify-center gap-1 rounded-none transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Decline</span>
          </button>

          <button
            onClick={() => onAllow(request, trustAlways)}
            className="flex-1 py-2 bg-white hover:bg-zinc-200 text-black text-xs uppercase font-bold flex items-center justify-center gap-1 rounded-none transition-colors"
          >
            <Check className="w-3 h-3" />
            <span>Accept</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
