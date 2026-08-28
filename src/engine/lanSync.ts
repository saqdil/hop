import { PeerDevice } from '../types/peer';
import { ClipboardItem, FileItem } from '../types/transfer';

type PeerCallback = (peers: PeerDevice[]) => void;
type ClipboardCallback = (item: ClipboardItem) => void;
type FileCallback = (file: any) => void;

class LanSyncBridge {
  private ws: WebSocket | null = null;
  private peerCallbacks: PeerCallback[] = [];
  private clipboardCallbacks: ClipboardCallback[] = [];
  private fileCallbacks: FileCallback[] = [];
  private isConnecting: boolean = false;
  private selfDevice: PeerDevice | null = null;

  public init(selfDevice: PeerDevice) {
    this.selfDevice = selfDevice;
    this.connect();
  }

  private connect() {
    if (typeof window === 'undefined' || this.isConnecting) return;
    this.isConnecting = true;

    try {
      const isHttps = window.location.protocol === 'https:';
      const wsProtocol = isHttps ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${wsProtocol}//${host}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
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
          const msg = JSON.parse(event.data);
          if (msg.type === 'PEERS_UPDATE') {
            this.peerCallbacks.forEach((cb) => cb(msg.peers));
          } else if (msg.type === 'CLIPBOARD_SYNC') {
            this.clipboardCallbacks.forEach((cb) => cb(msg.item));
          } else if (msg.type === 'FILE_RECEIVED') {
            this.fileCallbacks.forEach((cb) => cb(msg.file));
          }
        } catch {
          // ignore
        }
      };

      this.ws.onerror = () => {
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
      };
    } catch {
      this.isConnecting = false;
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

  public async uploadFile(fileItem: FileItem, sender: PeerDevice): Promise<any> {
    if (!fileItem.rawFile && !fileItem.rawBlob) return;

    const payload = fileItem.rawFile || fileItem.rawBlob!;
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'x-file-name': encodeURIComponent(fileItem.name),
        'x-file-type': fileItem.type || 'application/octet-stream',
        'x-sender-name': encodeURIComponent(sender.name),
        'x-sender-platform': sender.platform,
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  }

  public onPeers(cb: PeerCallback) {
    this.peerCallbacks.push(cb);
    return () => {
      this.peerCallbacks = this.peerCallbacks.filter((c) => c !== cb);
    };
  }

  public onClipboard(cb: ClipboardCallback) {
    this.clipboardCallbacks.push(cb);
    return () => {
      this.clipboardCallbacks = this.clipboardCallbacks.filter((c) => c !== cb);
    };
  }

  public onFile(cb: FileCallback) {
    this.fileCallbacks.push(cb);
    return () => {
      this.fileCallbacks = this.fileCallbacks.filter((c) => c !== cb);
    };
  }
}

export const lanSync = new LanSyncBridge();
