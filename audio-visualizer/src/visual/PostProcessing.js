class PostProcessing {
  constructor(sceneManager) {
    this.scene = sceneManager.scene; this.camera = sceneManager.camera; this.renderer = sceneManager.renderer;
    this.composer = null; this.renderPass = null; this.bloomPass = null;
    this.bloomStrength = 0.3; this.bloomRadius = 0.5; this.bloomThreshold = 0.1;
    this.chromaticAberration = false;
    this._init();
  }
  _init() {
    this.composer = new THREE.EffectComposer(this.renderer);
    this.renderPass = new THREE.RenderPass(this.scene, this.camera); this.composer.addPass(this.renderPass);
    this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(this.renderer.domElement.width, this.renderer.domElement.height), this.bloomStrength, this.bloomRadius, this.bloomThreshold);
    this.composer.addPass(this.bloomPass);
  }
  update(audioData, beatDetector) {
    const { bass, treble, amplitude } = audioData;
    const isBeat = beatDetector.isBeatActive(), bi = beatDetector.getBeatIntensity();
    this.bloomPass.strength = this.bloomStrength + bass * 0.5 + (isBeat ? bi * 1.5 : 0);
    this.bloomPass.radius = 0.3 + treble * 0.5;
    this.bloomPass.threshold = 0.05 + (1 - amplitude) * 0.3;
  }
  setChromaticAberration(enabled) { this.chromaticAberration = enabled; }
  setBloomIntensity(value) { this.bloomStrength = value; }
  render() { this.composer.render(); }
  resize(w, h) { this.composer.setSize(w, h); if (this.bloomPass) this.bloomPass.resolution.set(w, h); }
  dispose() { this.composer.dispose(); }
}