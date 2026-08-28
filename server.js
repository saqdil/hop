import http from 'http';
import fs from 'fs';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5180;
const UPLOAD_DIR = path.resolve(path.join(__dirname, '.hop_uploads'));

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// In-memory stores
const activeFiles = new Map();
const clipboardHistory = [];
const connectedPeers = new Map();

const server = http.createServer(async (req, res) => {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-file-name, x-file-type, x-sender-name, x-sender-platform');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // API 1: File Download endpoint with path traversal validation
  if (url.pathname.startsWith('/api/download/')) {
    const fileId = url.pathname.replace('/api/download/', '').replace(/[^a-zA-Z0-9_-]/g, '');
    const fileRecord = activeFiles.get(fileId);

    if (!fileRecord || !fs.existsSync(fileRecord.path)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File not found or expired' }));
      return;
    }

    // Security check: verify path is strictly inside UPLOAD_DIR
    const resolvedPath = path.resolve(fileRecord.path);
    if (!resolvedPath.startsWith(UPLOAD_DIR)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Access denied' }));
      return;
    }

    res.writeHead(200, {
      'Content-Type': fileRecord.type || 'application/octet-stream',
      'Content-Length': fileRecord.size,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileRecord.name)}"`,
    });

    const readStream = fs.createReadStream(resolvedPath);
    readStream.pipe(res);
    return;
  }

  // API 2: Binary File Upload endpoint with sanitization
  if (url.pathname === '/api/upload' && req.method === 'POST') {
    const rawFileName = decodeURIComponent(req.headers['x-file-name'] || `file_${Date.now()}`);
    const cleanFileName = path.basename(rawFileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileType = req.headers['x-file-type'] || 'application/octet-stream';
    const senderName = decodeURIComponent(req.headers['x-sender-name'] || 'Connected Device').slice(0, 50);
    const senderPlatform = (req.headers['x-sender-platform'] || 'mobile').slice(0, 20);

    const fileId = `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const filePath = path.join(UPLOAD_DIR, `${fileId}_${cleanFileName}`);

    const writeStream = fs.createWriteStream(filePath);
    let totalSize = 0;

    req.on('data', (chunk) => {
      totalSize += chunk.length;
      writeStream.write(chunk);
    });

    req.on('end', () => {
      writeStream.end();

      const fileRecord = {
        id: fileId,
        name: rawFileName,
        size: totalSize,
        type: fileType,
        path: filePath,
        downloadUrl: `/api/download/${fileId}`,
        sender: {
          name: senderName,
          platform: senderPlatform,
        },
        timestamp: Date.now(),
      };

      activeFiles.set(fileId, fileRecord);

      // Broadcast new file to all connected WebSockets
      const broadcastMsg = JSON.stringify({
        type: 'FILE_RECEIVED',
        file: fileRecord,
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(broadcastMsg);
        }
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, file: fileRecord }));
    });

    req.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // API 3: List files
  if (url.pathname === '/api/files' && req.method === 'GET') {
    const list = Array.from(activeFiles.values()).sort((a, b) => b.timestamp - a.timestamp);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(list));
    return;
  }

  // API 4: Get Clipboard
  if (url.pathname === '/api/clipboard' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(clipboardHistory));
    return;
  }

  // Static files fallback (Serve Vite dist if built)
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    let filePath = path.join(distPath, url.pathname === '/' ? 'index.html' : url.pathname);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(distPath, 'index.html');
    }

    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.svg': 'image/svg+xml',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.ico': 'image/x-icon',
      '.apk': 'application/vnd.android.package-archive',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading asset');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'Hop LAN Server Active', port: PORT }));
});

// WebSocket Server for Real-Time Presence & Sync
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'PEER_REGISTER') {
        connectedPeers.set(ws, data.peer);
        broadcastPeersList();
      }

      if (data.type === 'CLIPBOARD_BROADCAST') {
        clipboardHistory.unshift(data.item);
        if (clipboardHistory.length > 50) clipboardHistory.pop();

        const broadcastMsg = JSON.stringify({
          type: 'CLIPBOARD_SYNC',
          item: data.item,
        });

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(broadcastMsg);
          }
        });
      }
    } catch {
      // ignore
    }
  });

  ws.on('close', () => {
    connectedPeers.delete(ws);
    broadcastPeersList();
  });
});

function broadcastPeersList() {
  const peersList = Array.from(connectedPeers.values());
  const msg = JSON.stringify({ type: 'PEERS_UPDATE', peers: peersList });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ Hop Secure LAN Server is running at http://0.0.0.0:${PORT}`);
});
