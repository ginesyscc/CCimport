const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const https = require('https');
const http = require('http');

// ── Persistent settings store (no external dep needed) ───────────────────
const fs = require('fs');
const SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json');

function loadSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8')); }
  catch { return {}; }
}
function saveSettings(data) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2));
}

// ── Window ────────────────────────────────────────────────────────────────
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 860,
    minWidth: 1000,
    minHeight: 600,
    title: 'Kotak CC → Odoo',
    backgroundColor: '#0e1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
  // win.webContents.openDevTools(); // uncomment for debugging
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ── IPC: Settings ─────────────────────────────────────────────────────────
ipcMain.handle('settings-load', () => loadSettings());
ipcMain.handle('settings-save', (_, data) => { saveSettings(data); return true; });

// ── IPC: Odoo JSON-RPC (runs in Node — no CORS) ──────────────────────────
ipcMain.handle('odoo-rpc', async (_, { baseUrl, endpoint, params }) => {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, baseUrl);
    const body = JSON.stringify({ jsonrpc: '2.0', method: 'call', id: 1, params });
    const lib = url.protocol === 'https:' ? https : http;
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      // Accept self-signed certs for local Odoo instances
      rejectUnauthorized: false
    };
    // Pass cookies for session
    if (_.sessionCookies) options.headers['Cookie'] = _.sessionCookies;

    const req = lib.request(options, (res) => {
      let data = '';
      // Capture set-cookie
      const cookies = res.headers['set-cookie'];
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ json, cookies });
        } catch(e) { reject(new Error('Invalid JSON: ' + data.substring(0, 200))); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
});

// ── IPC: Odoo RPC with session cookie (after login) ──────────────────────
ipcMain.handle('odoo-rpc-session', async (_, { baseUrl, endpoint, params, sessionCookie }) => {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, baseUrl);
    const body = JSON.stringify({ jsonrpc: '2.0', method: 'call', id: 1, params });
    const lib = url.protocol === 'https:' ? https : http;
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(sessionCookie ? { 'Cookie': sessionCookie } : {})
      },
      rejectUnauthorized: false
    };

    const req = lib.request(options, (res) => {
      let data = '';
      const setCookies = res.headers['set-cookie'] || [];
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ json, setCookies });
        } catch(e) { reject(new Error('Parse error: ' + data.substring(0, 300))); }
      });
    });
    req.on('error', e => reject(e));
    req.write(body);
    req.end();
  });
});
