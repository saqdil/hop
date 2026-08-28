import React, { useState, useEffect } from 'react';
import { PeerDevice } from './types/peer';
import { FileItem, TransferSession, ClipboardItem } from './types/transfer';
import { getOrCreateSelfDevice, getInitialPeers } from './engine/discoveryBeacon';
import { loadClipboardVault, saveClipboardVault, createClipboardItem } from './engine/clipboardEngine';
import { p2pManager } from './engine/p2pEngine';
import { Navbar, AppView } from './components/Navbar';
import { RadarView } from './components/RadarView';
import { FileDropZone } from './components/FileDropZone';
import { TransferQueue } from './components/TransferQueue';
import { ClipboardSync } from './components/ClipboardSync';
import { MobilePairModal } from './components/MobilePairModal';
import { MobileView } from './components/mobile/MobileView';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [selfDevice] = useState<PeerDevice>(() => getOrCreateSelfDevice());
  const [peers, setPeers] = useState<PeerDevice[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<PeerDevice | null>(null);

  // Active View
  const [currentView, setCurrentView] = useState<AppView>('radar');
  const [isMobileMode, setIsMobileMode] = useState<boolean>(false);

  // Transfers & Clipboard
  const [transfers, setTransfers] = useState<TransferSession[]>([]);
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>(() => loadClipboardVault());
  const [autoSyncClipboard, setAutoSyncClipboard] = useState<boolean>(true);

  // Modals
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check if URL query has ?view=mobile
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'mobile') {
      setIsMobileMode(true);
    }

    const initial = getInitialPeers(selfDevice.id);
    setPeers(initial);
    if (initial.length > 0) {
      setSelectedPeer(initial[0]);
    }
  }, [selfDevice.id]);

  // Save clipboard updates
  useEffect(() => {
    saveClipboardVault(clipboardItems);
  }, [clipboardItems]);

  // --- ACTIONS ---
  const handleSendFiles = (files: FileItem[]) => {
    if (!selectedPeer) return;

    const session = p2pManager.createTransfer(selfDevice, selectedPeer, files);
    setTransfers((prev) => [session, ...prev]);
    setCurrentView('transfers');

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

  const handleMobileSendFiles = (files: FileItem[]) => {
    const desktopPeer = peers.find((p) => p.platform === 'mac' || p.platform === 'windows') || selfDevice;
    const session = p2pManager.createTransfer(selfDevice, desktopPeer, files);
    setTransfers((prev) => [session, ...prev]);

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

    if (autoSyncClipboard) {
      try {
        navigator.clipboard.writeText(text);
      } catch {
        // clipboard access
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
      <MobileView
        selfDevice={selfDevice}
        targetDesktop={targetDesktop}
        clipboardItems={clipboardItems}
        onSendFilesToDesktop={handleMobileSendFiles}
        onSendClipboardText={handleAddClipboardItem}
        onExitMobileView={() => setIsMobileMode(false)}
      />
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
          />
        )}
      </main>

      {/* MOBILE PAIRING QR MODAL */}
      <MobilePairModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        localIp={selfDevice.ip}
        onOpenMobileSimulator={() => setIsMobileMode(true)}
      />

      <footer className="border-t border-white/[0.08] py-5 text-center text-xs text-zinc-500 font-mono">
        Hop &bull; universal P2P LAN drop &amp; live clipboard &bull; zero cloud &bull; local encrypted Wi-Fi
      </footer>
    </div>
  );
};
