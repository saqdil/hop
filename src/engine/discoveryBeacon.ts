import { PeerDevice, DevicePlatform } from '../types/peer';

const STORAGE_KEY_SELF = 'hop_self_device';

export function getOrCreateSelfDevice(): PeerDevice {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_SELF) : null;
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (typeof window !== 'undefined') {
        parsed.ip = window.location.hostname;
      }
      return parsed;
    } catch {
      // ignore
    }
  }

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let platform: DevicePlatform = 'windows';
  let deviceModel = 'Windows PC';

  if (/iPhone/i.test(ua)) {
    platform = 'ios';
    deviceModel = 'iPhone';
  } else if (/iPad/i.test(ua)) {
    platform = 'ios';
    deviceModel = 'iPad';
  } else if (/Android/i.test(ua)) {
    platform = 'android';
    deviceModel = 'Android Device';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    platform = 'mac';
    deviceModel = 'Mac';
  } else if (/Linux/i.test(ua)) {
    platform = 'linux';
    deviceModel = 'Linux Desktop';
  }

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'hop-p2p';

  const newDevice: PeerDevice = {
    id: `dev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: platform === 'mac' ? "Alex's MacBook Pro" : platform === 'ios' ? "Alex's iPhone" : platform === 'android' ? "Personal Galaxy" : "Galaxy Studio",
    platform,
    deviceModel,
    ip: currentHost,
    status: 'online',
    lastSeen: Date.now(),
    avatarSeed: Math.random().toString(36).substring(7),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SELF, JSON.stringify(newDevice));
  }

  return newDevice;
}

export function getInitialPeers(selfId: string): PeerDevice[] {
  const isMobile = typeof window !== 'undefined' && (window.location.search.includes('mobile') || window.innerWidth < 768);
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'P2P Direct';

  const mockPeers: PeerDevice[] = [
    {
      id: 'peer_iphone',
      name: "Alex's iPhone 16",
      platform: 'ios',
      deviceModel: 'iPhone 16 Pro Max',
      ip: currentHost,
      batteryPercent: 88,
      status: 'online',
      lastSeen: Date.now(),
      avatarSeed: 'iphone16',
    },
    {
      id: 'peer_galaxy',
      name: 'Work Galaxy S25',
      platform: 'android',
      deviceModel: 'Galaxy S25 Ultra',
      ip: currentHost,
      batteryPercent: 76,
      status: 'online',
      lastSeen: Date.now(),
      avatarSeed: 'galaxy25',
    },
    {
      id: 'peer_mac',
      name: 'Engineering MacBook',
      platform: 'mac',
      deviceModel: 'MacBook Pro 16" (M3 Max)',
      ip: currentHost,
      batteryPercent: 100,
      status: 'online',
      lastSeen: Date.now(),
      avatarSeed: 'macbook',
    },
  ];

  if (isMobile) {
    return [
      {
        id: 'peer_mac',
        name: 'Studio Mac / PC',
        platform: 'mac',
        deviceModel: 'Connected Studio',
        ip: currentHost,
        batteryPercent: 100,
        status: 'online',
        lastSeen: Date.now(),
        avatarSeed: 'macbook',
      },
    ];
  }

  return mockPeers.filter((p) => p.id !== selfId);
}
