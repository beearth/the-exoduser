const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setFullscreen: (mode) => ipcRenderer.send('set-fullscreen', mode),
  getDisplayMode: () => ipcRenderer.invoke('get-display-mode')
});
