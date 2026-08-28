import { PeerDevice, DevicePlatform } from '../types/peer';

const STORAGE_KEY_SELF = 'airdropx_self_device';

export function getOrCreateSelfDevice(): PeerDevice {
  const stored = localStorage.getItem(STORAGE_KEY_SELF);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }

  // Detect current platform
  const ua = navigator.userAgent.toLowerCase();
  let platform: DevicePlatform = 'windows';
  let deviceModel = 'Windows 11 PC';

  if (ua.includes('mac') || ua.includes('darwin')) {
    platform = 'mac';
    deviceModel = 'MacBook Pro';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    platform = 'ios';
    deviceModel = 'iPhone 16 Pro';
  } else if (ua.includes('android')) {
    platform = 'android';
    deviceModel = 'Galaxy S25 Ultra';
  } else if (ua.includes('linux')) {
    platform = 'linux';
    deviceModel = 'Linux Workstation';
  }

  const newDevice: PeerDevice = {
    id: `dev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: `${platform === 'mac' ? 'MacBook' : platform === 'ios' ? 'iPhone' : platform === 'android' ? 'Galaxy' : 'Desktop'} Studio`,
    platform,
    deviceModel,
    ip: '192.168.1.108',
    status: 'online',
    isCurrentDevice: true,
    lastSeen: Date.now(),
    avatarSeed: Math.random().toString(36).slice(2, 7),
    batteryPercent: 94,
    wifiSignalBars: 4,
  };

  localStorage.setItem(STORAGE_KEY_SELF, JSON.stringify(newDevice));
  return newDevice;
}

export function saveSelfDevice(device: PeerDevice): void {
  localStorage.setItem(STORAGE_KEY_SELF, JSON.stringify(device));
}

export function getInitialPeers(selfId: string): PeerDevice[] {
  const peers: PeerDevice[] = [
    {
      id: 'peer_iphone_16',
      name: "Alex's iPhone 16",
      platform: 'ios',
      deviceModel: 'iPhone 16 Pro Max',
      ip: '192.168.1.142',
      status: 'online',
      isPairedMobile: true,
      lastSeen: Date.now() - 12000,
      avatarSeed: 'iphone16',
      batteryPercent: 88,
      wifiSignalBars: 4,
    },
    {
      id: 'peer_galaxy_s25',
      name: "Work Galaxy S25",
      platform: 'android',
      deviceModel: 'Samsung Galaxy S25 Ultra',
      ip: '192.168.1.165',
      status: 'online',
      isPairedMobile: false,
      lastSeen: Date.now() - 45000,
      avatarSeed: 'galaxy25',
      batteryPercent: 76,
      wifiSignalBars: 3,
    },
    {
      id: 'peer_macbook_m3',
      name: "Engineering MacBook",
      platform: 'mac',
      deviceModel: 'MacBook Pro 16" (M3 Max)',
      ip: '192.168.1.119',
      status: 'online',
      isPairedMobile: false,
      lastSeen: Date.now() - 5000,
      avatarSeed: 'macbook3',
      batteryPercent: 100,
      wifiSignalBars: 4,
    },
  ];

  return peers.filter((p) => p.id !== selfId);
}
