export type DevicePlatform = 'mac' | 'windows' | 'linux' | 'ios' | 'android';

export interface PeerDevice {
  id: string;
  name: string;
  platform: DevicePlatform;
  deviceModel: string;
  ip: string;
  status: 'online' | 'transferring' | 'idle';
  isCurrentDevice?: boolean;
  isPairedMobile?: boolean;
  lastSeen: number;
  avatarSeed: string;
  batteryPercent?: number;
  wifiSignalBars?: number;
}
