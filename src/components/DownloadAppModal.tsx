import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Apple, Monitor, Download, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  localIp: string;
}

export const DownloadAppModal: React.FC<Props> = ({ isOpen, onClose, localIp }) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'pc'>('android');
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const mobileUrl = `http://${localIp || '192.168.1.102'}:5180/?view=mobile`;

  const handleDownloadApk = () => {
    setDownloading(true);
    const a = document.createElement('a');
    a.href = '/hop-v1.0.apk';
    a.download = 'hop-v1.0.apk';
    a.click();
    setTimeout(() => setDownloading(false), 2000);
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
                Download Hop Apps
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">Android APK &bull; iOS App &bull; PC Web</p>
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
            <span>Android (APK)</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'ios' ? 'bg-white/15 text-white font-semibold' : 'text-zinc-400'
            }`}
          >
            <Apple className="w-3.5 h-3.5 text-zinc-200" />
            <span>iOS (iPhone / iPad)</span>
          </button>

          <button
            onClick={() => setActiveTab('pc')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'pc' ? 'bg-white/15 text-white font-semibold' : 'text-zinc-400'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-sky-400" />
            <span>PC & Mac Website</span>
          </button>
        </div>

        {/* TAB 1: ANDROID APK */}
        {activeTab === 'android' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 bg-white rounded-xl shrink-0">
                <QRCodeSVG value={mobileUrl} size={110} level="H" />
              </div>
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="font-semibold text-white text-xs">Scan or Download APK Directly</div>
                <p className="text-[11px] text-zinc-400">
                  Direct installation for Android devices (Samsung, Pixel, Xiaomi, OnePlus, Motorola).
                </p>
                <button
                  onClick={handleDownloadApk}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloading ? 'Downloading APK...' : 'Download Hop APK (v1.0)'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-300 font-sans bg-black/30 p-3 rounded-2xl border border-white/[0.06]">
              <div className="font-semibold text-zinc-200 text-[11px]">Installation Steps:</div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-white text-[10px]">1</span>
                <span>Download the <strong>hop-v1.0.apk</strong> on your phone.</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-white text-[10px]">2</span>
                <span>Tap notification &rarr; Select <strong>Install</strong> (enable "Install unknown apps" if prompted).</span>
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
              <div className="p-2 rounded-xl bg-black/50 font-mono text-sky-300 text-[11px]">
                http://localhost:5180 &bull; http://{localIp}:5180
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
