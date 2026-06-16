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
    this.visualMode = 'hybrid';
    this.enabled = { shapes: true, particles: true };
    this.backgroundMode = 'black';
  }
  update(time) {
    const audio = this.audioManager, beat = this.beatDetector;
    beat.update();
    const audioData = {
      bass: audio.bass, mid: audio.mid, treble: audio.treble, amplitude: audio.amplitude,
      frequencyBands: audio.getFrequencyBands(16), timeDomain: audio.timeDomainData
    };
    if (this.enabled.shapes) this.geometryEngine.update(audioData, beat, time);
    if (this.enabled.particles) this.particleSystem.update(audioData, beat, time);
    this.lightEngine.update(audioData, beat, time);
    this.postProcessing.update(audioData, beat);
    this._updateBackground(audioData, time);
  }
  _updateBackground(audioData, time) {
    switch (this.backgroundMode) {
      case 'black': this.sceneManager.scene.background = new THREE.Color(0x000000); break;
      case 'gradient-xp': this.sceneManager.scene.background = new THREE.Color().setHSL(0.6 + audioData.bass * 0.1, 0.5, 0.05 + audioData.mid * 0.15); break;
      case 'solid': this.sceneManager.scene.background = new THREE.Color().setHSL(0.6 + audioData.treble * 0.2, 0.6, 0.1 + audioData.bass * 0.3); break;
      case 'crt': this.sceneManager.scene.background = new THREE.Color(0x0a0a0a); break;
    }
  }
  setVisualMode(mode) {
    this.visualMode = mode;
    switch (mode) {
      case 'shapes': this.enabled.shapes = true; this.enabled.particles = false; this.geometryEngine.setWireframe(false); break;
      case 'particles': this.enabled.shapes = false; this.enabled.particles = true; break;
      case 'wireframe': this.enabled.shapes = true; this.enabled.particles = false; this.geometryEngine.setWireframe(true); break;
      case 'hybrid': this.enabled.shapes = true; this.enabled.particles = true; this.geometryEngine.setWireframe(false); break;
    }
  }
  setBackground(mode) { this.backgroundMode = mode; }
}