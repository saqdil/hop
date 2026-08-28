import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Apple, Monitor, Download, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  localIp?: string;
  deferredInstallPrompt?: any;
}

export const DownloadAppModal: React.FC<Props> = ({
  isOpen,
  onClose,
  deferredInstallPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'pc'>('android');
  const [installed, setInstalled] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://hop-transfer.vercel.app';
  const mobileUrl = `${currentOrigin}/?view=mobile`;

  const handleInstallApp = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
    } else {
      alert(`To install on Android:\n1. Open ${currentOrigin} on your phone\n2. Tap the Chrome menu (⋮) -> Install app or Add to Home Screen.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl rounded-3xl apple-card border border-white/15 p-6 shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 shadow-sm text-white">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white font-sans">
                Install Hop Application
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">Android App &bull; iOS App &bull; PC Web Studio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 rounded-xl apple-segmented font-mono text-xs">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'android' ? 'bg-white/15 text-white font-semibold' : 'text-zinc-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'ios' ? 'bg-white/15 text-white font-semibold' : 'text-zinc-400'
            }`}
          >
            <Apple className="w-3.5 h-3.5 text-zinc-200" />
            <span>iOS (iPhone)</span>
          </button>

          <button
            onClick={() => setActiveTab('pc')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'pc' ? 'bg-white/15 text-white font-semibold' : 'text-zinc-400'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-sky-400" />
            <span>PC & Mac</span>
          </button>
        </div>

        {/* TAB 1: ANDROID APP */}
        {activeTab === 'android' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 bg-white rounded-xl shrink-0">
                <QRCodeSVG value={mobileUrl} size={110} level="H" />
              </div>
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="font-semibold text-white text-xs">1-Tap Android Native Installation</div>
                <p className="text-[11px] text-zinc-400">
                  Installs directly into your Android app drawer with full camera roll, clipboard, and Wi-Fi capabilities.
                </p>
                <button
                  onClick={handleInstallApp}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{installed ? 'App Installed!' : 'Install Hop on Android'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-300 font-sans bg-black/30 p-3 rounded-2xl border border-white/[0.06]">
              <div className="font-semibold text-zinc-200 text-[11px]">How it works on Android:</div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">✓</span>
                <span>Open <strong>{currentOrigin}</strong> in Chrome on your phone.</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">✓</span>
                <span>Tap <strong>"Install App"</strong> in the banner &rarr; Android automatically places Hop on your Home Screen!</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: iOS APP */}
        {activeTab === 'ios' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 bg-white rounded-xl shrink-0">
                <QRCodeSVG value={mobileUrl} size={110} level="H" />
              </div>
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="font-semibold text-white text-xs">Install on iPhone / iPad</div>
                <p className="text-[11px] text-zinc-400">
                  Runs as a standalone full-screen iOS application without App Store restrictions.
                </p>
                <div className="text-[11px] font-mono text-sky-400 break-all">{mobileUrl}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-300 font-sans bg-black/30 p-3.5 rounded-2xl border border-white/[0.06]">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-mono shrink-0">1</span>
                <span>Open Safari on your iPhone and scan or visit the URL above.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-mono shrink-0">2</span>
                <span>Tap the <strong>Share</strong> button at the bottom of Safari &rarr; Tap <strong>"Add to Home Screen"</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-mono shrink-0">3</span>
                <span>Hop will now appear on your Home Screen as a native app!</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PC WEBSITE & DESKTOP */}
        {activeTab === 'pc' && (
          <div className="space-y-3 text-xs font-sans">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
              <div className="font-semibold text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-sky-400" />
                <span>Web Studio for PC & Mac</span>
              </div>
              <p className="text-zinc-400 text-[11px]">
                Access Hop instantly in any browser (Chrome, Edge, Safari, Firefox, Brave, Arc) on Windows, macOS, or Linux.
              </p>
              <div className="p-2 rounded-xl bg-black/50 font-mono text-sky-300 text-[11px] break-all">
                {currentOrigin}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
              <div className="font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 fill-white text-sky-400" />
                <span>Install as Desktop App (Chrome / Edge)</span>
              </div>
              <p className="text-zinc-400 text-[11px]">
                Click the <strong>Install App</strong> icon in your browser's address bar (top right) to pin Hop to your Windows Taskbar or macOS Dock.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% P2P &bull; No Tracking</span>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:text-sky-300"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
