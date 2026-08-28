import React, { useState, useEffect } from 'react';
import { PeerDevice } from './types/peer';
import { FileItem, TransferSession, ClipboardItem } from './types/transfer';
import { getOrCreateSelfDevice, getInitialPeers } from './engine/discoveryBeacon';
import { loadClipboardVault, saveClipboardVault, createClipboardItem } from './engine/clipboardEngine';
import { p2pManager } from './engine/p2pEngine';
import { lanSync } from './engine/lanSync';
import { webrtcManager } from './engine/webrtcEngine';
import { Navbar, AppView } from './components/Navbar';
import { RadarView } from './components/RadarView';
import { FileDropZone } from './components/FileDropZone';
import { TransferQueue } from './components/TransferQueue';
import { ClipboardSync } from './components/ClipboardSync';
import { MobilePairModal } from './components/MobilePairModal';
import { HotspotDirectModal } from './components/HotspotDirectModal';
import { MediaViewerModal } from './components/MediaViewerModal';
import { DownloadAppModal } from './components/DownloadAppModal';
import { SecurityPromptModal, SecurityRequest } from './components/SecurityPromptModal';
import { MobileView } from './components/mobile/MobileView';
import confetti from 'canvas-confetti';

const STORAGE_KEY_TRUSTED = 'hop_trusted_devices';

export const App: React.FC = () => {
  const [selfDevice] = useState<PeerDevice>(() => getOrCreateSelfDevice());
  const [peers, setPeers] = useState<PeerDevice[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<PeerDevice | null>(null);
  const [trustedDevices, setTrustedDevices] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_TRUSTED) || '[]');
    } catch {
      return [];
    }
  });

  // Active View & Mobile Auto-Detection
  const [currentView, setCurrentView] = useState<AppView>('radar');
  const [isMobileMode, setIsMobileMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'mobile') return true;
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || window.innerWidth < 768;
  });

  // Transfers & Clipboard
  const [transfers, setTransfers] = useState<TransferSession[]>([]);
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>(() => loadClipboardVault());
  const [autoSyncClipboard, setAutoSyncClipboard] = useState<boolean>(true);

  // Modals & Prompts
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isHotspotModalOpen, setIsHotspotModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [pendingSecurityRequest, setPendingSecurityRequest] = useState<SecurityRequest | null>(null);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // Capture Android Chrome WebAPK install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const initial = getInitialPeers(selfDevice.id);
    setPeers(initial);
    if (initial.length > 0) {
      setSelectedPeer(initial[0]);
    }

    // Initialize LAN Sync WebSocket Bridge
    lanSync.init(selfDevice);

    const unsubPeers = lanSync.onPeers((lanPeers) => {
      if (lanPeers && lanPeers.length > 0) {
        const others = lanPeers.filter((p) => p.id !== selfDevice.id);
        if (others.length > 0) {
          setPeers(others);
        }
      }
    });

    const unsubClip = lanSync.onClipboard((item) => {
      setClipboardItems((prev) => {
        if (prev.some((i) => i.id === item.id || i.text === item.text)) return prev;
        return [item, ...prev];
      });

      if (autoSyncClipboard) {
        try {
          navigator.clipboard.writeText(item.text);
        } catch {
          // ignore
        }
      }
    });

    const unsubFile = lanSync.onFile((fileRecord) => {
      const incomingFile: FileItem = {
        id: fileRecord.id,
        name: fileRecord.name,
        size: fileRecord.size,
        type: fileRecord.type,
        downloadUrl: fileRecord.downloadUrl,
        blobUrl: fileRecord.downloadUrl,
        previewUrl: fileRecord.type?.startsWith('image/') ? fileRecord.downloadUrl : undefined,
      };

      const incomingSender: PeerDevice = {
        id: fileRecord.sender?.name ? `dev_${fileRecord.sender.name}` : 'remote_sender',
        name: fileRecord.sender?.name || 'Remote Device',
        platform: fileRecord.sender?.platform || 'mobile',
        deviceModel: 'Connected Device',
        ip: window.location.hostname,
        status: 'online',
        lastSeen: Date.now(),
        avatarSeed: 'sender',
      };

      const session: TransferSession = {
        id: `rx_${Date.now()}`,
        sender: incomingSender,
        receiver: selfDevice,
        files: [incomingFile],
        totalBytes: fileRecord.size,
        transferredBytes: fileRecord.size,
        speedMBs: 94.2,
        progressPercent: 100,
        status: 'completed',
        startedAt: Date.now() - 500,
        completedAt: Date.now(),
        etaSeconds: 0,
      };

      // Check if trusted, else trigger security connection prompt
      const senderKey = `${incomingSender.name}_${incomingSender.ip}`;
      if (!trustedDevices.includes(senderKey) && !trustedDevices.includes('all')) {
        setPendingSecurityRequest({
          id: `req_${Date.now()}`,
          sender: incomingSender,
          action: 'file_transfer',
          details: `${fileRecord.name} (${Math.round(fileRecord.size / 1024)} KB)`,
          pin: Math.floor(1000 + Math.random() * 9000).toString(),
          timestamp: Date.now(),
        });
      }

      setTransfers((prev) => [session, ...prev]);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    });

    // Setup WebRTC Handlers
    webrtcManager.onComplete((session) => {
      setTransfers((prev) => [session, ...prev]);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    });

    webrtcManager.onClipboard((text) => {
      const item = createClipboardItem(text, {
        id: 'p2p_peer',
        name: 'Direct P2P Peer',
        platform: 'android',
        deviceModel: 'Phone',
        ip: 'P2P',
        status: 'online',
        lastSeen: Date.now(),
        avatarSeed: 'p2p',
      });
      setClipboardItems((prev) => [item, ...prev]);
    });

    return () => {
      unsubPeers();
      unsubClip();
      unsubFile();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [selfDevice, autoSyncClipboard, trustedDevices]);

  // Save clipboard updates
  useEffect(() => {
    saveClipboardVault(clipboardItems);
  }, [clipboardItems]);

  const handleSecurityAllow = (request: SecurityRequest, trustAlways: boolean) => {
    if (trustAlways) {
      const senderKey = `${request.sender.name}_${request.sender.ip}`;
      const updated = [...trustedDevices, senderKey];
      setTrustedDevices(updated);
      localStorage.setItem(STORAGE_KEY_TRUSTED, JSON.stringify(updated));
    }
    setPendingSecurityRequest(null);
  };

  const handleSecurityDecline = (_request: SecurityRequest) => {
    setPendingSecurityRequest(null);
  };

  // --- ACTIONS ---
  const handleSendFiles = async (files: FileItem[]) => {
    if (!selectedPeer) return;

    const session = p2pManager.createTransfer(selfDevice, selectedPeer, files);
    setTransfers((prev) => [session, ...prev]);
    setCurrentView('transfers');

    for (const f of files) {
      try {
        await lanSync.uploadFile(f, selfDevice);
        await webrtcManager.sendFileDirect(f);
      } catch {
        // fallback
      }
    }

    p2pManager.startStreaming(
      session.id,
      (updated) => {
        setTransfers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      },
      (completed) => {
        setTransfers((prev) => prev.map((t) => (t.id === completed.id ? completed : t)));
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
      }
    );
  };

  const handleMobileSendFiles = async (files: FileItem[]) => {
    const desktopPeer = peers.find((p) => p.platform === 'mac' || p.platform === 'windows') || selfDevice;
    const session = p2pManager.createTransfer(selfDevice, desktopPeer, files);
    setTransfers((prev) => [session, ...prev]);

    for (const f of files) {
      try {
        await lanSync.uploadFile(f, selfDevice);
        await webrtcManager.sendFileDirect(f);
      } catch {
        // fallback
      }
    }

    p2pManager.startStreaming(
      session.id,
      (updated) => {
        setTransfers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      },
      (completed) => {
        setTransfers((prev) => prev.map((t) => (t.id === completed.id ? completed : t)));
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
      }
    );
  };

  const handleAddClipboardItem = (text: string) => {
    const item = createClipboardItem(text, selfDevice);
    setClipboardItems((prev) => [item, ...prev]);

    lanSync.broadcastClipboard(item);
    webrtcManager.sendClipboardDirect(text);

    if (autoSyncClipboard) {
      try {
        navigator.clipboard.writeText(text);
      } catch {
        // ignore
      }
    }
  };

  const handleTogglePin = (id: string) => {
    setClipboardItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item))
    );
  };

  const handleDeleteClipboardItem = (id: string) => {
    setClipboardItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearClipboard = () => {
    if (window.confirm('Clear all clipboard history?')) {
      setClipboardItems([]);
    }
  };

  const handlePauseTransfer = (id: string) => {
    p2pManager.pauseTransfer(id);
    setTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'paused' } : t))
    );
  };

  const handleResumeTransfer = (id: string) => {
    p2pManager.startStreaming(
      id,
      (updated) => {
        setTransfers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      },
      (completed) => {
        setTransfers((prev) => prev.map((t) => (t.id === completed.id ? completed : t)));
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
      }
    );
  };

  const handleCancelTransfer = (id: string) => {
    p2pManager.cancelTransfer(id);
    setTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'cancelled' } : t))
    );
  };

  const handleClearTransfers = () => {
    setTransfers((prev) => prev.filter((t) => t.status === 'transferring'));
  };

  // IF IN MOBILE VIEW MODE (iPhone / Android)
  if (isMobileMode) {
    const targetDesktop = peers.find((p) => p.platform === 'mac' || p.platform === 'windows') || selfDevice;
    return (
      <>
        <MobileView
          selfDevice={selfDevice}
          targetDesktop={targetDesktop}
          clipboardItems={clipboardItems}
          transfers={transfers}
          onSendFilesToDesktop={handleMobileSendFiles}
          onSendClipboardText={handleAddClipboardItem}
          onOpenHotspotModal={() => setIsHotspotModalOpen(true)}
          onPreviewFile={(f) => setPreviewFile(f)}
          onExitMobileView={() => setIsMobileMode(false)}
        />

        <HotspotDirectModal
          isOpen={isHotspotModalOpen}
          onClose={() => setIsHotspotModalOpen(false)}
        />

        <MediaViewerModal
          file={previewFile}
          isOpen={Boolean(previewFile)}
          onClose={() => setPreviewFile(null)}
        />

        <SecurityPromptModal
          request={pendingSecurityRequest}
          onAllow={handleSecurityAllow}
          onDecline={handleSecurityDecline}
        />
      </>
    );
  }

  // DESKTOP STUDIO MODE (Windows / macOS / Linux)
  const activeTransfersCount = transfers.filter((t) => t.status === 'transferring').length;

  return (
    <div className="min-h-screen relative flex flex-col font-sans bg-[#09090b]">
      <Navbar
        selfDevice={selfDevice}
        currentView={currentView}
        onChangeView={setCurrentView}
        onOpenQrPairing={() => setIsQrModalOpen(true)}
        onOpenHotspotModal={() => setIsHotspotModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        activeTransfersCount={activeTransfersCount}
        clipboardItemsCount={clipboardItems.length}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* VIEW 1: RADAR & FILE DROP */}
        {currentView === 'radar' && (
          <div className="space-y-6">
            <RadarView
              selfDevice={selfDevice}
              peers={peers}
              selectedPeer={selectedPeer}
              onSelectPeer={setSelectedPeer}
              onOpenQrPairing={() => setIsQrModalOpen(true)}
            />

            <FileDropZone
              selectedPeer={selectedPeer}
              onSendFiles={handleSendFiles}
            />
          </div>
        )}

        {/* VIEW 2: UNIVERSAL LIVE CLIPBOARD */}
        {currentView === 'clipboard' && (
          <ClipboardSync
            clipboardItems={clipboardItems}
            onAddClipboardItem={handleAddClipboardItem}
            onTogglePin={handleTogglePin}
            onDeleteItem={handleDeleteClipboardItem}
            onClearAll={handleClearClipboard}
            autoSyncEnabled={autoSyncClipboard}
            onToggleAutoSync={() => setAutoSyncClipboard(!autoSyncClipboard)}
          />
        )}

        {/* VIEW 3: TRANSFERS QUEUE */}
        {currentView === 'transfers' && (
          <TransferQueue
            transfers={transfers}
            onPause={handlePauseTransfer}
            onResume={handleResumeTransfer}
            onCancel={handleCancelTransfer}
            onClearHistory={handleClearTransfers}
            onPreviewFile={(f) => setPreviewFile(f)}
          />
        )}
      </main>

      {/* MODALS */}
      <MobilePairModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        localIp={selfDevice.ip}
        onOpenMobileSimulator={() => setIsMobileMode(true)}
      />

      <HotspotDirectModal
        isOpen={isHotspotModalOpen}
        onClose={() => setIsHotspotModalOpen(false)}
      />

      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        localIp={selfDevice.ip}
        deferredInstallPrompt={deferredInstallPrompt}
      />

      <MediaViewerModal
        file={previewFile}
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
      />

      <SecurityPromptModal
        request={pendingSecurityRequest}
        onAllow={handleSecurityAllow}
        onDecline={handleSecurityDecline}
      />

      <footer className="border-t border-white/[0.08] py-5 text-center text-xs text-zinc-500 font-mono">
        Hop &bull; direct P2P drop &amp; shared clipboard &bull; zero cloud &bull; Android APK &bull; iOS App &bull; PC Web Studio
      </footer>
    </div>
  );
};
