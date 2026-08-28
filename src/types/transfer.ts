import { PeerDevice } from './peer';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified?: number;
  previewUrl?: string;
  rawFile?: File;
}

export type TransferStatus = 'pending' | 'transferring' | 'paused' | 'completed' | 'cancelled' | 'error';

export interface TransferSession {
  id: string;
  sender: PeerDevice;
  receiver: PeerDevice;
  files: FileItem[];
  totalBytes: number;
  transferredBytes: number;
  speedMBs: number;
  progressPercent: number;
  status: TransferStatus;
  startedAt: number;
  completedAt?: number;
  etaSeconds: number;
  errorMessage?: string;
}

export type ClipboardCategory = 'url' | 'code' | 'otp' | 'text' | 'color';

export interface ClipboardItem {
  id: string;
  text: string;
  sourceDevice: {
    id: string;
    name: string;
    platform: PeerDevice['platform'];
  };
  timestamp: number;
  isPinned: boolean;
  category: ClipboardCategory;
}
