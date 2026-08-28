# Hop

**Universal Cross-Platform Peer-to-Peer Transfer & Shared Clipboard**

Hop is a zero-cloud, direct peer-to-peer file streaming and live clipboard synchronization engine designed for macOS, Windows, Linux, Android, and iOS. It utilizes WebRTC DataChannels and local network sockets to stream multi-gigabyte binary payloads directly between devices at line speed without intermediate server storage.

---

## Live Deployment & Mobile Access

- **Web App**: [https://hop-transfer.vercel.app](https://hop-transfer.vercel.app)
- **Android**: Installable WebAPK / Native Capacitor build (`android/`)
- **Desktop**: Standalone Electron installer supported via `electron-builder`

---

## Core Architecture

### 1. WebRTC Binary DataChannel Streaming
- **Chunked Payload Pipeline**: Files are sliced into 64 KB binary chunks (`ArrayBuffer`) and streamed directly over encrypted RTCDataChannels.
- **Adaptive Flow Control**: Monitors `dataChannel.bufferedAmount` to prevent buffer overflow during multi-gigabyte 4K media transfers, guaranteeing zero packet loss.
- **Dynamic Telemetry**: Provides real-time bandwidth throughput (MB/s), chunk verification, and mathematically accurate countdown ETAs.

### 2. Live Bidirectional Clipboard Synchronization
- Real-time text, URL, and OTP credential mirroring across active sessions.
- Sub-40ms synchronization latency with persistent local vault management.

### 3. Device Discovery & Pairing
- **6-Digit Room PINs**: Instant pairing between devices on separate Wi-Fi, 4G, or 5G networks.
- **QR Handshake**: One-scan pairing that automatically establishes WebRTC connections.
- **Direct P2P Hotspot Mode**: Full offline transfer capability with zero internet dependency.

### 4. Native OS Integration
- **Mobile (Android/iOS)**: Integrated with the native Web Share API (`navigator.share`) to save media directly into system galleries and file managers without browser download blockers.
- **Desktop**: Native drag-and-drop file targets with in-app multi-format media previewers.

---

## Technical Specifications

| Parameter | Specification |
| :--- | :--- |
| **Transport Layer** | WebRTC DataChannels (SCTP over DTLS), WebSockets |
| **Signaling** | PeerJS Cloud + Multi-Region STUN Fallback |
| **Chunk Size** | 64 KB binary frames |
| **Backpressure Limit** | 1 MB threshold buffer queue |
| **Security & Encryption** | End-to-End DTLS/SRTP (AES-128-GCM / AES-256) |
| **Frontend Framework** | React 18, TypeScript, Tailwind CSS, Vite |
| **Mobile Runtime** | Capacitor v6 (Native Android & iOS wrapper) |

---

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation & Local Development

```bash
# Clone repository
git clone https://github.com/saqdil/hop.git

# Navigate to workspace
cd hop

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
# Compile TypeScript and build production bundle
npm run build

# Preview production build locally
npm run preview
```

### Android Native Build

```bash
# Sync web bundle with Capacitor Android project
npx cap sync android

# Open project in Android Studio to build APK
npx cap open android
```

---

## Project Structure

```
hop/
├── src/
│   ├── components/       # Minimalist UI components (Radar, Queue, DropZone, Modals)
│   ├── engine/           # Core networking logic (peerEngine, deviceDetector, clipboardEngine)
│   ├── types/            # TypeScript interfaces for peers, files, and transfer sessions
│   ├── App.tsx           # Primary application orchestrator
│   └── main.tsx          # Root mount point with ErrorBoundary
├── android/              # Native Android project (Capacitor v6)
├── vercel.json           # Production deployment configuration
└── package.json          # Project scripts and dependencies
```

---

## License

MIT License. Developed by Adil Saquif.
