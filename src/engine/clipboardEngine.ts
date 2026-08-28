import { ClipboardItem, ClipboardCategory } from '../types/transfer';
import { PeerDevice } from '../types/peer';

const CLIPBOARD_STORAGE_KEY = 'airdropx_clipboard_vault';

export function detectClipboardCategory(text: string): ClipboardCategory {
  const trimmed = text.trim();

  // URL
  if (/^(https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i.test(trimmed)) {
    return 'url';
  }

  // 4 to 8 digit OTP / verification code
  if (/^\d{4,8}$/.test(trimmed)) {
    return 'otp';
  }

  // Hex color or rgb
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed) || /^rgba?\(/.test(trimmed)) {
    return 'color';
  }

  // Code snippet (contains braces, semicolons, function, const, import, def)
  if (
    trimmed.includes('{') ||
    trimmed.includes(';') ||
    trimmed.includes('function') ||
    trimmed.includes('const ') ||
    trimmed.includes('import ') ||
    trimmed.includes('def ') ||
    trimmed.includes('class ') ||
    trimmed.includes('=>')
  ) {
    return 'code';
  }

  return 'text';
}

export function loadClipboardVault(): ClipboardItem[] {
  const stored = localStorage.getItem(CLIPBOARD_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }

  // Initial default examples
  return [
    {
      id: 'clip_demo_1',
      text: 'https://github.com/saqdil/bench-api',
      sourceDevice: { id: 'peer_macbook_m3', name: 'Engineering MacBook', platform: 'mac' },
      timestamp: Date.now() - 60000 * 5,
      isPinned: true,
      category: 'url',
    },
    {
      id: 'clip_demo_2',
      text: '749102',
      sourceDevice: { id: 'peer_iphone_16', name: "Alex's iPhone 16", platform: 'ios' },
      timestamp: Date.now() - 60000 * 22,
      isPinned: false,
      category: 'otp',
    },
    {
      id: 'clip_demo_3',
      text: 'git push origin main --force-with-lease',
      sourceDevice: { id: 'self', name: 'Desktop Studio', platform: 'windows' },
      timestamp: Date.now() - 60000 * 45,
      isPinned: false,
      category: 'code',
    },
  ];
}

export function saveClipboardVault(items: ClipboardItem[]): void {
  localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
}

export function createClipboardItem(text: string, sender: PeerDevice): ClipboardItem {
  return {
    id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    text,
    sourceDevice: {
      id: sender.id,
      name: sender.name,
      platform: sender.platform,
    },
    timestamp: Date.now(),
    isPinned: false,
    category: detectClipboardCategory(text),
  };
}
