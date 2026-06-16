class TextureGenerator {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 256; this.canvas.height = 256;
  }
  createXPGradient() {
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#3a6ea5'); g.addColorStop(0.5, '#4a8bc2'); g.addColorStop(1, '#2a5a8a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    return this._createTexture();
  }
  createChromeTexture() {
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#e8e8e8'); g.addColorStop(0.2, '#a0a0a0'); g.addColorStop(0.4, '#ffffff');
    g.addColorStop(0.6, '#808080'); g.addColorStop(0.8, '#c0c0c0'); g.addColorStop(1, '#606060');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 100; i++) { const x = Math.random() * w, y = Math.random() * h, r = Math.random() * 3; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`; ctx.fill(); }
    return this._createTexture();
  }
  createPsychedelicTexture() {
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height, cx = w / 2, cy = h / 2, r = Math.min(cx, cy);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, '#ff00ff'); g.addColorStop(0.2, '#00ffff'); g.addColorStop(0.4, '#ffff00');
    g.addColorStop(0.6, '#ff0000'); g.addColorStop(0.8, '#00ff00'); g.addColorStop(1, '#0000ff');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    return this._createTexture();
  }
  createCRTTexture() {
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) { ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.02})`; ctx.fillRect(0, y, w, 1); }
    return this._createTexture();
  }
  createNoiseTexture() {
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height, id = ctx.createImageData(w, h), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255; }
    ctx.putImageData(id, 0, 0);
    return this._createTexture();
  }
  createAnimatedGradient(bass, mid, treble) {
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
    const r = Math.floor(100 + 155 * bass), g = Math.floor(50 + 205 * mid), b = Math.floor(150 + 105 * treble);
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, `rgb(${r},${g},${b})`); grad.addColorStop(0.5, `rgb(${g},${b},${r})`); grad.addColorStop(1, `rgb(${b},${r},${g})`);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    return this._createTexture();
  }
  _createTexture() {
    const t = new THREE.CanvasTexture(this.canvas); t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; return t;
  }
}