import { PeerDevice } from '../types/peer';
import { ClipboardItem, FileItem } from '../types/transfer';

type PeerCallback = (peers: PeerDevice[]) => void;
type ClipboardCallback = (item: ClipboardItem) => void;
type FileCallback = (fileRecord: any) => void;

class LanSyncClient {
  private ws: WebSocket | null = null;
  private peerListeners: Set<PeerCallback> = new Set();
  private clipboardListeners: Set<ClipboardCallback> = new Set();
  private fileListeners: Set<FileCallback> = new Set();
  private selfDevice: PeerDevice | null = null;
  private reconnectTimer: any = null;

  public init(self: PeerDevice) {
    this.selfDevice = self;
    this.connect();
  }

  private connect() {
    if (typeof window === 'undefined') return;

    const host = window.location.hostname || 'localhost';
    const port = window.location.port || '5180';
    const wsUrl = `ws://${host}:${port}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        if (this.selfDevice && this.ws) {
          this.ws.send(
            JSON.stringify({
              type: 'PEER_REGISTER',
              peer: this.selfDevice,
            })
          );
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'PEERS_UPDATE') {
            this.peerListeners.forEach((cb) => cb(data.peers));
          }

          if (data.type === 'CLIPBOARD_SYNC') {
            this.clipboardListeners.forEach((cb) => cb(data.item));
          }

          if (data.type === 'FILE_RECEIVED') {
            this.fileListeners.forEach((cb) => cb(data.file));
          }
        } catch {
          // ignore
        }
      };

      this.ws.onclose = () => {
        // Auto-reconnect every 3s
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = () => {
        // quiet error
      };
    } catch {
      // fallback
    }
  }

  public broadcastClipboard(item: ClipboardItem) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'CLIPBOARD_BROADCAST',
          item,
        })
      );
    }
  }

  public async uploadFile(
    file: File | FileItem,
    sender: PeerDevice,
    onProgress?: (percent: number, speedMBs: number) => void
  ): Promise<any> {
    const host = window.location.hostname || 'localhost';
    const port = window.location.port || '5180';
    const uploadUrl = `http://${host}:${port}/api/upload`;

    let blob: Blob;
    let fileName = file.name;
    let fileType = file.type;

    if ('rawFile' in file && file.rawFile) {
      blob = file.rawFile;
    } else {
      blob = new Blob([`AirDropX Payload for ${fileName}`], { type: fileType });
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl, true);

      xhr.setRequestHeader('x-file-name', encodeURIComponent(fileName));
      xhr.setRequestHeader('x-file-type', fileType);
      xhr.setRequestHeader('x-sender-name', encodeURIComponent(sender.name));
      xhr.setRequestHeader('x-sender-platform', sender.platform);

      const startTime = performance.now();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          const elapsedSec = (performance.now() - startTime) / 1000;
          const speedMBs = elapsedSec > 0 ? Math.round((e.loaded / (1024 * 1024) / elapsedSec) * 10) / 10 : 0;
          onProgress(percent, speedMBs);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const resp = JSON.parse(xhr.responseText);
            resolve(resp);
          } catch {
            resolve({ success: true });
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(blob);
    });
  }

  public onPeers(cb: PeerCallback) {
    this.peerListeners.add(cb);
    return () => this.peerListeners.delete(cb);
  }

  public onClipboard(cb: ClipboardCallback) {
    this.clipboardListeners.add(cb);
    return () => this.clipboardListeners.delete(cb);
  }

  public onFile(cb: FileCallback) {
    this.fileListeners.add(cb);
    return () => this.fileListeners.delete(cb);
  }
}

export const lanSync = new LanSyncClient();
