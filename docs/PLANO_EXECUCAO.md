# 🚀 Plano de Execução — Audio Visualizer XP

**Estratégia:** Implementação modular, iterativa e testável. Cada etapa gera um prompt completo que pode ser executado por IA ou manualmente. O app é construído de baixo para cima: primeiro o esqueleto (Electron + Three.js), depois áudio, depois visuais, depois UI, depois integração.

---

## 📋 Índice das Etapas

| Etapa | Nome | Dependências | Esforço |
|---|---|---|---|
| 0 | Setup do Projeto | — | ⭐ |
| 1 | main.js — Processo Principal Electron | Etapa 0 | ⭐⭐ |
| 2 | preload.js — Ponte IPC | Etapas 0, 1 | ⭐ |
| 3 | renderer.html — Esqueleto HTML | Etapas 0, 1, 2 | ⭐⭐ |
| 4 | style.css — Tema Windows XP Aero | Etapa 3 | ⭐⭐⭐⭐ |
| 5 | AudioManager.js — Análise de Áudio | Etapas 0, 1, 2 | ⭐⭐⭐ |
| 6 | BeatDetector.js — Detecção de Beat | Etapa 5 | ⭐⭐ |
| 7 | TextureGenerator.js — Texturas Procedurais | Etapa 0 | ⭐⭐ |
| 8 | SceneManager.js — Cena Three.js | Etapas 0, 3 | ⭐⭐⭐ |
| 9 | GeometryEngine.js — Geometrias Reativas | Etapa 8 | ⭐⭐⭐⭐ |
| 10 | ParticleSystem.js — Partículas | Etapa 8 | ⭐⭐⭐ |
| 11 | LightEngine.js — Iluminação | Etapa 8 | ⭐⭐ |
| 12 | PostProcessing.js — Pós-processamento | Etapa 8 | ⭐⭐⭐ |
| 13 | VisualReactivity.js — Mapeamento Áudio→Visual | Etapas 5, 6, 9, 10, 11, 12 | ⭐⭐⭐⭐⭐ |
| 14 | FileSystem.js — Sistema de Arquivos Local | Etapas 0, 1, 2 | ⭐⭐ |
| 15 | ControlPanel.js — Painel de Controles | Etapa 14 | ⭐⭐⭐⭐ |
| 16 | renderer.js — Integração Final | Todas | ⭐⭐⭐⭐⭐ |
| 17 | Testes e Refinamento | Etapa 16 | ⭐⭐⭐ |

---

## 🔧 Etapa 0 — Setup do Projeto

### Prompt para Execução

```bash
# Criar diretório do projeto
mkdir audio-visualizer
cd audio-visualizer

# Inicializar npm
npm init -y

# Instalar dependências
npm install electron three

# Criar estrutura de pastas
mkdir src
mkdir src\audio
mkdir src\visual
mkdir src\ui
mkdir assets

# Criar arquivo .gitignore
echo node_modules/ > .gitignore
echo assets/ >> .gitignore
```

### Arquivos gerados automaticamente:
- `package.json` (com duas deps: electron, three)
- `node_modules/`
- `package-lock.json`

### Verificação
```bash
# Verificar se Electron foi instalado
npx electron --version
# Deve retornar: v30.x.x ou similar
```

---

## ⚡ Etapa 1 — main.js (Processo Principal Electron)

### Prompt para Implementação

```javascript
// main.js - Processo principal do Electron
const { app, BrowserWindow, Menu, globalShortcut, dialog, ipcMain } = require('electron');
const path = require('path');

// Variáveis globais
let mainWindow = null;
const isDev = process.argv.includes('--dev');

function createWindow() {
  // Criar janela principal
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    title: 'Audio Visualizer XP',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    frame: true,
    backgroundColor: '#0a2463',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false, // Mostrar só depois de carregar
  });

  // Carregar o HTML principal
  mainWindow.loadFile(path.join(__dirname, 'src', 'renderer.html'));

  // Mostrar janela quando carregada
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Criar menu do aplicativo
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
          click: () => openFileDialog(),
        },
        {
          label: 'Abrir Pasta...',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => openFolderDialog(),
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Exibir',
      submenu: [
        {
          label: 'Tela Cheia',
          accelerator: 'F11',
          click: () => toggleFullscreen(),
        },
        {
          label: 'Ocultar / Mostrar Painel',
          accelerator: 'CmdOrCtrl+H',
          click: () => togglePanel(),
        },
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
          click: () => showAboutDialog(),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function openFileDialog() {
  dialog.showOpenDialog(mainWindow, {
    title: 'Selecionar Arquivo de Música',
    filters: [
      { name: 'Áudio', extensions: ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'] },
      { name: 'Todos os Arquivos', extensions: ['*'] },
    ],
    properties: ['openFile'],
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      mainWindow.webContents.send('load-file', result.filePaths[0]);
    }
  });
}

function openFolderDialog() {
  dialog.showOpenDialog(mainWindow, {
    title: 'Selecionar Pasta de Músicas',
    properties: ['openDirectory'],
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      mainWindow.webContents.send('load-folder', result.filePaths[0]);
    }
  });
}

function toggleFullscreen() {
  if (mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(false);
  } else {
    mainWindow.setFullScreen(true);
  }
}

function togglePanel() {
  mainWindow.webContents.send('toggle-panel');
}

function showAboutDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Sobre Audio Visualizer XP',
    message: 'Audio Visualizer XP v1.0.0',
    detail:
      'Visualizador de áudio 3D psicodélico\n' +
      'Estilo: Windows XP Aero + Webcore + Psicodélico\n\n' +
      'Stack: Electron + Three.js + Web Audio API\n' +
      'Criado com ❤️ em 2026',
  });
}

// IPC Handlers
ipcMain.handle('get-user-data-path', () => app.getPath('userData'));

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### Verificação
```bash
# Testar se a janela abre
npx electron .
# Deve abrir uma janela azul escuro 1280x720 com menus
```

---

## 🔌 Etapa 2 — preload.js (Ponte IPC)

### Prompt para Implementação

```javascript
// preload.js - Ponte segura entre Node.js e renderizador
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Sistema de arquivos
  loadFile: (callback) => ipcRenderer.on('load-file', (event, filePath) => callback(filePath)),
  loadFolder: (callback) => ipcRenderer.on('load-folder', (event, folderPath) => callback(folderPath)),

  // UI
  togglePanel: (callback) => ipcRenderer.on('toggle-panel', () => callback()),

  // Sistema
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),

  // Diálogos nativos (invocados do renderizador)
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
});
```

---

## 🏗️ Etapa 3 — renderer.html (Esqueleto HTML)

### Prompt para Implementação

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; media-src 'self' file:;">
  <title>Audio Visualizer XP</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Container principal -->
  <div id="app">
    <!-- Container 3D (Three.js ocupa toda a tela) -->
    <div id="three-container"></div>

    <!-- Overlay de boas-vindas (mostrado antes de carregar música) -->
    <div id="welcome-overlay">
      <div class="welcome-content">
        <h1>🎵 Audio Visualizer XP</h1>
        <p>Arraste uma música aqui ou use Ctrl+O para começar</p>
        <div class="welcome-hints">
          <span>Ctrl+O — Abrir arquivo</span>
          <span>Espaço — Play/Pause</span>
          <span>F11 — Tela cheia</span>
        </div>
      </div>
    </div>

    <!-- Painel de controle lateral (esquerda) -->
    <div id="control-panel">
      <!-- Cabeçalho do painel -->
      <div class="panel-header">
        <span class="panel-title">🎛️ Controles</span>
        <button id="btn-hide-panel" class="xp-button xp-button-small" title="Ocultar painel (Ctrl+H)">✕</button>
      </div>

      <!-- Player controls -->
      <div class="panel-section">
        <div class="section-title">Player</div>
        <div class="player-controls">
          <button id="btn-prev" class="xp-button" title="Anterior">⏮</button>
          <button id="btn-play" class="xp-button xp-button-primary" title="Play/Pause (Espaço)">▶</button>
          <button id="btn-next" class="xp-button" title="Próximo">⏭</button>
          <button id="btn-stop" class="xp-button" title="Parar">⏹</button>
        </div>
        <div class="player-info">
          <span id="current-track" class="track-name">Nenhuma música</span>
          <input type="range" id="progress-bar" class="xp-slider" min="0" max="100" value="0">
          <div class="time-display">
            <span id="current-time">0:00</span>
            <span id="total-time">0:00</span>
          </div>
          <div class="volume-control">
            <label>🔊</label>
            <input type="range" id="volume-slider" class="xp-slider" min="0" max="100" value="80">
          </div>
        </div>
      </div>

      <!-- Aba de upload -->
      <div class="panel-section">
        <div class="section-title">Arquivos</div>
        <div id="drop-zone" class="drop-zone">
          <span>🎵 Arraste músicas aqui</span>
          <button id="btn-open-file" class="xp-button">Abrir arquivo</button>
          <button id="btn-open-folder" class="xp-button">Abrir pasta</button>
        </div>
      </div>

      <!-- Playlist -->
      <div class="panel-section">
        <div class="section-title">Playlist</div>
        <div id="playlist" class="playlist">
          <span class="playlist-empty">Nenhuma música na playlist</span>
        </div>
      </div>

      <!-- Controles visuais -->
      <div class="panel-section">
        <div class="section-title">Áudio → Visual</div>
        <!-- Sensibilidade -->
        <div class="control-group">
          <label class="control-label">Sensibilidade Graves</label>
          <input type="range" id="sens-bass" class="xp-slider" min="0" max="200" value="100">
          <span class="control-value" id="sens-bass-value">100%</span>
        </div>
        <div class="control-group">
          <label class="control-label">Sensibilidade Médios</label>
          <input type="range" id="sens-mid" class="xp-slider" min="0" max="200" value="100">
          <span class="control-value" id="sens-mid-value">100%</span>
        </div>
        <div class="control-group">
          <label class="control-label">Sensibilidade Agudos</label>
          <input type="range" id="sens-treble" class="xp-slider" min="0" max="200" value="100">
          <span class="control-value" id="sens-treble-value">100%</span>
        </div>
      </div>

      <!-- Configurações visuais -->
      <div class="panel-section">
        <div class="section-title">Visual</div>
        <div class="control-group">
          <label class="control-label">Modo Visual</label>
          <select id="visual-mode" class="xp-select">
            <option value="hybrid">Híbrido (tudo)</option>
            <option value="shapes">Apenas Formas</option>
            <option value="particles">Apenas Partículas</option>
            <option value="wireframe">Wireframe</option>
          </select>
        </div>
        <div class="control-group">
          <label class="control-label">Geometria Base</label>
          <select id="base-geometry" class="xp-select">
            <option value="cube">Cubo</option>
            <option value="sphere">Esfera</option>
            <option value="torus">Toróide</option>
            <option value="icosahedron">Icosaedro</option>
            <option value="dodecahedron">Dodecaedro</option>
            <option value="torusKnot">Nó Toroidal</option>
            <option value="cone">Cone</option>
            <option value="cylinder">Cilindro</option>
          </select>
        </div>
        <div class="control-group">
          <label class="control-label">Número de Objetos</label>
          <input type="range" id="object-count" class="xp-slider" min="1" max="200" value="20">
          <span class="control-value" id="object-count-value">20</span>
        </div>
        <div class="control-group">
          <label class="control-label">Tamanho Base</label>
          <input type="range" id="object-size" class="xp-slider" min="10" max="300" value="100">
          <span class="control-value" id="object-size-value">100%</span>
        </div>
        <div class="control-group">
          <label class="control-label">Velocidade Base</label>
          <input type="range" id="speed" class="xp-slider" min="0" max="300" value="100">
          <span class="control-value" id="speed-value">100%</span>
        </div>
        <div class="control-group">
          <label class="control-label">Intensidade Bloom</label>
          <input type="range" id="bloom-intensity" class="xp-slider" min="0" max="100" value="30">
          <span class="control-value" id="bloom-intensity-value">30%</span>
        </div>
      </div>

      <!-- Cores -->
      <div class="panel-section">
        <div class="section-title">Cores</div>
        <div class="control-group">
          <label class="control-label">Paleta</label>
          <select id="color-palette" class="xp-select">
            <option value="xp-classic">XP Classic</option>
            <option value="neon-cyber">Neon Cyber</option>
            <option value="sunset-psy">Sunset Psy</option>
            <option value="chrome-robot">Chrome Robot</option>
            <option value="aero-glass">Aero Glass</option>
          </select>
        </div>
      </div>

      <!-- Toggles -->
      <div class="panel-section">
        <div class="section-title">Efeitos</div>
        <label class="xp-toggle">
          <input type="checkbox" id="toggle-wireframe">
          <span class="toggle-label">Wireframe</span>
        </label>
        <label class="xp-toggle">
          <input type="checkbox" id="toggle-transparency">
          <span class="toggle-label">Transparência</span>
        </label>
        <label class="xp-toggle">
          <input type="checkbox" id="toggle-particles" checked>
          <span class="toggle-label">Partículas</span>
        </label>
        <label class="xp-toggle">
          <input type="checkbox" id="toggle-reflection">
          <span class="toggle-label">Reflexão (Chrome)</span>
        </label>
        <label class="xp-toggle">
          <input type="checkbox" id="toggle-chromatic">
          <span class="toggle-label">Aberração Cromática</span>
        </label>
      </div>
    </div>
  </div>

  <!-- Scripts -->
  <script src="../node_modules/three/build/three.min.js"></script>
  <script src="../node_modules/three/examples/js/controls/OrbitControls.js"></script>
  <script src="../node_modules/three/examples/js/postprocessing/EffectComposer.js"></script>
  <script src="../node_modules/three/examples/js/postprocessing/RenderPass.js"></script>
  <script src="../node_modules/three/examples/js/postprocessing/UnrealBloomPass.js"></script>
  <script src="../node_modules/three/examples/js/postprocessing/ShaderPass.js"></script>
  <script src="../node_modules/three/examples/js/shaders/CopyShader.js"></script>
  <script src="../node_modules/three/examples/js/shaders/LuminosityHighPassShader.js"></script>

  <!-- Módulos do app -->
  <script src="audio/AudioManager.js"></script>
  <script src="audio/BeatDetector.js"></script>
  <script src="visual/TextureGenerator.js"></script>
  <script src="visual/SceneManager.js"></script>
  <script src="visual/GeometryEngine.js"></script>
  <script src="visual/ParticleSystem.js"></script>
  <script src="visual/LightEngine.js"></script>
  <script src="visual/PostProcessing.js"></script>
  <script src="visual/VisualReactivity.js"></script>
  <script src="ui/FileSystem.js"></script>
  <script src="ui/ControlPanel.js"></script>
  <script src="renderer.js"></script>
</body>
</html>
```

---

## 🎨 Etapa 4 — style.css (Tema Windows XP Aero)

### Prompt para Implementação

```css
/* style.css — Tema Windows XP Aero + Psicodélico Robô */

/* === RESET & BASE === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none;
}

:root {
  /* Cores XP Classic */
  --xp-blue-dark: #0a2463;
  --xp-blue: #3a6ea5;
  --xp-blue-light: #4a8bc2;
  --xp-green: #68bd42;
  --xp-silver: #d4d0c8;
  --xp-silver-dark: #a0a0a0;
  --xp-gold: #ffcc00;
  --xp-white: #e8f0fe;

  /* Cores psicodélicas */
  --neon-magenta: #ff00ff;
  --neon-cyan: #00ffff;
  --neon-yellow: #ffff00;

  /* Glassmorphism */
  --glass-bg: rgba(10, 36, 99, 0.85);
  --glass-border: rgba(255, 255, 255, 0.15);
  --glass-shadow: rgba(0, 0, 0, 0.4);

  /* Dimensões */
  --panel-width: 320px;
  --header-height: 32px;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Tahoma', 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, var(--xp-blue-dark), var(--xp-blue));
  color: var(--xp-white);
}

/* === APP CONTAINER === */
#app {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
}

/* === THREE.JS CONTAINER === */
#three-container {
  flex: 1;
  position: relative;
  z-index: 1;
  background: #000;
}

#three-container canvas {
  display: block;
}

/* === WELCOME OVERLAY === */
#welcome-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  background: radial-gradient(ellipse at center, rgba(10,36,99,0.7), rgba(0,0,0,0.9));
  pointer-events: none;
  transition: opacity 0.5s ease;
}

#welcome-overlay.hidden {
  opacity: 0;
  pointer-events: none;
}

.welcome-content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.welcome-content h1 {
  font-size: 2rem;
  margin-bottom: 12px;
  background: linear-gradient(135deg, var(--xp-gold), var(--xp-green), var(--xp-blue-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
}

.welcome-content p {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 24px;
}

.welcome-hints {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.8rem;
  opacity: 0.6;
}

/* === CONTROL PANEL === */
#control-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--panel-width);
  height: 100%;
  z-index: 10;
  background: var(--glass-bg);
  border-right: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
  box-shadow: 4px 0 24px var(--glass-shadow);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  overflow: hidden;
}

#control-panel.hidden {
  transform: translateX(calc(var(--panel-width) * -1));
}

/* Panel Header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(180deg, var(--xp-blue), var(--xp-blue-dark));
  border-bottom: 1px solid var(--glass-border);
  min-height: 40px;
}

.panel-title {
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--xp-white);
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

/* Panel Sections */
.panel-section {
  padding: 10px 12px;
  border-bottom: 1px solid var(--glass-border);
}

.section-title {
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--xp-gold);
  margin-bottom: 8px;
}

/* Scroll do painel */
#control-panel {
  scrollbar-width: thin;
  scrollbar-color: var(--xp-silver-dark) transparent;
}

#control-panel::-webkit-scrollbar {
  width: 6px;
}

#control-panel::-webkit-scrollbar-track {
  background: transparent;
}

#control-panel::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--xp-silver), var(--xp-silver-dark));
  border-radius: 3px;
}

/* === PLAYER CONTROLS === */
.player-controls {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.track-name {
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.9;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  opacity: 0.6;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-control label {
  font-size: 0.8rem;
}

/* === XP BUTTONS === */
.xp-button {
  background: linear-gradient(180deg, #f0f0f0, #d4d0c8);
  border: 1px solid #808080;
  border-radius: 3px;
  padding: 4px 12px;
  font-family: 'Tahoma', sans-serif;
  font-size: 0.75rem;
  color: #000;
  cursor: pointer;
  transition: all 0.1s;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
}

.xp-button:hover {
  background: linear-gradient(180deg, #fff, #e0dcd4);
  border-color: #666;
}

.xp-button:active {
  background: linear-gradient(180deg, #c0b8a8, #d4d0c8);
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
}

.xp-button-primary {
  background: linear-gradient(180deg, #7ecf5e, #4a9e2d);
  border-color: #2d7a1a;
  color: #fff;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.3);
}

.xp-button-primary:hover {
  background: linear-gradient(180deg, #8fe06e, #5aae3d);
}

.xp-button-small {
  padding: 2px 8px;
  font-size: 0.7rem;
}

/* === XP SLIDER === */
.xp-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, var(--xp-blue-dark), var(--xp-blue-light));
  border-radius: 3px;
  outline: none;
  border: 1px solid var(--glass-border);
}

.xp-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: linear-gradient(180deg, #e8e4dc, #b8b0a8);
  border: 1px solid #808080;
  border-radius: 2px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.xp-slider::-webkit-slider-thumb:hover {
  background: linear-gradient(180deg, #fff, #d0c8c0);
}

/* === XP SELECT === */
.xp-select {
  width: 100%;
  padding: 4px 8px;
  background: linear-gradient(180deg, #f0f0f0, #d4d0c8);
  border: 1px solid #808080;
  border-radius: 3px;
  font-family: 'Tahoma', sans-serif;
  font-size: 0.75rem;
  color: #000;
  cursor: pointer;
}

.xp-select:focus {
  outline: 1px solid var(--xp-blue-light);
}

/* === XP TOGGLE === */
.xp-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 0;
}

.xp-toggle input[type="checkbox"] {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #fff;
  border: 1px solid #808080;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.xp-toggle input[type="checkbox"]:checked {
  background: var(--xp-blue);
  border-color: var(--xp-blue-dark);
}

.xp-toggle input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 12px;
  font-weight: bold;
}

.toggle-label {
  font-size: 0.75rem;
  opacity: 0.9;
}

/* === CONTROL GROUP === */
.control-group {
  margin-bottom: 8px;
}

.control-label {
  display: block;
  font-size: 0.7rem;
  margin-bottom: 2px;
  opacity: 0.8;
}

.control-value {
  font-size: 0.65rem;
  opacity: 0.6;
  float: right;
  margin-top: -18px;
}

/* === DROP ZONE === */
.drop-zone {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: 2px dashed var(--glass-border);
  border-radius: 8px;
  text-align: center;
  font-size: 0.75rem;
  opacity: 0.7;
  transition: all 0.2s;
  cursor: pointer;
}

.drop-zone.drag-over {
  border-color: var(--xp-green);
  background: rgba(104, 189, 66, 0.1);
  opacity: 1;
}

.drop-zone span {
  margin-bottom: 8px;
}

/* === PLAYLIST === */
.playlist {
  max-height: 120px;
  overflow-y: auto;
}

.playlist::-webkit-scrollbar {
  width: 4px;
}

.playlist::-webkit-scrollbar-thumb {
  background: var(--xp-silver-dark);
  border-radius: 2px;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  font-size: 0.7rem;
  cursor: pointer;
  border-radius: 3px;
  transition: background 0.1s;
}

.playlist-item:hover {
  background: rgba(255,255,255,0.1);
}

.playlist-item.active {
  background: rgba(104, 189, 66, 0.2);
  border-left: 2px solid var(--xp-green);
}

.playlist-item .track-index {
  width: 20px;
  opacity: 0.5;
  font-size: 0.65rem;
}

.playlist-item .track-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-item .track-duration {
  opacity: 0.5;
  font-size: 0.65rem;
  margin-left: 8px;
}

.playlist-empty {
  font-size: 0.7rem;
  opacity: 0.5;
  font-style: italic;
}

/* === FULLSCREEN MODE === */
#app.fullscreen #control-panel {
  transform: translateX(calc(var(--panel-width) * -1));
}

/* === ANIMAÇÕES === */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(255,255,255,0.1); }
  50% { box-shadow: 0 0 20px rgba(255,255,255,0.2); }
}

.xp-button-primary {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* === RESPONSIVO === */
@media (max-width: 900px) {
  #control-panel {
    width: 280px;
  }
}
```

---

## 🎵 Etapa 5 — AudioManager.js

```javascript
// AudioManager.js — Web Audio API: decode, play, FFT analysis
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.analyserNode = null;
    this.audioBuffer = null;
    this.sourceNode = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.startTime = 0;
    this.pausedAt = 0;

    // Dados de frequência
    this.fftSize = 2048;
    this.frequencyData = new Uint8Array(this.fftSize / 2);
    this.timeDomainData = new Uint8Array(this.fftSize / 2);

    // Bandas de frequência
    this.bass = 0;
    this.mid = 0;
    this.treble = 0;
    this.amplitude = 0;

    // Sensibilidade (0-2, padrão 1)
    this.sensitivity = { bass: 1, mid: 1, treble: 1 };

    // Configuração de bandas
    this.bands = {
      bassStart: 0,
      bassEnd: 6,       // ~20-250Hz
      midStart: 7,
      midEnd: 63,       // ~250-2000Hz
      trebleStart: 64,
      trebleEnd: 127,   // ~2000-20000Hz
    };

    this.currentFile = null;
    this.duration = 0;
    this.onTimeUpdate = null;
    this.onEnded = null;

    this._init();
  }

  _init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = this.fftSize;
    this.analyserNode.smoothingTimeConstant = 0.8;

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.8;

    // Conectar: source → gain → analyser → destination
    // (source é criado dinamicamente)

    this._analyserLoop();
  }

  // Carregar arquivo de áudio do sistema de arquivos local
  async loadFromFile(arrayBuffer, fileName) {
    try {
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.currentFile = fileName;
      this.duration = this.audioBuffer.duration;
      this.pausedAt = 0;
      console.log(`[AudioManager] Carregado: ${fileName} (${this.duration.toFixed(1)}s)`);
      return true;
    } catch (err) {
      console.error('[AudioManager] Erro ao decodificar áudio:', err);
      return false;
    }
  }

  play() {
    if (!this.audioBuffer) return;

    // Criar nova fonte
    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.connect(this.gainNode);
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);

    // Iniciar da posição pausada
    this.sourceNode.start(0, this.pausedAt);
    this.startTime = this.audioContext.currentTime - this.pausedAt;
    this.isPlaying = true;

    // Evento de fim
    this.sourceNode.onended = () => {
      if (this.isPlaying) {
        this.isPlaying = false;
        if (this.onEnded) this.onEnded();
      }
    };

    // Retomar contexto se suspenso (navegador)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  pause() {
    if (!this.isPlaying || !this.sourceNode) return;
    this.pausedAt = this.audioContext.currentTime - this.startTime;
    this.sourceNode.stop();
    this.sourceNode.disconnect();
    this.sourceNode = null;
    this.isPlaying = false;
  }

  stop() {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    this.isPlaying = false;
    this.pausedAt = 0;
  }

  seek(time) {
    if (!this.audioBuffer) return;
    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.stop();
    this.pausedAt = Math.max(0, Math.min(time, this.duration));
    if (wasPlaying) this.play();
  }

  setVolume(value) {
    // value: 0-100
    this.gainNode.gain.value = value / 100;
  }

  getCurrentTime() {
    if (!this.isPlaying) return this.pausedAt;
    return this.audioContext.currentTime - this.startTime;
  }

  _analyserLoop() {
    // Loop de análise que roda a cada frame (via requestAnimationFrame)
    const analyse = () => {
      if (this.analyserNode) {
        this.analyserNode.getByteFrequencyData(this.frequencyData);
        this.analyserNode.getByteTimeDomainData(this.timeDomainData);

        // Calcular bandas
        this._calculateBands();
        this.amplitude = this._calculateAmplitude();

        // Callback de tempo
        if (this.isPlaying && this.onTimeUpdate) {
          this.onTimeUpdate(this.getCurrentTime(), this.duration);
        }
      }
      requestAnimationFrame(analyse);
    };
    analyse();
  }

  _calculateBands() {
    const data = this.frequencyData;
    let bassSum = 0, midSum = 0, trebleSum = 0;
    const bassCount = this.bands.bassEnd - this.bands.bassStart + 1;
    const midCount = this.bands.midEnd - this.bands.midStart + 1;
    const trebleCount = this.bands.trebleEnd - this.bands.trebleStart + 1;

    for (let i = this.bands.bassStart; i <= this.bands.bassEnd; i++) {
      bassSum += data[i] || 0;
    }
    for (let i = this.bands.midStart; i <= this.bands.midEnd; i++) {
      midSum += data[i] || 0;
    }
    for (let i = this.bands.trebleStart; i <= this.bands.trebleEnd; i++) {
      trebleSum += data[i] || 0;
    }

    // Normalizar para 0-1 e aplicar sensibilidade
    this.bass = (bassSum / bassCount / 255) * this.sensitivity.bass;
    this.mid = (midSum / midCount / 255) * this.sensitivity.mid;
    this.treble = (trebleSum / trebleCount / 255) * this.sensitivity.treble;

    // Limitar a 1
    this.bass = Math.min(this.bass, 1);
    this.mid = Math.min(this.mid, 1);
    this.treble = Math.min(this.treble, 1);
  }

  _calculateAmplitude() {
    let sum = 0;
    for (let i = 0; i < this.timeDomainData.length; i++) {
      const value = (this.timeDomainData[i] - 128) / 128;
      sum += value * value;
    }
    return Math.sqrt(sum / this.timeDomainData.length);
  }

  // Dados para visualização (média de frequências em N bandas)
  getFrequencyBands(numBands = 16) {
    const data = this.frequencyData;
    const bandSize = Math.floor(data.length / numBands);
    const bands = [];
    for (let i = 0; i < numBands; i++) {
      let sum = 0;
      const start = i * bandSize;
      const end = i === numBands - 1 ? data.length : start + bandSize;
      for (let j = start; j < end; j++) {
        sum += data[j] || 0;
      }
      bands.push(sum / bandSize / 255);
    }
    return bands;
  }

  dispose() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
```

---

## 🔄 Etapa 6 — BeatDetector.js

```javascript
// BeatDetector.js — Detecção de kicks e BPM
class BeatDetector {
  constructor(audioManager) {
    this.audioManager = audioManager;

    // Estado
    this.isBeat = false;
    this.bpm = 120;
    this.beatConfidence = 0;
    this.lastBeatTime = 0;

    // Parâmetros
    this.minBPM = 60;
    this.maxBPM = 180;
    this.beatThreshold = 0.6;
    this.historySize = 43; // ~1 segundo a 2048 FFT

    // Histórico de energia de graves
    this.energyHistory = [];
    this.instantEnergy = 0;
    this.averageEnergy = 0;
    this.variance = 0;

    // Timer para beat visual
    this.beatTimer = 0;
    this.beatDuration = 0.15; // segundos
  }

  update() {
    const bass = this.audioManager.bass;

    // Energia instantânea
    this.instantEnergy = bass * bass;

    // Adicionar ao histórico
    this.energyHistory.push(this.instantEnergy);
    if (this.energyHistory.length > this.historySize) {
      this.energyHistory.shift();
    }

    // Calcular média e variância
    const sum = this.energyHistory.reduce((a, b) => a + b, 0);
    this.averageEnergy = sum / this.energyHistory.length;

    const varianceSum = this.energyHistory.reduce((a, b) => a + (b - this.averageEnergy) ** 2, 0);
    this.variance = varianceSum / this.energyHistory.length;
    const stdDev = Math.sqrt(this.variance);

    // Detecção de beat: energia instantânea > média + C * desvio padrão
    const threshold = this.averageEnergy + this.beatThreshold * stdDev;
    this.isBeat = this.instantEnergy > threshold && bass > 0.3;

    // Calcular BPM estimado
    if (this.isBeat) {
      const now = Date.now();
      if (this.lastBeatTime > 0) {
        const interval = (now - this.lastBeatTime) / 1000; // segundos
        if (interval > 0.3 && interval < 2.0) {
          const instantBPM = 60 / interval;
          this.bpm = this.bpm * 0.7 + instantBPM * 0.3;
          this.bpm = Math.max(this.minBPM, Math.min(this.maxBPM, this.bpm));
        }
      }
      this.lastBeatTime = now;
      this.beatTimer = this.beatDuration;
    }

    // Timer do beat
    if (this.beatTimer > 0) {
      this.beatTimer -= 1 / 60; // assume 60fps
    }
  }

  isBeatActive() {
    return this.beatTimer > 0;
  }

  getBeatIntensity() {
    // 0-1, quão forte é o beat atual
    if (this.beatTimer <= 0) return 0;
    return Math.min(1, this.beatTimer / this.beatDuration);
  }
}
```

---

## 🎭 Etapa 7 — TextureGenerator.js

```javascript
// TextureGenerator.js — Texturas procedurais via Canvas 2D
class TextureGenerator {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 256;
    this.canvas.height = 256;
  }

  // Gradiente XP (azul característico)
  createXPGradient() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#3a6ea5');
    gradient.addColorStop(0.5, '#4a8bc2');
    gradient.addColorStop(1, '#2a5a8a');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    return this._createTexture();
  }

  // Efeito Chrome metálico
  createChromeTexture() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#e8e8e8');
    gradient.addColorStop(0.2, '#a0a0a0');
    gradient.addColorStop(0.4, '#ffffff');
    gradient.addColorStop(0.6, '#808080');
    gradient.addColorStop(0.8, '#c0c0c0');
    gradient.addColorStop(1, '#606060');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Detalhes metálicos
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`;
      ctx.fill();
    }

    return this._createTexture();
  }

  // Gradiente psicodélico (arco-íris radial)
  createPsychedelicTexture() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy);

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, '#ff00ff');
    gradient.addColorStop(0.2, '#00ffff');
    gradient.addColorStop(0.4, '#ffff00');
    gradient.addColorStop(0.6, '#ff0000');
    gradient.addColorStop(0.8, '#00ff00');
    gradient.addColorStop(1, '#0000ff');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    return this._createTexture();
  }

  // Grade CRT (scanlines)
  createCRTTexture() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < h; y += 4) {
      ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.02})`;
      ctx.fillRect(0, y, w, 1);
    }

    return this._createTexture();
  }

  // Textura de ruído para superfície orgânica
  createNoiseTexture() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;     // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 255;   // A
    }

    ctx.putImageData(imageData, 0, 0);
    return this._createTexture();
  }

  // Gradiente animado (cores que mudam com o som)
  createAnimatedGradient(bass, mid, treble) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const r = Math.floor(100 + 155 * bass);
    const g = Math.floor(50 + 205 * mid);
    const b = Math.floor(150 + 105 * treble);

    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, `rgb(${r},${g},${b})`);
    gradient.addColorStop(0.5, `rgb(${g},${b},${r})`);
    gradient.addColorStop(1, `rgb(${b},${r},${g})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    return this._createTexture();
  }

  _createTexture() {
    const texture = new THREE.CanvasTexture(this.canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }
}
```

---

## 🌐 Etapa 8 — SceneManager.js

```javascript
// SceneManager.js — Gerenciamento da cena Three.js
class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Configuração
    this.backgroundColor = 0x000000;
    this.fov = 60;
    this.near = 0.1;
    this.far = 1000;
    this.cameraDistance = 15;

    this._init();
  }

  _init() {
    // Cena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.backgroundColor);
    this.scene.fog = new THREE.FogExp2(this.backgroundColor, 0.02);

    // Câmera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(this.fov, aspect, this.near, this.far);
    this.camera.position.set(0, 2, this.cameraDistance);
    this.camera.lookAt(0, 0, 0);

    // Renderizador
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);

    // Resize
    this._handleResize();
    window.addEventListener('resize', () => this._handleResize());
  }

  _handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate(callback) {
    const loop = () => {
      requestAnimationFrame(loop);
      const delta = this.clock.getDelta();
      const elapsedTime = this.clock.getElapsedTime();
      if (callback) callback(delta, elapsedTime);
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  getSizes() {
    return {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
  }

  dispose() {
    this.renderer.dispose();
    this.scene.clear();
  }
}
```

---

## 🔶 Etapa 9 — GeometryEngine.js

```javascript
// GeometryEngine.js — Geometrias reativas ao som
class GeometryEngine {
  constructor(sceneManager) {
    this.scene = sceneManager.scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Configuração
    this.geometryType = 'cube';
    this.count = 20;
    this.size = 1;
    this.wireframe = false;
    this.transparency = false;
    this.speed = 1;

    // Objetos
    this.objects = [];
    this.targetPositions = [];
    this.targetScales = [];
    this.targetRotations = [];
    this.originalPositions = [];

    // Cores
    this.colors = {
      primary: new THREE.Color(0x3a6ea5),
      secondary: new THREE.Color(0x68bd42),
      accent: new THREE.Color(0xffcc00),
    };

    // Paletas
    this.palettes = {
      'xp-classic': { primary: 0x3a6ea5, secondary: 0x68bd42, accent: 0xffcc00 },
      'neon-cyber': { primary: 0xff00ff, secondary: 0x00ffff, accent: 0xffff00 },
      'sunset-psy': { primary: 0xff4500, secondary: 0xff1493, accent: 0xffd700 },
      'chrome-robot': { primary: 0xc0c0c0, secondary: 0xff6600, accent: 0x00bfff },
      'aero-glass': { primary: 0xe8f0fe, secondary: 0x4fc3f7, accent: 0xffffff },
    };

    this.currentPalette = 'xp-classic';
    this.materialType = 'standard';

    this._build();
  }

  _build() {
    this._clear();
    this._createGeometries();
  }

  _clear() {
    this.objects.forEach(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      this.group.remove(obj);
    });
    this.objects = [];
    this.targetPositions = [];
    this.targetScales = [];
    this.targetRotations = [];
    this.originalPositions = [];
  }

  _createGeometries() {
    const pal = this.palettes[this.currentPalette];

    for (let i = 0; i < this.count; i++) {
      const geometry = this._createGeometry(this.geometryType);
      const material = this._createMaterial(pal, i);
      const mesh = new THREE.Mesh(geometry, material);

      // Posição em grade esférica
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 3 + Math.random() * 5;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi) * 1.5;
      const z = radius * Math.sin(phi) * Math.sin(theta);

      mesh.position.set(x, y, z);
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        0
      );

      const scale = 0.3 + Math.random() * 0.7;
      mesh.scale.set(scale, scale, scale);

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Armazenar estado original e alvo
      this.originalPositions.push({ x, y, z });
      this.targetPositions.push({ x, y, z });
      this.targetScales.push({ x: scale, y: scale, z: scale });
      this.targetRotations.push({ x: 0, y: 0, z: 0 });

      // Metadados
      mesh.userData = {
        index: i,
        baseScale: scale,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
        hue: Math.random(),
      };

      this.group.add(mesh);
      this.objects.push(mesh);
    }
  }

  _createGeometry(type) {
    const detail = 2;
    switch (type) {
      case 'cube': return new THREE.BoxGeometry(1, 1, 1);
      case 'sphere': return new THREE.SphereGeometry(0.6, 32, 32);
      case 'torus': return new THREE.TorusGeometry(0.6, 0.25, 16, 32);
      case 'icosahedron': return new THREE.IcosahedronGeometry(0.6, detail);
      case 'dodecahedron': return new THREE.DodecahedronGeometry(0.6, detail);
      case 'torusKnot': return new THREE.TorusKnotGeometry(0.5, 0.2, 64, 8, 2, 3);
      case 'cone': return new THREE.ConeGeometry(0.6, 1, 32);
      case 'cylinder': return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
      default: return new THREE.BoxGeometry(1, 1, 1);
    }
  }

  _createMaterial(pal, index) {
    const hue = (index / this.count + Math.random() * 0.1) % 1;
    const color = new THREE.Color().setHSL(hue, 0.8, 0.5);

    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.3,
      roughness: 0.4,
      wireframe: this.wireframe,
      transparent: this.transparency,
      opacity: this.transparency ? 0.6 : 1,
      envMapIntensity: 0.5,
    });

    return material;
  }

  // Atualizar com dados de áudio (chamado a cada frame)
  update(audioData, beatDetector, time) {
    const { bass, mid, treble, amplitude } = audioData;
    const isBeat = beatDetector.isBeatActive();
    const beatIntensity = beatDetector.getBeatIntensity();

    this.objects.forEach((obj, i) => {
      const ud = obj.userData;
      const phase = ud.phase + time * 0.5 * ud.speed * this.speed;

      // Escala reativa aos graves
      const bassScale = 1 + bass * 2 * (0.5 + Math.sin(phase) * 0.5);
      const beatScale = isBeat ? 1 + beatIntensity * 1.5 : 1;
      const scale = this.targetScales[i].x * bassScale * beatScale;
      obj.scale.set(scale, scale, scale);

      // Rotação reativa aos médios
      obj.rotation.x += mid * 0.02 * this.speed;
      obj.rotation.y += treble * 0.03 * this.speed;
      obj.rotation.z += bass * 0.01 * this.speed;

      // Posição reativa: objetos se movem com a música
      const moveX = Math.sin(time * 0.5 * ud.speed + phase) * bass * 1.5;
      const moveY = Math.cos(time * 0.3 * ud.speed + phase) * mid * 1.5;
      const moveZ = Math.sin(time * 0.7 * ud.speed + phase) * treble * 1.5;

      obj.position.x = this.originalPositions[i].x + moveX;
      obj.position.y = this.originalPositions[i].y + moveY;
      obj.position.z = this.originalPositions[i].z + moveZ;

      // Cor reativa aos agudos
      if (obj.material) {
        const hue = (ud.hue + treble * 0.1 + time * 0.02) % 1;
        const saturation = 0.7 + bass * 0.3;
        const lightness = 0.3 + mid * 0.5;
        obj.material.color.setHSL(hue, saturation, lightness);

        // Emissão no beat
        if (isBeat) {
          obj.material.emissive = obj.material.color;
          obj.material.emissiveIntensity = beatIntensity * 2;
        } else {
          obj.material.emissiveIntensity *= 0.95;
        }
      }
    });
  }

  // Métodos de configuração
  setGeometryType(type) {
    this.geometryType = type;
    this._build();
  }

  setCount(count) {
    this.count = count;
    this._build();
  }

  setWireframe(enabled) {
    this.wireframe = enabled;
    this.objects.forEach(obj => {
      if (obj.material) obj.material.wireframe = enabled;
    });
  }

  setTransparency(enabled) {
    this.transparency = enabled;
    this.objects.forEach(obj => {
      if (obj.material) {
        obj.material.transparent = enabled;
        obj.material.opacity = enabled ? 0.6 : 1;
      }
    });
  }

  setPalette(paletteName) {
    if (this.palettes[paletteName]) {
      this.currentPalette = paletteName;
      this._build();
    }
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  // Remover o grupo da cena
  dispose() {
    this._clear();
    this.scene.remove(this.group);
  }
}
```

---

## ✨ Etapa 10 — ParticleSystem.js

```javascript
// ParticleSystem.js — Sistema de partículas reativas ao som
class ParticleSystem {
  constructor(sceneManager) {
    this.scene = sceneManager.scene;
    this.particles = null;
    this.particleCount = 5000;

    // Dados das partículas
    this.positions = new Float32Array(this.particleCount * 3);
    this.colors = new Float32Array(this.particleCount * 3);
    this.sizes = new Float32Array(this.particleCount);
    this.velocities = [];

    // Cor base
    this.baseColor = new THREE.Color(0x4a8bc2);

    this._init();
  }

  _init() {
    // Criar geometria de pontos
    const geometry = new THREE.BufferGeometry();

    // Inicializar posições em nuvem esférica
    for (let i = 0; i < this.particleCount; i++) {
      const radius = 5 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      this.positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      this.positions[i * 3 + 1] = radius * Math.cos(phi) * 1.5;
      this.positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      this.sizes[i] = 0.05 + Math.random() * 0.15;

      this.velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    // Material de pontos
    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  update(audioData, beatDetector, time) {
    const { bass, mid, treble, amplitude } = audioData;
    const positions = this.particles.geometry.attributes.position.array;
    const colors = this.particles.geometry.attributes.color.array;
    const isBeat = beatDetector.isBeatActive();
    const size = this.particles.material.size;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // Movimento reativo ao som
      this.velocities[i].x += (Math.random() - 0.5) * bass * 0.05;
      this.velocities[i].y += (Math.random() - 0.5) * mid * 0.05;
      this.velocities[i].z += (Math.random() - 0.5) * treble * 0.05;

      // Amortecimento
      this.velocities[i].x *= 0.98;
      this.velocities[i].y *= 0.98;
      this.velocities[i].z *= 0.98;

      // Atualizar posição
      positions[i3] += this.velocities[i].x;
      positions[i3 + 1] += this.velocities[i].y;
      positions[i3 + 2] += this.velocities[i].z;

      // Manter dentro de um raio máximo
      const px = positions[i3];
      const py = positions[i3 + 1];
      const pz = positions[i3 + 2];
      const dist = Math.sqrt(px * px + py * py + pz * pz);
      const maxDist = 12;
      if (dist > maxDist) {
        positions[i3] *= 0.99;
        positions[i3 + 1] *= 0.99;
        positions[i3 + 2] *= 0.99;
      }

      // Cor baseada em posição e áudio
      const hue = (dist / maxDist + treble * 0.2 + time * 0.01) % 1;
      const color = new THREE.Color().setHSL(hue, 0.8, 0.5 + bass * 0.3);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    // Marcar atributos para atualização
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.color.needsUpdate = true;

    // Tamanho reativo
    this.particles.material.size = 0.1 + amplitude * 0.3;
    this.particles.material.opacity = 0.5 + treble * 0.5;
  }

  setEnabled(enabled) {
    this.particles.visible = enabled;
  }

  dispose() {
    this.scene.remove(this.particles);
    this.particles.geometry.dispose();
    this.particles.material.dispose();
  }
}
```

---

## 💡 Etapa 11 — LightEngine.js

```javascript
// LightEngine.js — Iluminação dinâmica reativa ao som
class LightEngine {
  constructor(sceneManager) {
    this.scene = sceneManager.scene;

    // Luzes
    this.ambientLight = null;
    this.directionalLight = null;
    this.pointLight = null;
    this.spotLight = null;

    this._init();
  }

  _init() {
    // Luz ambiente (iluminação base)
    this.ambientLight = new THREE.AmbientLight(0x222244, 0.3);
    this.scene.add(this.ambientLight);

    // Luz direcional (sombra)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(5, 10, 5);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.scene.add(this.directionalLight);

    // Luz pontual colorida (reativa aos graves)
    this.pointLight = new THREE.PointLight(0x3a6ea5, 2, 20);
    this.pointLight.position.set(-3, 2, 2);
    this.scene.add(this.pointLight);

    // Luz spot (efeito dramático)
    this.spotLight = new THREE.SpotLight(0x4a8bc2, 1, 30, Math.PI / 4, 0.5, 1);
    this.spotLight.position.set(0, 8, 0);
    this.spotLight.target.position.set(0, 0, 0);
    this.scene.add(this.spotLight);
    this.scene.add(this.spotLight.target);
  }

  update(audioData, beatDetector, time) {
    const { bass, mid, treble, amplitude } = audioData;
    const isBeat = beatDetector.isBeatActive();
    const beatIntensity = beatDetector.getBeatIntensity();

    // Luz ambiente: cor e intensidade reativas
    const ambientHue = (time * 0.02) % 1;
    this.ambientLight.color.setHSL(ambientHue, 0.3, 0.2 + bass * 0.3);
    this.ambientLight.intensity = 0.2 + mid * 0.4;

    // Luz direcional: ângulo reativo aos médios
    const dirAngle = time * 0.1 + mid * 2;
    this.directionalLight.position.x = Math.sin(dirAngle) * 8;
    this.directionalLight.position.z = Math.cos(dirAngle) * 8;
    this.directionalLight.position.y = 5 + treble * 5;
    this.directionalLight.intensity = 0.5 + amplitude * 1.5;

    // Luz pontual: cor e posição reativa aos graves
    const pointHue = (bass * 0.5 + time * 0.05) % 1;
    this.pointLight.color.setHSL(pointHue, 0.8, 0.5);
    this.pointLight.position.x = Math.sin(time * 0.5) * 4 * (1 + bass);
    this.pointLight.position.z = Math.cos(time * 0.5) * 4 * (1 + bass);
    this.pointLight.position.y = Math.sin(time * 0.7) * 3 + bass * 2;
    this.pointLight.intensity = 1 + bass * 3;

    // Luz spot: pulsação no beat
    if (isBeat) {
      this.spotLight.intensity = 3 + beatIntensity * 5;
      this.spotLight.color.setHSL(0.6 + beatIntensity * 0.3, 0.8, 0.5);
    } else {
      this.spotLight.intensity *= 0.98;
      if (this.spotLight.intensity < 0.5) this.spotLight.intensity = 0.5;
    }

    // Ponto de luz pontual: raio reativo
    this.pointLight.distance = 10 + bass * 10;
  }

  dispose() {
    this.scene.remove(this.ambientLight);
    this.scene.remove(this.directionalLight);
    this.scene.remove(this.pointLight);
    this.scene.remove(this.spotLight);
    this.scene.remove(this.spotLight.target);
  }
}
```

---

## 🌟 Etapa 12 — PostProcessing.js

```javascript
// PostProcessing.js — Efeitos de pós-processamento
class PostProcessing {
  constructor(sceneManager) {
    this.scene = sceneManager.scene;
    this.camera = sceneManager.camera;
    this.renderer = sceneManager.renderer;

    // Composer
    this.composer = null;
    this.renderPass = null;
    this.bloomPass = null;

    // Configuração
    this.bloomStrength = 0.3;
    this.bloomRadius = 0.5;
    this.bloomThreshold = 0.1;

    // Efeitos adicionais
    this.chromaticAberration = false;

    this._init();
  }

  _init() {
    this.composer = new THREE.EffectComposer(this.renderer);

    this.renderPass = new THREE.RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(
        this.renderer.domElement.width,
        this.renderer.domElement.height
      ),
      this.bloomStrength,
      this.bloomRadius,
      this.bloomThreshold
    );
    this.composer.addPass(this.bloomPass);
  }

  update(audioData, beatDetector) {
    const { bass, mid, treble, amplitude } = audioData;
    const isBeat = beatDetector.isBeatActive();
    const beatIntensity = beatDetector.getBeatIntensity();

    // Bloom reativo
    this.bloomPass.strength = this.bloomStrength + bass * 0.5 + (isBeat ? beatIntensity * 1.5 : 0);
    this.bloomPass.radius = 0.3 + treble * 0.5;
    this.bloomPass.threshold = 0.05 + (1 - amplitude) * 0.3;

    // Se houver aberração cromática, aplicar aqui
    if (this.chromaticAberration) {
      // ChromaticAberration via ShaderPass
      // (implementação futura se necessário)
    }
  }

  setChromaticAberration(enabled) {
    this.chromaticAberration = enabled;
    if (enabled) {
      // Adicionar ShaderPass de chromatic aberration
      console.log('[PostProcessing] Chromatic aberration ativado');
    }
  }

  setBloomIntensity(value) {
    this.bloomStrength = value;
  }

  render() {
    this.composer.render();
  }

  resize(width, height) {
    this.composer.setSize(width, height);
    this.bloomPass.resolution.set(width, height);
  }

  dispose() {
    this.composer.dispose();
  }
}
```

---

## 🔗 Etapa 13 — VisualReactivity.js

```javascript
// VisualReactivity.js — Mapeamento completo: áudio → parâmetros visuais
class VisualReactivity {
  constructor(config) {
    this.audioManager = config.audioManager;
    this.beatDetector = config.beatDetector;
    this.geometryEngine = config.geometryEngine;
    this.particleSystem = config.particleSystem;
    this.lightEngine = config.lightEngine;
    this.postProcessing = config.postProcessing;
    this.sceneManager = config.sceneManager;
    this.textureGenerator = config.textureGenerator;

    // Modo visual
    this.visualMode = 'hybrid';
    this.enabled = {
      shapes: true,
      particles: true,
      wireframe: false,
    };

    // Background
    this.backgroundMode = 'black';
    this.bgGradient = {
      color1: new THREE.Color(0x0a2463),
      color2: new THREE.Color(0x3a6ea5),
    };
  }

  update(time) {
    const audio = this.audioManager;
    const beat = this.beatDetector;

    // 1. Atualizar detector de beat
    beat.update();

    // 2. Dados de áudio
    const audioData = {
      bass: audio.bass,
      mid: audio.mid,
      treble: audio.treble,
      amplitude: audio.amplitude,
      frequencyBands: audio.getFrequencyBands(16),
      timeDomain: audio.timeDomainData,
    };

    // 3. Atualizar geometrias
    if (this.enabled.shapes) {
      this.geometryEngine.update(audioData, beat, time);
    }

    // 4. Atualizar partículas
    if (this.enabled.particles) {
      this.particleSystem.update(audioData, beat, time);
    }

    // 5. Atualizar luzes
    this.lightEngine.update(audioData, beat, time);

    // 6. Atualizar pós-processamento
    this.postProcessing.update(audioData, beat);

    // 7. Atualizar background
    this._updateBackground(audioData, time);
  }

  _updateBackground(audioData, time) {
    switch (this.backgroundMode) {
      case 'black':
        this.sceneManager.scene.background = new THREE.Color(0x000000);
        break;
      case 'gradient-xp':
        // Background animado com o som
        const hue1 = (time * 0.01) % 1;
        const hue2 = (hue1 + 0.2) % 1;
        const bgColor = new THREE.Color().setHSL(0.6 + audioData.bass * 0.1, 0.5, 0.05 + audioData.mid * 0.15);
        this.sceneManager.scene.background = bgColor;
        break;
      case 'solid':
        // Cor sólida reativa
        const solidColor = new THREE.Color().setHSL(
          0.6 + audioData.treble * 0.2,
          0.6,
          0.1 + audioData.bass * 0.3
        );
        this.sceneManager.scene.background = solidColor;
        break;
      case 'crt':
        this.sceneManager.scene.background = new THREE.Color(0x0a0a0a);
        break;
    }
  }

  // Reset visual
  reset() {
    // Resetar cores, posições, etc
    console.log('[VisualReactivity] Reset visual');
  }

  // Configurar modo visual
  setVisualMode(mode) {
    this.visualMode = mode;
    switch (mode) {
      case 'shapes':
        this.enabled.shapes = true;
        this.enabled.particles = false;
        this.geometryEngine.setWireframe(false);
        break;
      case 'particles':
        this.enabled.shapes = false;
        this.enabled.particles = true;
        break;
      case 'wireframe':
        this.enabled.shapes = true;
        this.enabled.particles = false;
        this.geometryEngine.setWireframe(true);
        break;
      case 'hybrid':
        this.enabled.shapes = true;
        this.enabled.particles = true;
        this.geometryEngine.setWireframe(false);
        break;
    }
  }

  setBackground(mode) {
    this.backgroundMode = mode;
  }
}
```

---

## 📁 Etapa 14 — FileSystem.js

```javascript
// FileSystem.js — Sistema de arquivos local (drag & drop, upload)
class FileSystem {
  constructor() {
    this.supportedExtensions = ['.mp3', '.wav', '.flac', '.ogg', '.aac', '.m4a'];
    this.playlist = [];
    this.currentIndex = -1;
    this.isLoading = false;

    // Callbacks
    this.onPlaylistChange = null;
    this.onTrackLoad = null;
    this.onError = null;

    this._initDragDrop();
  }

  _initDragDrop() {
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      document.getElementById('drop-zone')?.classList.add('drag-over');
    });

    document.addEventListener('dragleave', (e) => {
      e.preventDefault();
      document.getElementById('drop-zone')?.classList.remove('drag-over');
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      document.getElementById('drop-zone')?.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files);
      const audioFiles = files.filter(f => this._isSupported(f.name));
      if (audioFiles.length > 0) {
        this._loadFiles(audioFiles);
      } else {
        if (this.onError) this.onError('Nenhum arquivo de áudio encontrado no drop.');
      }
    });
  }

  _isSupported(filename) {
    const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
    return this.supportedExtensions.includes(ext);
  }

  async loadFile(filePath) {
    // Carregar via fetch para arquivo local (Electron)
    try {
      // No Electron, o arquivo local é acessível via file://
      // Usamos o preload.js para ler via fs e passar o buffer
      const response = await fetch(`file://${filePath}`);
      const arrayBuffer = await response.arrayBuffer();
      const fileName = filePath.split('\\').pop().split('/').pop();
      return { arrayBuffer, fileName, filePath };
    } catch (err) {
      console.error('[FileSystem] Erro ao carregar arquivo:', err);
      if (this.onError) this.onError(`Erro ao carregar: ${filePath}`);
      return null;
    }
  }

  async loadFilesFromFolder(folderPath) {
    // Electron: ler diretório via Node.js (fs)
    // Como não temos acesso direto ao fs no renderizador,
    // usamos IPC para o main process
    try {
      const files = await window.electronAPI.getFilesInFolder(folderPath);
      const audioFiles = files.filter(f => this._isSupported(f));
      if (audioFiles.length === 0) {
        if (this.onError) this.onError('Nenhum arquivo de áudio encontrado nesta pasta.');
        return;
      }
      // Adicionar à playlist
      audioFiles.forEach((file, index) => {
        this.playlist.push({
          name: file.split('\\').pop().split('/').pop(),
          path: file,
          index: this.playlist.length,
        });
      });
      if (this.onPlaylistChange) this.onPlaylistChange(this.playlist);
    } catch (err) {
      console.error('[FileSystem] Erro ao ler pasta:', err);
      if (this.onError) this.onError('Erro ao ler pasta.');
    }
  }

  _loadFiles(files) {
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.playlist.push({
          name: file.name,
          data: e.target.result,
          index: this.playlist.length,
        });
        if (this.onPlaylistChange) this.onPlaylistChange(this.playlist);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  addToPlaylist(track) {
    this.playlist.push(track);
    if (this.onPlaylistChange) this.onPlaylistChange(this.playlist);
  }

  clearPlaylist() {
    this.playlist = [];
    this.currentIndex = -1;
    if (this.onPlaylistChange) this.onPlaylistChange(this.playlist);
  }

  getCurrentTrack() {
    if (this.currentIndex >= 0 && this.currentIndex < this.playlist.length) {
      return this.playlist[this.currentIndex];
    }
    return null;
  }

  next() {
    if (this.playlist.length === 0) return null;
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    return this.getCurrentTrack();
  }

  prev() {
    if (this.playlist.length === 0) return null;
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    return this.getCurrentTrack();
  }

  shuffle() {
    for (let i = this.playlist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
    }
    this.currentIndex = 0;
    if (this.onPlaylistChange) this.onPlaylistChange(this.playlist);
    return this.getCurrentTrack();
  }
}
```

---

## 🎛️ Etapa 15 — ControlPanel.js

```javascript
// ControlPanel.js — Painel de controles (sliders, toggles, presets)
class ControlPanel {
  constructor(config) {
    this.audioManager = config.audioManager;
    this.geometryEngine = config.geometryEngine;
    this.particleSystem = config.particleSystem;
    this.postProcessing = config.postProcessing;
    this.visualReactivity = config.visualReactivity;
    this.fileSystem = config.fileSystem;

    // Referências DOM
    this.panel = document.getElementById('control-panel');
    this.welcomeOverlay = document.getElementById('welcome-overlay');

    this._init();
  }

  _init() {
    this._initPlayer();
    this._initAudioControls();
    this._initVisualControls();
    this._initToggles();
    this._initFileButtons();
    this._initKeyboardShortcuts();
    this._initPanelToggle();
  }

  _initPlayer() {
    const playBtn = document.getElementById('btn-play');
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const stopBtn = document.getElementById('btn-stop');
    const progressBar = document.getElementById('progress-bar');
    const volumeSlider = document.getElementById('volume-slider');
    const currentTimeSpan = document.getElementById('current-time');
    const totalTimeSpan = document.getElementById('total-time');
    const trackNameSpan = document.getElementById('current-track');

    // Play/Pause
    playBtn.addEventListener('click', () => {
      if (this.audioManager.isPlaying) {
        this.audioManager.pause();
        playBtn.textContent = '▶';
      } else {
        this.audioManager.play();
        playBtn.textContent = '⏸';
      }
    });

    // Próximo/Anterior
    prevBtn.addEventListener('click', () => this._playTrack(this.fileSystem.prev()));
    nextBtn.addEventListener('click', () => this._playTrack(this.fileSystem.next()));

    // Stop
    stopBtn.addEventListener('click', () => {
      this.audioManager.stop();
      playBtn.textContent = '▶';
      progressBar.value = 0;
    });

    // Progresso
    progressBar.addEventListener('input', (e) => {
      const time = (e.target.value / 100) * this.audioManager.duration;
      this.audioManager.seek(time);
    });

    // Volume
    volumeSlider.addEventListener('input', (e) => {
      this.audioManager.setVolume(parseInt(e.target.value));
    });

    // Time update callback
    this.audioManager.onTimeUpdate = (current, total) => {
      if (total > 0) {
        progressBar.value = (current / total) * 100;
        currentTimeSpan.textContent = this._formatTime(current);
        totalTimeSpan.textContent = this._formatTime(total);
      }
    };

    // End callback
    this.audioManager.onEnded = () => {
      playBtn.textContent = '▶';
      this._playTrack(this.fileSystem.next());
    };

    // Track name
    this._updateTrackName = (name) => {
      trackNameSpan.textContent = name || 'Nenhuma música';
      if (name) {
        this.welcomeOverlay.classList.add('hidden');
      }
    };

    // Volume inicial
    this.audioManager.setVolume(80);
  }

  _playTrack(track) {
    if (!track) return;
    this._updateTrackName(track.name);
    // Carregar e tocar (o renderer.js lida com isso)
    if (this.onPlayTrack) this.onPlayTrack(track);
  }

  _initAudioControls() {
    // Sliders de sensibilidade
    const sensSliders = [
      { id: 'sens-bass', valueId: 'sens-bass-value', key: 'bass' },
      { id: 'sens-mid', valueId: 'sens-mid-value', key: 'mid' },
      { id: 'sens-treble', valueId: 'sens-treble-value', key: 'treble' },
    ];

    sensSliders.forEach(({ id, valueId, key }) => {
      const slider = document.getElementById(id);
      const valueSpan = document.getElementById(valueId);
      slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        valueSpan.textContent = val + '%';
        this.audioManager.sensitivity[key] = val / 100;
      });
    });
  }

  _initVisualControls() {
    // Modo visual
    const visualMode = document.getElementById('visual-mode');
    visualMode.addEventListener('change', (e) => {
      this.visualReactivity.setVisualMode(e.target.value);
    });

    // Geometria base
    const baseGeo = document.getElementById('base-geometry');
    baseGeo.addEventListener('change', (e) => {
      this.geometryEngine.setGeometryType(e.target.value);
    });

    // Número de objetos
    const objCount = document.getElementById('object-count');
    const objCountValue = document.getElementById('object-count-value');
    objCount.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      objCountValue.textContent = val;
      this.geometryEngine.setCount(val);
    });

    // Tamanho
    const objSize = document.getElementById('object-size');
    const objSizeValue = document.getElementById('object-size-value');
    objSize.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      objSizeValue.textContent = val + '%';
      this.geometryEngine.size = val / 100;
    });

    // Velocidade
    const speed = document.getElementById('speed');
    const speedValue = document.getElementById('speed-value');
    speed.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      speedValue.textContent = val + '%';
      this.geometryEngine.setSpeed(val / 100);
    });

    // Bloom
    const bloom = document.getElementById('bloom-intensity');
    const bloomValue = document.getElementById('bloom-intensity-value');
    bloom.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      bloomValue.textContent = val + '%';
      this.postProcessing.setBloomIntensity(val / 100);
    });

    // Paleta
    const palette = document.getElementById('color-palette');
    palette.addEventListener('change', (e) => {
      this.geometryEngine.setPalette(e.target.value);
    });
  }

  _initToggles() {
    const toggles = [
      { id: 'toggle-wireframe', action: (v) => this.geometryEngine.setWireframe(v) },
      { id: 'toggle-transparency', action: (v) => this.geometryEngine.setTransparency(v) },
      { id: 'toggle-particles', action: (v) => {
        this.particleSystem.setEnabled(v);
        this.visualReactivity.enabled.particles = v;
      }},
      { id: 'toggle-reflection', action: (v) => {
        // Implementar reflection mapping se necessário
        console.log('[ControlPanel] Reflection:', v);
      }},
      { id: 'toggle-chromatic', action: (v) => this.postProcessing.setChromaticAberration(v) },
    ];

    toggles.forEach(({ id, action }) => {
      const checkbox = document.getElementById(id);
      checkbox.addEventListener('change', (e) => {
        action(e.target.checked);
      });
    });
  }

  _initFileButtons() {
    document.getElementById('btn-open-file').addEventListener('click', () => {
      // Disparar diálogo nativo via Electron
      if (window.electronAPI && window.electronAPI.openFileDialog) {
        window.electronAPI.openFileDialog();
      }
    });

    document.getElementById('btn-open-folder').addEventListener('click', () => {
      if (window.electronAPI && window.electronAPI.openFolderDialog) {
        window.electronAPI.openFolderDialog();
      }
    });
  }

  _initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Espaço: Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        document.getElementById('btn-play')?.click();
      }
      // Tecla M: Mutar
      if (e.key === 'm' || e.key === 'M') {
        const volSlider = document.getElementById('volume-slider');
        if (volSlider.value > 0) {
          volSlider.dataset.lastVolume = volSlider.value;
          volSlider.value = 0;
        } else {
          volSlider.value = volSlider.dataset.lastVolume || 80;
        }
        volSlider.dispatchEvent(new Event('input'));
      }
      // F11: Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        if (window.electronAPI && window.electronAPI.toggleFullscreen) {
          window.electronAPI.toggleFullscreen();
        }
      }
    });
  }

  _initPanelToggle() {
    document.getElementById('btn-hide-panel').addEventListener('click', () => {
      this.panel.classList.toggle('hidden');
    });

    // Ctrl+H: toggle panel
    if (window.electronAPI) {
      window.electronAPI.togglePanel(() => {
        this.panel.classList.toggle('hidden');
      });
    }
  }

  _formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
```

---

## 🧩 Etapa 16 — renderer.js (Integração Final)

```javascript
// renderer.js — Entry point do app (amarra tudo)
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Audio Visualizer XP] Inicializando...');

  // 1. Container Three.js
  const container = document.getElementById('three-container');

  // 2. Gerenciadores
  const audioManager = new AudioManager();
  const beatDetector = new BeatDetector(audioManager);
  const textureGenerator = new TextureGenerator();
  const sceneManager = new SceneManager(container);
  const geometryEngine = new GeometryEngine(sceneManager);
  const particleSystem = new ParticleSystem(sceneManager);
  const lightEngine = new LightEngine(sceneManager);
  const postProcessing = new PostProcessing(sceneManager);
  const visualReactivity = new VisualReactivity({
    audioManager,
    beatDetector,
    geometryEngine,
    particleSystem,
    lightEngine,
    postProcessing,
    sceneManager,
    textureGenerator,
  });
  const fileSystem = new FileSystem();
  const controlPanel = new ControlPanel({
    audioManager,
    geometryEngine,
    particleSystem,
    postProcessing,
    visualReactivity,
    fileSystem,
  });

  // 3. Integrar FileSystem com AudioManager
  fileSystem.onTrackLoad = async (track) => {
    if (track.data) {
      // Drag & drop (File API)
      const success = await audioManager.loadFromFile(track.data, track.name);
      if (success) {
        audioManager.play();
        document.getElementById('btn-play').textContent = '⏸';
      }
    }
  };

  // 4. Carregar via Electron IPC
  if (window.electronAPI) {
    window.electronAPI.loadFile(async (filePath) => {
      const result = await fileSystem.loadFile(filePath);
      if (result) {
        const success = await audioManager.loadFromFile(result.arrayBuffer, result.fileName);
        if (success) {
          audioManager.play();
          document.getElementById('btn-play').textContent = '⏸';
          // Adicionar à playlist
          fileSystem.addToPlaylist({
            name: result.fileName,
            path: result.filePath,
          });
          document.querySelector('.track-name').textContent = result.fileName;
          document.getElementById('welcome-overlay').classList.add('hidden');
        }
      }
    });

    window.electronAPI.loadFolder((folderPath) => {
      fileSystem.loadFilesFromFolder(folderPath);
    });
  }

  // 5. ControlPanel: play track callback
  controlPanel.onPlayTrack = async (track) => {
    if (track.data) {
      const success = await audioManager.loadFromFile(track.data, track.name);
      if (success) {
        audioManager.play();
        document.getElementById('btn-play').textContent = '⏸';
      }
    } else if (track.path) {
      const result = await fileSystem.loadFile(track.path);
      if (result) {
        const success = await audioManager.loadFromFile(result.arrayBuffer, result.fileName);
        if (success) {
          audioManager.play();
          document.getElementById('btn-play').textContent = '⏸';
        }
      }
    }
  };

  // 6. Atualizar playlist UI
  fileSystem.onPlaylistChange = (playlist) => {
    const playlistEl = document.getElementById('playlist');
    playlistEl.innerHTML = '';
    if (playlist.length === 0) {
      playlistEl.innerHTML = '<span class="playlist-empty">Nenhuma música na playlist</span>';
      return;
    }
    playlist.forEach((track, index) => {
      const item = document.createElement('div');
      item.className = 'playlist-item';
      if (index === fileSystem.currentIndex) {
        item.classList.add('active');
      }
      item.innerHTML = `
        <span class="track-index">${index + 1}</span>
        <span class="track-name">${track.name}</span>
        <span class="track-duration">--:--</span>
      `;
      item.addEventListener('click', () => {
        controlPanel.onPlayTrack(track);
      });
      playlistEl.appendChild(item);
    });
  };

  // 7. Iniciar loop de animação
  sceneManager.animate((delta, time) => {
    visualReactivity.update(time);
    postProcessing.render();
  });

  // 8. Resize do PostProcessing
  window.addEventListener('resize', () => {
    const sizes = sceneManager.getSizes();
    postProcessing.resize(sizes.width, sizes.height);
  });

  console.log('[Audio Visualizer XP] Pronto! 🚀');
});
```

---

## 🧪 Etapa 17 — Testes e Refinamento

### Checklist de Testes

```bash
# 1. Verificar se o app abre
npm start

# 2. Testar menu Arquivo > Abrir Música
# Ctrl+O deve abrir o diálogo nativo

# 3. Testar carregamento de áudio
# Selecionar um .mp3 e verificar se o áudio toca

# 4. Testar painel de controles
# Ajustar sliders e verificar reatividade

# 5. Testar tela cheia
# F11 deve ocultar o painel

# 6. Testar atalhos de teclado
# Espaço, Setas, M (mute)

# 7. Testar drag & drop
# Arrastar um .mp3 do Explorer para a janela

# 8. Testar playlist
# Abrir pasta com várias músicas

# 9. Testar visual 3D
# Verificar se geometrias, partículas, luzes e bloom respondem ao som
```

### Problemas Comuns e Soluções

| Problema | Causa | Solução |
|---|---|---|
| **Tela preta** | WebGL não disponível | Verificar placa de vídeo |
| **Áudio não toca** | Arquivo corrompido | Testar com outro arquivo |
| **Sem som ao arrastar** | FileReader não foi chamado | Verificar drag & drop |
| **Painel não aparece** | CSS não carregou | Verificar style.css |
| **FPS baixo** | Muitos objetos/partículas | Reduzir count no painel |
| **Bloom não aparece** | PostProcessing não inicializou | Verificar imports Three.js |
| **Erro "Cannot find module"** | Dependência faltando | Rodar `npm install` |

### Comandos de Diagnóstico

```bash
# Verificar se Three.js está instalado
node -e "console.log(require('three'))"

# Verificar versão do Electron
npx electron --version

# Rodar com DevTools aberto
npm run dev