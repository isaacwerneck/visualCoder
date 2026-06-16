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
    this.fftSize = 2048;
    this.frequencyData = new Uint8Array(this.fftSize / 2);
    this.timeDomainData = new Uint8Array(this.fftSize / 2);
    this.bass = 0; this.mid = 0; this.treble = 0; this.amplitude = 0;
    this.sensitivity = { bass: 1, mid: 1, treble: 1 };
    this.bands = { bassStart: 0, bassEnd: 6, midStart: 7, midEnd: 63, trebleStart: 64, trebleEnd: 127 };
    this.currentFile = null; this.duration = 0;
    this.onTimeUpdate = null; this.onEnded = null;
    this._init();
  }
  _init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = this.fftSize;
    this.analyserNode.smoothingTimeConstant = 0.8;
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.8;
    this._analyserLoop();
  }
  async loadFromFile(arrayBuffer, fileName) {
    try {
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.currentFile = fileName;
      this.duration = this.audioBuffer.duration;
      this.pausedAt = 0;
      return true;
    } catch (err) { console.error('[AudioManager] Erro:', err); return false; }
  }
  play() {
    if (!this.audioBuffer) return;
    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.connect(this.gainNode);
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);
    this.sourceNode.start(0, this.pausedAt);
    this.startTime = this.audioContext.currentTime - this.pausedAt;
    this.isPlaying = true;
    this.sourceNode.onended = () => { if (this.isPlaying) { this.isPlaying = false; if (this.onEnded) this.onEnded(); } };
    if (this.audioContext.state === 'suspended') this.audioContext.resume();
  }
  pause() {
    if (!this.isPlaying || !this.sourceNode) return;
    this.pausedAt = this.audioContext.currentTime - this.startTime;
    this.sourceNode.stop(); this.sourceNode.disconnect(); this.sourceNode = null;
    this.isPlaying = false;
  }
  stop() {
    if (this.sourceNode) { this.sourceNode.stop(); this.sourceNode.disconnect(); this.sourceNode = null; }
    this.isPlaying = false; this.pausedAt = 0;
  }
  seek(time) {
    if (!this.audioBuffer) return;
    const was = this.isPlaying; if (was) this.stop();
    this.pausedAt = Math.max(0, Math.min(time, this.duration));
    if (was) this.play();
  }
  setVolume(v) { this.gainNode.gain.value = v / 100; }
  getCurrentTime() { return this.isPlaying ? this.audioContext.currentTime - this.startTime : this.pausedAt; }
  _analyserLoop() {
    const loop = () => {
      if (this.analyserNode) {
        this.analyserNode.getByteFrequencyData(this.frequencyData);
        this.analyserNode.getByteTimeDomainData(this.timeDomainData);
        this._calculateBands();
        this.amplitude = this._calculateAmplitude();
        if (this.isPlaying && this.onTimeUpdate) this.onTimeUpdate(this.getCurrentTime(), this.duration);
      }
      requestAnimationFrame(loop);
    };
    loop();
  }
  _calculateBands() {
    const d = this.frequencyData;
    let bs = 0, ms = 0, ts = 0;
    const bc = this.bands.bassEnd - this.bands.bassStart + 1;
    const mc = this.bands.midEnd - this.bands.midStart + 1;
    const tc = this.bands.trebleEnd - this.bands.trebleStart + 1;
    for (let i = this.bands.bassStart; i <= this.bands.bassEnd; i++) bs += d[i] || 0;
    for (let i = this.bands.midStart; i <= this.bands.midEnd; i++) ms += d[i] || 0;
    for (let i = this.bands.trebleStart; i <= this.bands.trebleEnd; i++) ts += d[i] || 0;
    this.bass = Math.min((bs / bc / 255) * this.sensitivity.bass, 1);
    this.mid = Math.min((ms / mc / 255) * this.sensitivity.mid, 1);
    this.treble = Math.min((ts / tc / 255) * this.sensitivity.treble, 1);
  }
  _calculateAmplitude() {
    let sum = 0;
    for (let i = 0; i < this.timeDomainData.length; i++) { const v = (this.timeDomainData[i] - 128) / 128; sum += v * v; }
    return Math.sqrt(sum / this.timeDomainData.length);
  }
  getFrequencyBands(n = 16) {
    const d = this.frequencyData; const bs = Math.floor(d.length / n); const b = [];
    for (let i = 0; i < n; i++) { let s = 0; const st = i * bs; const en = i === n - 1 ? d.length : st + bs; for (let j = st; j < en; j++) s += d[j] || 0; b.push(s / (en - st) / 255); }
    return b;
  }
  dispose() { this.stop(); if (this.audioContext) this.audioContext.close(); }
}