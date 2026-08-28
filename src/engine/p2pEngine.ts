import { FileItem, TransferSession } from '../types/transfer';
import { PeerDevice } from '../types/peer';

export class P2PTransferManager {
  private activeTransfers: Map<string, TransferSession> = new Map();
  private timers: Map<string, any> = new Map();

  public createTransfer(sender: PeerDevice, receiver: PeerDevice, files: FileItem[]): TransferSession {
    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
    const session: TransferSession = {
      id: `xfer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sender,
      receiver,
      files,
      totalBytes,
      transferredBytes: 0,
      speedMBs: 0,
      progressPercent: 0,
      status: 'pending',
      startedAt: Date.now(),
      etaSeconds: 0,
    };

    this.activeTransfers.set(session.id, session);
    return session;
  }

  public startStreaming(
    sessionId: string,
    onProgress: (session: TransferSession) => void,
    onComplete: (session: TransferSession) => void
  ) {
    const session = this.activeTransfers.get(sessionId);
    if (!session) return;

    session.status = 'transferring';
    session.startedAt = Date.now();

    // High performance LAN transfer simulation / WebRTC stream
    // Target transfer speed ~65 - 110 MB/s
    const targetSpeedBytesPerSec = (65 + Math.random() * 45) * 1024 * 1024;
    const intervalMs = 100;
    const bytesPerTick = (targetSpeedBytesPerSec * intervalMs) / 1000;

    let currentTransferred = session.transferredBytes;

    const timer = setInterval(() => {
      if (session.status !== 'transferring') {
        clearInterval(timer);
        return;
      }

      currentTransferred = Math.min(session.totalBytes, currentTransferred + bytesPerTick);
      const percent = Math.min(100, Math.round((currentTransferred / session.totalBytes) * 100));

      const elapsedSec = (Date.now() - session.startedAt) / 1000;
      const speedMBs = elapsedSec > 0 ? Math.round((currentTransferred / (1024 * 1024) / elapsedSec) * 10) / 10 : 0;
      const remainingBytes = session.totalBytes - currentTransferred;
      const etaSeconds = speedMBs > 0 ? Math.max(1, Math.round(remainingBytes / (speedMBs * 1024 * 1024))) : 0;

      session.transferredBytes = currentTransferred;
      session.progressPercent = percent;
      session.speedMBs = speedMBs;
      session.etaSeconds = etaSeconds;

      onProgress({ ...session });

      if (currentTransferred >= session.totalBytes) {
        clearInterval(timer);
        session.status = 'completed';
        session.completedAt = Date.now();
        session.progressPercent = 100;
        session.etaSeconds = 0;
        onComplete({ ...session });
      }
    }, intervalMs);

    this.timers.set(sessionId, timer);
  }

  public pauseTransfer(sessionId: string) {
    const session = this.activeTransfers.get(sessionId);
    if (session) {
      session.status = 'paused';
      const timer = this.timers.get(sessionId);
      if (timer) clearInterval(timer);
    }
  }

  public cancelTransfer(sessionId: string) {
    const session = this.activeTransfers.get(sessionId);
    if (session) {
      session.status = 'cancelled';
      const timer = this.timers.get(sessionId);
      if (timer) clearInterval(timer);
    }
  }
}

export const p2pManager = new P2PTransferManager();
