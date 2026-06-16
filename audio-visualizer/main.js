const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
const isDev = process.argv.includes('--dev');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    title: 'Audio Visualizer XP',
    backgroundColor: '#0a2463',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'renderer.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) mainWindow.webContents.openDevTools();
  });

  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Abrir Música...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            dialog.showOpenDialog(mainWindow, {
              title: 'Selecionar Arquivo de Música',
              filters: [{ name: 'Áudio', extensions: ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'] }, { name: 'Todos', extensions: ['*'] }],
              properties: ['openFile'],
            }).then(r => {
              if (!r.canceled && r.filePaths.length > 0) {
                mainWindow.webContents.executeJavaScript(`__loadAudioFile__(${JSON.stringify(r.filePaths[0])})`);
              }
            });
          },
        },
        {
          label: 'Abrir Pasta...',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => {
            dialog.showOpenDialog(mainWindow, {
              title: 'Selecionar Pasta de Músicas',
              properties: ['openDirectory'],
            }).then(r => {
              if (!r.canceled && r.filePaths.length > 0) {
                const folder = r.filePaths[0];
                const files = fs.readdirSync(folder);
                const exts = ['.mp3', '.wav', '.flac', '.ogg', '.aac', '.m4a'];
                const audioFiles = files.filter(f => exts.includes(path.extname(f).toLowerCase())).map(f => path.join(folder, f));
                mainWindow.webContents.executeJavaScript(`__loadFolder__(${JSON.stringify(audioFiles)})`);
              }
            });
          },
        },
        { type: 'separator' },
        { label: 'Sair', accelerator: 'Alt+F4', click: () => app.quit() },
      ],
    },
    {
      label: 'Exibir',
      submenu: [
        { label: 'Tela Cheia', accelerator: 'F11', click: () => { if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen()); } },
        { label: 'Ocultar / Mostrar Painel', accelerator: 'CmdOrCtrl+H', click: () => { if (mainWindow) mainWindow.webContents.executeJavaScript('__togglePanel__()'); } },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
      ],
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre Audio Visualizer XP',
          click: () => dialog.showMessageBox(mainWindow, { type: 'info', title: 'Sobre', message: 'Audio Visualizer XP v1.0.0' }),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });