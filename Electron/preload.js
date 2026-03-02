const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setFullscreen: (mode) => ipcRenderer.send('set-fullscreen', mode),
  getDisplayMode: () => ipcRenderer.invoke('get-display-mode'),
  getResolutions: () => ipcRenderer.invoke('get-resolutions'),
  setResolution: (w, h) => ipcRenderer.send('set-resolution', w, h)
});
