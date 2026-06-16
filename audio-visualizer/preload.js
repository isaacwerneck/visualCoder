const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Eventos que vêm do main process (menu)
  onLoadAudio: (callback) => ipcRenderer.on('load-audio', (event, data) => callback(data)),
  onFolderScanned: (callback) => ipcRenderer.on('folder-scanned', (event, data) => callback(data)),
  onTogglePanel: (callback) => ipcRenderer.on('toggle-panel', () => callback()),

  // Chamadas do tipo invoke (botões do painel)
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
});