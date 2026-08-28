import Peer, { DataConnection } from 'peerjs';
import { PeerDevice, DevicePlatform } from '../types/peer';
import { FileItem, TransferSession, ClipboardItem } from '../types/transfer';

type ConnectionCallback = (peerDevice: PeerDevice) => void;
type DisconnectCallback = (peerId: string) => void;
type FileProgressCallback = (file: FileItem, percent: number, speedMBs: number, etaSeconds: number) => void;
type FileCompleteCallback = (file: FileItem, session: TransferSession) => void;
type ClipboardCallback = (item: ClipboardItem) => void;

interface FileBufferEntry {
  chunks: ArrayBuffer[];
  meta: {
    fileId: string;
    name: string;
    size: number;
    fileType: string;
    totalChunks: number;
  };
  receivedBytes: number;
  startTime: number;
}

export class PeerEngine {
  public myPeerId: string = '';
  public roomPin: string = '';
  private peer: any = null;
  private connections: Map<string, DataConnection> = new Map();
  private connectedDeviceMap: Map<string, PeerDevice> = new Map();
  private selfDevice: PeerDevice;
  private incomingFileBuffers: Map<string, FileBufferEntry> = new Map();

  private onConnectCbs: ConnectionCallback[] = [];
  private onDisconnectCbs: DisconnectCallback[] = [];
  private onFileProgressCbs: FileProgressCallback[] = [];
  private onFileCompleteCbs: FileCompleteCallback[] = [];
  private onClipboardCbs: ClipboardCallback[] = [];

  // Optimal chunk size for WebRTC DataChannel (64 KB)
  private readonly CHUNK_SIZE = 64 * 1024;
  private readonly MAX_BUFFERED_AMOUNT = 1024 * 1024; // 1 MB backpressure limit

  constructor(selfDevice: PeerDevice) {
    this.selfDevice = selfDevice;
  }

  public updateSelfDevice(updated: PeerDevice) {
    this.selfDevice = updated;
    this.broadcast({
      type: 'DEVICE_INFO',
      device: updated,
    });
  }

  public init(customPin?: string): Promise<string> {
    return new Promise((resolve) => {
      try {
        const pin = customPin || Math.floor(100000 + Math.random() * 900000).toString();
        this.roomPin = pin;
        const peerId = `hop-${pin}`;
        this.myPeerId = peerId;

        const PeerConstructor = Peer || (window as any).Peer;

        if (!PeerConstructor) {
          console.warn('PeerJS library not loaded');
          return resolve(peerId);
        }

        this.peer = new PeerConstructor(peerId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              { urls: 'stun:stun3.l.google.com:19302' },
              { urls: 'stun:stun4.l.google.com:19302' },
            ],
          },
        });

        this.peer.on('open', (id: string) => {
          console.log('⚡ Hop PeerJS Online with ID:', id);
          this.myPeerId = id;
          resolve(id);
        });

        this.peer.on('connection', (conn: DataConnection) => {
          this.setupConnection(conn, false);
        });

        this.peer.on('error', (err: any) => {
          console.warn('PeerJS Warning:', err);
          if (err.type === 'unavailable-id') {
            const newPin = Math.floor(100000 + Math.random() * 900000).toString();
            this.init(newPin).then(resolve);
          }
        });
      } catch (e) {
        console.warn('Peer init catch:', e);
        resolve(`hop-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    });
  }

  public connectToPeer(targetPinOrId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.peer) return resolve(false);

      const targetId = targetPinOrId.startsWith('hop-') ? targetPinOrId : `hop-${targetPinOrId}`;
      console.log('⚡ Connecting to:', targetId);

      try {
        const conn = this.peer.connect(targetId, {
          reliable: true,
        });

        this.setupConnection(conn, true);

        conn.on('open', () => {
          console.log('⚡ Connection established with:', targetId);
          resolve(true);
        });

        conn.on('error', (err: any) => {
          console.warn('Connection error:', err);
          resolve(false);
        });

        setTimeout(() => resolve(false), 10000);
      } catch (err) {
        console.warn('connectToPeer exception:', err);
        resolve(false);
      }
    });
  }

  private setupConnection(conn: DataConnection, isInitiator: boolean) {
    const remotePeerId = conn.peer;

    conn.on('open', () => {
      console.log(`⚡ Connected to ${remotePeerId} (initiator: ${isInitiator})`);
      this.connections.set(remotePeerId, conn);

      // Exchange self device info
      conn.send({
        type: 'DEVICE_INFO',
        device: this.selfDevice,
      });
    });

    conn.on('data', (data: any) => {
      this.handleIncomingData(remotePeerId, data, conn);
    });

    conn.on('close', () => {
      console.log(`⚡ Disconnected from ${remotePeerId}`);
      this.connections.delete(remotePeerId);
      this.connectedDeviceMap.delete(remotePeerId);
      this.onDisconnectCbs.forEach((cb) => cb(remotePeerId));
    });

    conn.on('error', () => {
      this.connections.delete(remotePeerId);
      this.connectedDeviceMap.delete(remotePeerId);
      this.onDisconnectCbs.forEach((cb) => cb(remotePeerId));
    });
  }

  private handleIncomingData(remotePeerId: string, data: any, conn: DataConnection) {
    if (typeof data === 'object' && data !== null) {
      // 1. Device Info Handshake
      if (data.type === 'DEVICE_INFO') {
        const remoteDevice: PeerDevice = {
          ...data.device,
          id: remotePeerId,
          status: 'online',
          lastSeen: Date.now(),
        };
        this.connectedDeviceMap.set(remotePeerId, remoteDevice);
        this.onConnectCbs.forEach((cb) => cb(remoteDevice));

        conn.send({
          type: 'DEVICE_INFO_ACK',
          device: this.selfDevice,
        });
        return;
      }

      if (data.type === 'DEVICE_INFO_ACK') {
        const remoteDevice: PeerDevice = {
          ...data.device,
          id: remotePeerId,
          status: 'online',
          lastSeen: Date.now(),
        };
        this.connectedDeviceMap.set(remotePeerId, remoteDevice);
        this.onConnectCbs.forEach((cb) => cb(remoteDevice));
        return;
      }

      // 2. Clipboard
      if (data.type === 'CLIPBOARD') {
        this.onClipboardCbs.forEach((cb) => cb(data.item));
        return;
      }

      // 3. File Transfer Start
      if (data.type === 'FILE_START') {
        this.incomingFileBuffers.set(data.fileId, {
          chunks: [],
          meta: data,
          receivedBytes: 0,
          startTime: performance.now(),
        });
        return;
      }

      // 4. File Chunks
      if (data.type === 'FILE_CHUNK') {
        const buf = this.incomingFileBuffers.get(data.fileId);
        if (buf) {
          buf.chunks.push(data.chunk);
          const chunkLen = data.chunk.byteLength || data.chunk.length || 0;
          buf.receivedBytes += chunkLen;

          const percent = Math.min(100, Math.round((buf.receivedBytes / buf.meta.size) * 100));
          const elapsedSec = (performance.now() - buf.startTime) / 1000;
          const speedMBs = elapsedSec > 0 ? Math.round((buf.receivedBytes / (1024 * 1024) / elapsedSec) * 10) / 10 : 0;
          const remainingBytes = Math.max(0, buf.meta.size - buf.receivedBytes);
          const speedBytesPerSec = elapsedSec > 0 ? (buf.receivedBytes / elapsedSec) : 1;
          const etaSeconds = speedBytesPerSec > 0 ? Math.ceil(remainingBytes / speedBytesPerSec) : 0;

          const activeFile: FileItem = {
            id: buf.meta.fileId,
            name: buf.meta.name,
            size: buf.meta.size,
            type: buf.meta.fileType,
          };

          this.onFileProgressCbs.forEach((cb) => cb(activeFile, percent, speedMBs, etaSeconds));
        }
        return;
      }

      // 5. File Complete
      if (data.type === 'FILE_END') {
        const buf = this.incomingFileBuffers.get(data.fileId);
        if (buf) {
          const fullBlob = new Blob(buf.chunks, { type: buf.meta.fileType || 'application/octet-stream' });
          const blobUrl = URL.createObjectURL(fullBlob);

          const completedFile: FileItem = {
            id: buf.meta.fileId,
            name: buf.meta.name,
            size: buf.meta.size || fullBlob.size,
            type: buf.meta.fileType || 'application/octet-stream',
            blobUrl: blobUrl,
            previewUrl: buf.meta.fileType?.startsWith('image/') ? blobUrl : undefined,
            rawBlob: fullBlob,
          };

          const senderDevice = this.connectedDeviceMap.get(remotePeerId) || {
            id: remotePeerId,
            name: 'Connected Device',
            platform: 'windows' as DevicePlatform,
            deviceModel: 'Direct Device',
            ip: 'Direct P2P',
            status: 'online',
            lastSeen: Date.now(),
            avatarSeed: remotePeerId,
          };

          const session: TransferSession = {
            id: `rx_p2p_${Date.now()}`,
            sender: senderDevice,
            receiver: this.selfDevice,
            files: [completedFile],
            totalBytes: completedFile.size,
            transferredBytes: completedFile.size,
            speedMBs: 0,
            progressPercent: 100,
            status: 'completed',
            startedAt: Date.now() - 1000,
            completedAt: Date.now(),
            etaSeconds: 0,
            connectionMode: 'webrtc',
          };

          // Trigger download automatically on receiver if desired
          try {
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = completedFile.name;
            a.click();
          } catch {
            // ignore if blocked by browser
          }

          this.onFileCompleteCbs.forEach((cb) => cb(completedFile, session));
          this.incomingFileBuffers.delete(data.fileId);
        }
        return;
      }
    }
  }

  public async sendFile(
    remotePeerId: string,
    file: FileItem,
    onProgress?: (percent: number, speedMBs: number, etaSeconds: number) => void
  ): Promise<void> {
    const conn = this.connections.get(remotePeerId);
    if (!conn) {
      throw new Error('Device is not connected');
    }

    let rawBlob: Blob;
    if (file.rawFile) {
      rawBlob = file.rawFile;
    } else if (file.rawBlob) {
      rawBlob = file.rawBlob;
    } else {
      rawBlob = new Blob([new Uint8Array(file.size || 1024)], { type: file.type || 'application/octet-stream' });
    }

    const totalBytes = rawBlob.size;
    const totalChunks = Math.ceil(totalBytes / this.CHUNK_SIZE);
    const fileId = file.id || `file_${Date.now()}`;

    // 1. Send metadata header
    conn.send({
      type: 'FILE_START',
      fileId,
      name: file.name,
      size: totalBytes,
      fileType: file.type,
      totalChunks,
    });

    const startTime = performance.now();
    let sentBytes = 0;

    const dataChannel: RTCDataChannel | undefined = (conn as any).dataChannel;

    // 2. Stream chunks with backpressure handling
    for (let i = 0; i < totalChunks; i++) {
      // Flow control / Backpressure check: wait if buffer exceeds 1 MB
      if (dataChannel && dataChannel.bufferedAmount > this.MAX_BUFFERED_AMOUNT) {
        await new Promise<void>((resolve) => {
          const checkInterval = setInterval(() => {
            if (!dataChannel || dataChannel.bufferedAmount < this.MAX_BUFFERED_AMOUNT / 2) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 15);
        });
      }

      const start = i * this.CHUNK_SIZE;
      const end = Math.min(start + this.CHUNK_SIZE, totalBytes);
      const chunk = rawBlob.slice(start, end);
      const arrayBuf = await chunk.arrayBuffer();

      conn.send({
        type: 'FILE_CHUNK',
        fileId,
        chunk: arrayBuf,
        chunkIndex: i,
      });

      sentBytes += arrayBuf.byteLength;
      const percent = Math.round((sentBytes / totalBytes) * 100);
      const elapsedSec = (performance.now() - startTime) / 1000;
      const speedMBs = elapsedSec > 0 ? Math.round((sentBytes / (1024 * 1024) / elapsedSec) * 10) / 10 : 0;
      const remainingBytes = Math.max(0, totalBytes - sentBytes);
      const speedBytesPerSec = elapsedSec > 0 ? (sentBytes / elapsedSec) : 1;
      const etaSeconds = speedBytesPerSec > 0 ? Math.ceil(remainingBytes / speedBytesPerSec) : 0;

      onProgress?.(percent, speedMBs, etaSeconds);

      // Yield event loop every 8 chunks to keep UI responsive
      if (i % 8 === 0) {
        await new Promise((r) => setTimeout(r, 4));
      }
    }

    // 3. Send completion signal
    conn.send({
      type: 'FILE_END',
      fileId,
    });
  }

  public sendClipboard(remotePeerId: string, item: ClipboardItem) {
    const conn = this.connections.get(remotePeerId);
    if (conn) {
      conn.send({
        type: 'CLIPBOARD',
        item,
      });
    }
  }

  public broadcast(payload: any) {
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(payload);
      }
    });
  }

  public getConnectedDevices(): PeerDevice[] {
    return Array.from(this.connectedDeviceMap.values());
  }

  public onConnect(cb: ConnectionCallback) {
    this.onConnectCbs.push(cb);
    return () => (this.onConnectCbs = this.onConnectCbs.filter((c) => c !== cb));
  }

  public onDisconnect(cb: DisconnectCallback) {
    this.onDisconnectCbs.push(cb);
    return () => (this.onDisconnectCbs = this.onDisconnectCbs.filter((c) => c !== cb));
  }

  public onFileProgress(cb: FileProgressCallback) {
    this.onFileProgressCbs.push(cb);
    return () => (this.onFileProgressCbs = this.onFileProgressCbs.filter((c) => c !== cb));
  }

  public onFileComplete(cb: FileCompleteCallback) {
    this.onFileCompleteCbs.push(cb);
    return () => (this.onFileCompleteCbs = this.onFileCompleteCbs.filter((c) => c !== cb));
  }

  public onClipboard(cb: ClipboardCallback) {
    this.onClipboardCbs.push(cb);
    return () => (this.onClipboardCbs = this.onClipboardCbs.filter((c) => c !== cb));
  }
}
