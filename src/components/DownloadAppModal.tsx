import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Apple, Monitor, Download, ShieldCheck } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full max-w-lg bg-[#0c0c0e] border border-white/15 p-6 space-y-4 shadow-2xl rounded-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-white">
              Install Hop Client
            </h3>
            <p className="text-[10px] text-zinc-400">Android &bull; iOS &bull; Desktop</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border border-white/10 bg-black">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 border-r border-white/10 ${
              activeTab === 'android' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 border-r border-white/10 ${
              activeTab === 'ios' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iOS</span>
          </button>

          <button
            onClick={() => setActiveTab('pc')}
            className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'pc' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>

        {/* TAB 1: ANDROID */}
        {activeTab === 'android' && (
          <div className="space-y-3">
            <div className="p-4 bg-black border border-white/10 flex flex-col sm:flex-row items-center gap-4">
              <div className="p-2 bg-white rounded-none shrink-0">
                <QRCodeSVG value={mobileUrl} size={110} level="H" />
              </div>
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="font-bold text-white text-xs uppercase">Install on Android</div>
                <p className="text-[10px] text-zinc-400">
                  Installs directly into your app drawer with standalone window and full hardware access.
                </p>
                <button
                  onClick={handleInstallApp}
                  className="w-full py-2 px-3 bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-zinc-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{installed ? 'Installed' : 'Install Android App'}</span>
                </button>
              </div>
            </div>

            <div className="text-[10px] text-zinc-400 bg-black p-3 border border-white/10 space-y-1">
              <div className="text-white uppercase font-bold">Installation:</div>
              <div>1. Open <strong>{currentOrigin}</strong> in Chrome on your phone.</div>
              <div>2. Tap <strong>"Install App"</strong> in the banner &rarr; Hop places onto your Home Screen.</div>
            </div>
          </div>
        )}

        {/* TAB 2: iOS */}
        {activeTab === 'ios' && (
          <div className="space-y-3">
            <div className="p-4 bg-black border border-white/10 flex flex-col sm:flex-row items-center gap-4">
              <div className="p-2 bg-white rounded-none shrink-0">
                <QRCodeSVG value={mobileUrl} size={110} level="H" />
              </div>
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="font-bold text-white text-xs uppercase">Install on iPhone / iPad</div>
                <p className="text-[10px] text-zinc-400">
                  Runs as a standalone full-screen iOS application without App Store limits.
                </p>
                <div className="text-[10px] text-zinc-300 break-all">{mobileUrl}</div>
              </div>
            </div>

            <div className="text-[10px] text-zinc-400 bg-black p-3 border border-white/10 space-y-1">
              <div>1. Open Safari on iPhone and scan or visit URL above.</div>
              <div>2. Tap <strong>Share</strong> &rarr; <strong>"Add to Home Screen"</strong>.</div>
            </div>
          </div>
        )}

        {/* TAB 3: DESKTOP */}
        {activeTab === 'pc' && (
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-black border border-white/10 space-y-1">
              <div className="font-bold text-white uppercase text-[11px]">Web Studio for PC & Mac</div>
              <p className="text-zinc-400 text-[10px]">
                Access Hop instantly in any modern browser on Windows, macOS, or Linux.
              </p>
              <div className="p-2 bg-zinc-900 text-zinc-200 text-[10px] break-all border border-white/5">
                {currentOrigin}
              </div>
            </div>

            <div className="p-3 bg-black border border-white/10 space-y-1">
              <div className="font-bold text-white uppercase text-[11px]">Install as Desktop App</div>
              <p className="text-zinc-400 text-[10px]">
                Click the <strong>Install App</strong> icon in your browser address bar to pin Hop to Windows Taskbar or Mac Dock.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-zinc-400" />
            <span className="uppercase">100% P2P Encrypted</span>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:underline uppercase"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
