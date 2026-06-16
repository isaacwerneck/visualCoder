class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null; this.camera = null; this.renderer = null;
    this.clock = new THREE.Clock();
    this.backgroundColor = 0x000000; this.fov = 60; this.near = 0.1; this.far = 1000; this.cameraDistance = 15;
    this._init();
  }
  _init() {
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(this.backgroundColor);
    this.scene.fog = new THREE.FogExp2(this.backgroundColor, 0.02);
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(this.fov, aspect, this.near, this.far);
    this.camera.position.set(0, 2, this.cameraDistance); this.camera.lookAt(0, 0, 0);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);
    this._handleResize();
    window.addEventListener('resize', () => this._handleResize());
  }
  _handleResize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
  animate(callback) {
    const loop = () => { requestAnimationFrame(loop); const d = this.clock.getDelta(), t = this.clock.getElapsedTime(); if (callback) callback(d, t); this.renderer.render(this.scene, this.camera); };
    loop();
  }
  getSizes() { return { width: this.container.clientWidth, height: this.container.clientHeight }; }
  dispose() { this.renderer.dispose(); this.scene.clear(); }
}