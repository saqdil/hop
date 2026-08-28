import React, { useState, useEffect, useRef } from 'react';
import { PeerDevice } from './types/peer';
import { FileItem, TransferSession, ClipboardItem } from './types/transfer';
import { getRealDevice, saveCustomDeviceName } from './engine/deviceDetector';
import { loadClipboardVault, saveClipboardVault, createClipboardItem } from './engine/clipboardEngine';
import { PeerEngine } from './engine/peerEngine';
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

const STORAGE_KEY_TRUSTED = 'hop_trusted_devices';

export const App: React.FC = () => {
  const [selfDevice, setSelfDevice] = useState<PeerDevice>(() => getRealDevice());
  const [peers, setPeers] = useState<PeerDevice[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<PeerDevice | null>(null);
  const [roomPin, setRoomPin] = useState<string>('');

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

  const peerEngineRef = useRef<PeerEngine | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Initialize PeerEngine
    const engine = new PeerEngine(selfDevice);
    peerEngineRef.current = engine;

    const urlParams = new URLSearchParams(window.location.search);
    const joinTarget = urlParams.get('join');

    engine.init().then((peerId) => {
      const pin = peerId.replace('hop-', '') || '123456';
      setRoomPin(pin);

      // If opened via QR scan with ?join=XXXXXX, connect to host automatically!
      if (joinTarget) {
        setTimeout(() => {
          engine.connectToPeer(joinTarget);
        }, 800);
      }
    });

    // Subscriptions
    const unsubConnect = engine.onConnect((remoteDevice) => {
      setPeers((prev) => {
        const filtered = prev.filter((p) => p.id !== remoteDevice.id);
        return [...filtered, remoteDevice];
      });
      setSelectedPeer(remoteDevice);
    });

    const unsubDisconnect = engine.onDisconnect((remotePeerId) => {
      setPeers((prev) => prev.filter((p) => p.id !== remotePeerId));
      setSelectedPeer((prev) => (prev?.id === remotePeerId ? null : prev));
    });

    // Handle Live Incoming Progress on Receiver
    const unsubProgress = engine.onFileProgress((file, percent, speedMBs, etaSeconds) => {
      setTransfers((prev) => {
        const existing = prev.find((t) => t.files.some((f) => f.id === file.id));
        if (existing) {
          return prev.map((t) =>
            t.id === existing.id
              ? {
                  ...t,
                  progressPercent: percent,
                  transferredBytes: Math.round((t.totalBytes * percent) / 100),
                  speedMBs,
                  etaSeconds,
                }
              : t
          );
        } else {
          const targetSender = peers[0] || {
            id: 'remote',
            name: 'Connected Device',
            platform: 'windows',
            deviceModel: 'PC',
            ip: 'P2P',
            status: 'online',
            lastSeen: Date.now(),
            avatarSeed: 'rx',
          };

          const incomingSession: TransferSession = {
            id: `rx_${file.id}`,
            sender: targetSender,
            receiver: selfDevice,
            files: [file],
            totalBytes: file.size,
            transferredBytes: Math.round((file.size * percent) / 100),
            speedMBs,
            progressPercent: percent,
            status: percent >= 100 ? 'completed' : 'transferring',
            startedAt: Date.now(),
            etaSeconds,
            connectionMode: 'webrtc',
          };
          return [incomingSession, ...prev];
        }
      });
    });

    const unsubFileComplete = engine.onFileComplete((_completedFile, session) => {
      setTransfers((prev) => {
        const withoutPartial = prev.filter((t) => !t.files.some((f) => f.id === session.files[0]?.id));
        return [session, ...withoutPartial];
      });
    });

    const unsubClipboard = engine.onClipboard((item) => {
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

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubProgress();
      unsubFileComplete();
      unsubClipboard();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [selfDevice, autoSyncClipboard, peers]);

  // Save clipboard updates
  useEffect(() => {
    saveClipboardVault(clipboardItems);
  }, [clipboardItems]);

  const handleUpdateDeviceName = (newName: string) => {
    saveCustomDeviceName(newName);
    const updated = { ...selfDevice, name: newName };
    setSelfDevice(updated);
    if (peerEngineRef.current) {
      peerEngineRef.current.updateSelfDevice(updated);
    }
  };

  const handleConnectToPin = (pin: string) => {
    if (peerEngineRef.current && pin.trim()) {
      peerEngineRef.current.connectToPeer(pin.trim());
    }
  };

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
    if (!selectedPeer || !peerEngineRef.current) {
      alert('Please connect a device first by scanning the QR code or entering a PIN!');
      return;
    }

    const session: TransferSession = {
      id: `tx_${Date.now()}`,
      sender: selfDevice,
      receiver: selectedPeer,
      files,
      totalBytes: files.reduce((acc, f) => acc + f.size, 0),
      transferredBytes: 0,
      speedMBs: 0,
      progressPercent: 0,
      status: 'transferring',
      startedAt: Date.now(),
      etaSeconds: 0,
      connectionMode: 'webrtc',
    };

    setTransfers((prev) => [session, ...prev]);
    setCurrentView('transfers');

    for (const f of files) {
      try {
        await peerEngineRef.current.sendFile(selectedPeer.id, f, (percent, speed, eta) => {
          setTransfers((prev) =>
            prev.map((t) => {
              if (t.id !== session.id) return t;
              const transferred = Math.round((t.totalBytes * percent) / 100);
              return {
                ...t,
                progressPercent: percent,
                transferredBytes: transferred,
                speedMBs: speed,
                etaSeconds: eta,
              };
            })
          );
        });
      } catch (err: any) {
        console.error('File send error:', err);
      }
    }

    setTransfers((prev) =>
      prev.map((t) => (t.id === session.id ? { ...t, progressPercent: 100, status: 'completed', completedAt: Date.now(), etaSeconds: 0 } : t))
    );
  };

  const handleMobileSendFiles = async (files: FileItem[]) => {
    const target = peers[0] || selectedPeer;
    if (!target || !peerEngineRef.current) {
      alert('No device connected yet! Please scan the QR code on your PC.');
      return;
    }

    const session: TransferSession = {
      id: `tx_m_${Date.now()}`,
      sender: selfDevice,
      receiver: target,
      files,
      totalBytes: files.reduce((acc, f) => acc + f.size, 0),
      transferredBytes: 0,
      speedMBs: 0,
      progressPercent: 0,
      status: 'transferring',
      startedAt: Date.now(),
      etaSeconds: 0,
      connectionMode: 'webrtc',
    };

    setTransfers((prev) => [session, ...prev]);

    for (const f of files) {
      try {
        await peerEngineRef.current.sendFile(target.id, f, (percent, speed, eta) => {
          setTransfers((prev) =>
            prev.map((t) => {
              if (t.id !== session.id) return t;
              const transferred = Math.round((t.totalBytes * percent) / 100);
              return {
                ...t,
                progressPercent: percent,
                transferredBytes: transferred,
                speedMBs: speed,
                etaSeconds: eta,
              };
            })
          );
        });
      } catch (err: any) {
        console.error('Mobile send error:', err);
      }
    }

    setTransfers((prev) =>
      prev.map((t) => (t.id === session.id ? { ...t, progressPercent: 100, status: 'completed', completedAt: Date.now(), etaSeconds: 0 } : t))
    );
  };

  const handleAddClipboardItem = (text: string) => {
    const item = createClipboardItem(text, selfDevice);
    setClipboardItems((prev) => [item, ...prev]);

    if (peerEngineRef.current && selectedPeer) {
      peerEngineRef.current.sendClipboard(selectedPeer.id, item);
    }

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

  const handleClearTransfers = () => {
    setTransfers((prev) => prev.filter((t) => t.status === 'transferring'));
  };

  // IF IN MOBILE VIEW MODE (iPhone / Android)
  if (isMobileMode) {
    const targetDesktop = peers[0] || selectedPeer;
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
          onUpdateDeviceName={handleUpdateDeviceName}
          onOpenQrPairing={() => setIsQrModalOpen(true)}
        />

        <HotspotDirectModal
          isOpen={isHotspotModalOpen}
          onClose={() => setIsHotspotModalOpen(false)}
          onEnterRoomCode={(code) => handleConnectToPin(code)}
        />

        <MobilePairModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          localIp={selfDevice.ip}
          roomPin={roomPin}
          onOpenMobileSimulator={() => setIsMobileMode(true)}
          onConnectToPin={handleConnectToPin}
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

  // DESKTOP STUDIO MODE
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* VIEW 1: RADAR & FILE DROP */}
        {currentView === 'radar' && (
          <div className="space-y-4">
            <RadarView
              selfDevice={selfDevice}
              peers={peers}
              selectedPeer={selectedPeer}
              onSelectPeer={setSelectedPeer}
              onOpenQrPairing={() => setIsQrModalOpen(true)}
              onUpdateDeviceName={handleUpdateDeviceName}
              roomPin={roomPin}
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
            onPause={() => {}}
            onResume={() => {}}
            onCancel={() => {}}
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
        roomPin={roomPin}
        onOpenMobileSimulator={() => setIsMobileMode(true)}
        onConnectToPin={handleConnectToPin}
      />

      <HotspotDirectModal
        isOpen={isHotspotModalOpen}
        onClose={() => setIsHotspotModalOpen(false)}
        onEnterRoomCode={(code) => handleConnectToPin(code)}
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

      <footer className="border-t border-white/[0.06] py-5 text-center text-xs text-zinc-600 font-mono">
        Hop &bull; direct encrypted peer-to-peer streaming
      </footer>
    </div>
  );
};
