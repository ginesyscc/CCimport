const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  loadSettings: ()       => ipcRenderer.invoke('settings-load'),
  saveSettings: (data)   => ipcRenderer.invoke('settings-save', data),

  // Odoo RPC (no CORS, runs in Node)
  odooRpc: (args)        => ipcRenderer.invoke('odoo-rpc', args),
  odooRpcSession: (args) => ipcRenderer.invoke('odoo-rpc-session', args),

  isElectron: true
});
