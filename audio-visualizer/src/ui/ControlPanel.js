class ControlPanel {
  constructor(config) {
    this.audioManager = config.audioManager;
    this.geometryEngine = config.geometryEngine;
    this.particleSystem = config.particleSystem;
    this.postProcessing = config.postProcessing;
    this.visualReactivity = config.visualReactivity;
    this.fileSystem = config.fileSystem;
    this.panel = document.getElementById('control-panel');
    this.welcomeOverlay = document.getElementById('welcome-overlay');
    this.onPlayTrack = null;
    this._init();
  }
  _init() {
    this._initPlayer();
    this._initAudioControls();
    this._initVisualControls();
    this._initToggles();
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

    playBtn.addEventListener('click', () => {
      if (this.audioManager.isPlaying) { this.audioManager.pause(); playBtn.textContent = '▶'; }
      else { this.audioManager.play(); playBtn.textContent = '⏸'; }
    });
    prevBtn.addEventListener('click', () => { const t = this.fileSystem.prev(); if (t && this.onPlayTrack) this.onPlayTrack(t); });
    nextBtn.addEventListener('click', () => { const t = this.fileSystem.next(); if (t && this.onPlayTrack) this.onPlayTrack(t); });
    stopBtn.addEventListener('click', () => { this.audioManager.stop(); playBtn.textContent = '▶'; progressBar.value = 0; });
    progressBar.addEventListener('input', (e) => { this.audioManager.seek((e.target.value / 100) * this.audioManager.duration); });
    volumeSlider.addEventListener('input', (e) => { this.audioManager.setVolume(parseInt(e.target.value)); });
    this.audioManager.onTimeUpdate = (current, total) => {
      if (total > 0) { progressBar.value = (current / total) * 100; currentTimeSpan.textContent = this._formatTime(current); totalTimeSpan.textContent = this._formatTime(total); }
    };
    this.audioManager.onEnded = () => { playBtn.textContent = '▶'; const t = this.fileSystem.next(); if (t && this.onPlayTrack) this.onPlayTrack(t); };
    this._updateTrackName = (name) => { trackNameSpan.textContent = name || 'Nenhuma música'; if (name) this.welcomeOverlay.classList.add('hidden'); };
    this.audioManager.setVolume(80);
  }
  _initAudioControls() {
    const items = [
      { id: 'sens-bass', vid: 'sens-bass-value', key: 'bass' },
      { id: 'sens-mid', vid: 'sens-mid-value', key: 'mid' },
      { id: 'sens-treble', vid: 'sens-treble-value', key: 'treble' },
    ];
    items.forEach(({ id, vid, key }) => {
      const s = document.getElementById(id), v = document.getElementById(vid);
      s.addEventListener('input', (e) => { const val = parseInt(e.target.value); v.textContent = val + '%'; this.audioManager.sensitivity[key] = val / 100; });
    });
  }
  _initVisualControls() {
    document.getElementById('visual-mode').addEventListener('change', (e) => this.visualReactivity.setVisualMode(e.target.value));
    document.getElementById('base-geometry').addEventListener('change', (e) => this.geometryEngine.setGeometryType(e.target.value));
    document.getElementById('background-mode').addEventListener('change', (e) => this.visualReactivity.setBackground(e.target.value));
    const objCount = document.getElementById('object-count'), objCountV = document.getElementById('object-count-value');
    objCount.addEventListener('input', (e) => { const v = parseInt(e.target.value); objCountV.textContent = v; this.geometryEngine.setCount(v); });
    const objSize = document.getElementById('object-size'), objSizeV = document.getElementById('object-size-value');
    objSize.addEventListener('input', (e) => { const v = parseInt(e.target.value); objSizeV.textContent = v + '%'; this.geometryEngine.size = v / 100; });
    const speed = document.getElementById('speed'), speedV = document.getElementById('speed-value');
    speed.addEventListener('input', (e) => { const v = parseInt(e.target.value); speedV.textContent = v + '%'; this.geometryEngine.setSpeed(v / 100); });
    const bloom = document.getElementById('bloom-intensity'), bloomV = document.getElementById('bloom-intensity-value');
    bloom.addEventListener('input', (e) => { const v = parseInt(e.target.value); bloomV.textContent = v + '%'; this.postProcessing.setBloomIntensity(v / 100); });
    document.getElementById('color-palette').addEventListener('change', (e) => this.geometryEngine.setPalette(e.target.value));
  }
  _initToggles() {
    const toggles = [
      { id: 'toggle-wireframe', action: (v) => this.geometryEngine.setWireframe(v) },
      { id: 'toggle-transparency', action: (v) => this.geometryEngine.setTransparency(v) },
      { id: 'toggle-particles', action: (v) => { this.particleSystem.setEnabled(v); this.visualReactivity.enabled.particles = v; } },
      { id: 'toggle-chromatic', action: (v) => this.postProcessing.setChromaticAberration(v) },
    ];
    toggles.forEach(({ id, action }) => { document.getElementById(id).addEventListener('change', (e) => action(e.target.checked)); });
  }
  _initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') { e.preventDefault(); document.getElementById('btn-play').click(); }
      if (e.key === 'm' || e.key === 'M') { const vs = document.getElementById('volume-slider'); vs.value = vs.value > 0 ? 0 : 80; vs.dispatchEvent(new Event('input')); }
    });
  }
  _initPanelToggle() {
    document.getElementById('btn-hide-panel').addEventListener('click', () => this.panel.classList.toggle('hidden'));
    if (window.electronAPI) window.electronAPI.togglePanel(() => this.panel.classList.toggle('hidden'));
  }
  _formatTime(s) { if (!s || isNaN(s)) return '0:00'; const m = Math.floor(s / 60), sec = Math.floor(s % 60); return `${m}:${sec.toString().padStart(2, '0')}`; }
}