# 🛰️ AirDropX

> **Universal Cross-Platform P2P LAN Drop & Real-Time Shared Clipboard Studio**  
> *Seamlessly connect Windows, macOS, Linux, iPhone, and Android over local Wi-Fi with line-speed file streaming, zero cloud upload, and real-time clipboard mirroring.*

---

## 🌟 Key Features

### 1. 📱 Zero-Install Mobile Pairing (iOS & Android)
* **Scan & Drop:** Generate a local pairing QR code on your PC screen $\rightarrow$ Scan with standard **iPhone Camera** or **Android Google Lens**.
* **Direct Web PWA:** Opens instantly in mobile Safari / Chrome without needing an App Store installation.
* **Camera Roll Drop:** Send photos/videos directly from mobile gallery to PC at full Wi-Fi line speed (50–100+ MB/s).

### 2. 📋 Universal Real-Time Clipboard Sync
* **Bi-directional Mirroring:** Copy on your PC, and it is instantly accessible on your phone; copy on your phone, and it appears on your PC.
* **Auto-Broadcast Listener:** Automatically detects new clipboard text, categorizes it into **URLs**, **OTP / 2FA Codes**, **Code Snippets**, and **Colors**, with 1-click copy and pin toggles.

### 3. 🛰️ Apple HIG Radar & Device Discovery
* **Pulsing Radar Orbit:** Visual representation of nearby network devices (MacBook Pro, Windows PC, iPhone 16, Samsung Galaxy).
* **Live Telemetry:** Displays device battery %, Wi-Fi signal strength, and online status.

### 4. ⚡ Chunked Binary Streaming Engine
* **High-Speed Transfers:** Streams multi-gigabyte files directly over peer-to-peer LAN sockets at line speed.
* **Live Speedometer:** Shows MB/s throughput, circular progress, dynamic ETA, and pause/resume controls.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/saqdil/airdrop-x.git

# Install dependencies
cd airdrop-x
npm install

# Start local dev server
npm run dev
```

Open `http://localhost:5180` on your desktop, or open `http://<your-lan-ip>:5180` on your phone!
