// The only bridge between the page and the computer: read/write the ledger file and show file dialogs.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ledger', {
  load: () => ipcRenderer.invoke('ledger:load'),
  save: (text) => ipcRenderer.invoke('ledger:save', text),
  open: () => ipcRenderer.invoke('ledger:open'),
  use: (path) => ipcRenderer.invoke('ledger:use', path),
  saveAs: (text, name, kind) => ipcRenderer.invoke('ledger:saveAs', { text, name, kind }),
  showFolder: () => ipcRenderer.invoke('ledger:showFolder'),
  onMenu: (cb) => ipcRenderer.on('menu', (_e, action) => cb(action)),
});
