import { PeerDevice, DevicePlatform } from '../types/peer';

const STORAGE_KEY_CUSTOM_NAME = 'hop_custom_device_name';
const STORAGE_KEY_DEVICE_ID = 'hop_device_unique_id';

export function getRealDevice(): PeerDevice {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let platform: DevicePlatform = 'windows';
  let deviceModel = 'PC';
  let defaultName = 'My Device';

  // 1. Detect Platform & Model
  if (/iPhone/i.test(ua)) {
    platform = 'ios';
    deviceModel = 'iPhone';
    defaultName = 'iPhone';
  } else if (/iPad/i.test(ua)) {
    platform = 'ios';
    deviceModel = 'iPad';
    defaultName = 'iPad';
  } else if (/Android/i.test(ua)) {
    platform = 'android';
    if (/Samsung|SM-|GT-/i.test(ua)) {
      deviceModel = 'Samsung Galaxy';
      defaultName = 'Galaxy Phone';
    } else if (/Pixel/i.test(ua)) {
      deviceModel = 'Google Pixel';
      defaultName = 'Pixel Phone';
    } else if (/OnePlus/i.test(ua)) {
      deviceModel = 'OnePlus';
      defaultName = 'OnePlus';
    } else if (/Xiaomi|Redmi|POCO/i.test(ua)) {
      deviceModel = 'Xiaomi Phone';
      defaultName = 'Xiaomi';
    } else {
      deviceModel = 'Android Phone';
      defaultName = 'Android Phone';
    }
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    platform = 'mac';
    deviceModel = 'Mac';
    defaultName = 'MacBook';
  } else if (/Linux/i.test(ua)) {
    platform = 'linux';
    deviceModel = 'Linux';
    defaultName = 'Linux PC';
  } else {
    platform = 'windows';
    deviceModel = 'Windows PC';
    defaultName = 'Windows PC';
  }

  // 2. Persistent Unique ID
  let id = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_DEVICE_ID) : null;
  if (!id) {
    id = `dev_${Math.random().toString(36).substring(2, 8)}`;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DEVICE_ID, id);
    }
  }

  // 3. User Custom Name or Default
  const customName = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_CUSTOM_NAME) : null;
  const finalName = customName || defaultName;

  const currentOrigin = typeof window !== 'undefined' ? window.location.hostname : 'hop.p2p';

  return {
    id,
    name: finalName,
    platform,
    deviceModel,
    ip: currentOrigin,
    status: 'online',
    lastSeen: Date.now(),
    avatarSeed: id,
  };
}

export function saveCustomDeviceName(newName: string) {
  if (typeof localStorage !== 'undefined' && newName.trim()) {
    localStorage.setItem(STORAGE_KEY_CUSTOM_NAME, newName.trim());
  }
}
