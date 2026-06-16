// ===== IMPORTS (executam na ordem correta) =====
const fs = require('fs');
const path = require('path');

console.log('[AV] Carregando...');

// Three.js - PRECISA ser global para os módulos via require
global.THREE = require('three');
window.THREE = global.THREE;
console.log('[AV] Three.js v' + global.THREE.REVISION);

// Carregar todos os módulos do app (como no HTML original, mas via require)
require('./audio/AudioManager.js');
require('./audio/BeatDetector.js');
require('./visual/TextureGenerator.js');
require('./visual/SceneManager.js');
require('./visual/GeometryEngine.js');
require('./visual/ParticleSystem.js');
require('./visual/LightEngine.js');
require('./visual/PostProcessing.js');
require('./visual/VisualReactivity.js');
require('./ui/FileSystem.js');
require('./ui/ControlPanel.js');

console.log('[AV] Módulos carregados');

// ===== VARIÁVEIS GLOBAIS =====
let _audioManager = null;
let _controlPanel = null;
let _fileSystem = null;
const _pendingFiles = [];

// ===== FUNÇÕES PARA O MENU =====
window.__loadAudioFile__ = async function(filePath) {
  if (!_audioManager) {
    console.log('[AV] Fila:', path.basename(filePath));
    _pendingFiles.push({ type: 'file', path: filePath });
    return;
  }
  console.log('[AV] Lendo:', filePath);
  try {
    const buffer = fs.readFileSync(filePath);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const fileName = path.basename(filePath);
    const ok = await _audioManager.loadFromFile(arrayBuffer, fileName);
    if (ok) {
      _audioManager.play();
      document.getElementById('btn-play').textContent = '⏸';
      _controlPanel._updateTrackName(fileName);
      _fileSystem.addToPlaylist({ name: fileName, path: filePath });
      console.log('[AV] Tocando:', fileName);
    } else {
      console.error('[AV] Falha ao decodificar');
    }
  } catch (err) {
    console.error('[AV] Erro:', err);
  }
};

window.__loadFolder__ = function(files) {
  if (!_fileSystem) { _pendingFiles.push({ type: 'folder', files }); return; }
  files.forEach(f => _fileSystem.addToPlaylist({ name: path.basename(f), path: f }));
  if (files.length > 0) window.__loadAudioFile__(files[0]);
};

window.__togglePanel__ = function() {
  const p = document.getElementById('control-panel');
  if (p) p.classList.toggle('hidden');
};

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('[AV] DOM pronto, iniciando...');

  const container = document.getElementById('three-container');
  if (!container) { console.error('[AV] Container não encontrado'); return; }

  try {
    const audioManager = new AudioManager();
    const beatDetector = new BeatDetector(audioManager);
    const textureGenerator = new TextureGenerator();
    const sceneManager = new SceneManager(container);
    const geometryEngine = new GeometryEngine(sceneManager);
    const particleSystem = new ParticleSystem(sceneManager);
    const lightEngine = new LightEngine(sceneManager);
    const postProcessing = new PostProcessing(sceneManager);
    const visualReactivity = new VisualReactivity({
      audioManager, beatDetector, geometryEngine, particleSystem,
      lightEngine, postProcessing, sceneManager, textureGenerator,
    });
    const fileSystem = new FileSystem();
    const controlPanel = new ControlPanel({
      audioManager, geometryEngine, particleSystem,
      postProcessing, visualReactivity, fileSystem,
    });

    _audioManager = audioManager;
    _controlPanel = controlPanel;
    _fileSystem = fileSystem;

    // Processar pendentes
    for (const item of _pendingFiles) {
      if (item.type === 'file') window.__loadAudioFile__(item.path);
      else if (item.type === 'folder') window.__loadFolder__(item.files);
    }
    _pendingFiles.length = 0;

    // Botões
    document.getElementById('btn-open-file').addEventListener('click', () => alert('Use Ctrl+O'));
    document.getElementById('btn-open-folder').addEventListener('click', () => alert('Use Ctrl+Shift+O'));

    // Drag & drop
    fileSystem.onTrackLoad = async (track) => {
      if (track && track.data) {
        const ok = await audioManager.loadFromFile(track.data, track.name);
        if (ok) { audioManager.play(); document.getElementById('btn-play').textContent = '⏸'; }
      }
    };

    // Playlist
    controlPanel.onPlayTrack = async (track) => {
      if (track && track.data) {
        const ok = await audioManager.loadFromFile(track.data, track.name);
        if (ok) { audioManager.play(); document.getElementById('btn-play').textContent = '⏸'; }
      } else if (track && track.path) {
        window.__loadAudioFile__(track.path);
      }
    };

    fileSystem.onPlaylistChange = (playlist) => {
      const el = document.getElementById('playlist');
      if (!el) return;
      el.innerHTML = '';
      if (playlist.length === 0) {
        el.innerHTML = '<span class="playlist-empty">Nenhuma música</span>';
        return;
      }
      playlist.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (index === fileSystem.currentIndex) item.classList.add('active');
        item.innerHTML = `<span class="track-index">${index + 1}</span><span class="track-name">${track.name}</span>`;
        item.addEventListener('click', () => controlPanel.onPlayTrack(track));
        el.appendChild(item);
      });
    };

    // Loop de animação
    sceneManager.animate((delta, time) => {
      visualReactivity.update(time);
      postProcessing.render();
    });

    window.addEventListener('resize', () => {
      const sizes = sceneManager.getSizes();
      postProcessing.resize(sizes.width, sizes.height);
    });

    console.log('[AV] Pronto! 🚀');
  } catch (err) {
    console.error('[AV] Erro na inicialização:', err);
  }
});