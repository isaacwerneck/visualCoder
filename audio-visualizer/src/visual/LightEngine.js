class LightEngine {
  constructor(sceneManager) {
    this.scene = sceneManager.scene;
    this.ambientLight = null; this.directionalLight = null; this.pointLight = null; this.spotLight = null;
    this._init();
  }
  _init() {
    this.ambientLight = new THREE.AmbientLight(0x222244, 0.3); this.scene.add(this.ambientLight);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(5, 10, 5); this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 1024; this.directionalLight.shadow.mapSize.height = 1024;
    this.scene.add(this.directionalLight);
    this.pointLight = new THREE.PointLight(0x3a6ea5, 2, 20); this.pointLight.position.set(-3, 2, 2); this.scene.add(this.pointLight);
    this.spotLight = new THREE.SpotLight(0x4a8bc2, 1, 30, Math.PI / 4, 0.5, 1);
    this.spotLight.position.set(0, 8, 0); this.spotLight.target.position.set(0, 0, 0);
    this.scene.add(this.spotLight); this.scene.add(this.spotLight.target);
  }
  update(audioData, beatDetector, time) {
    const { bass, mid, treble, amplitude } = audioData;
    const isBeat = beatDetector.isBeatActive(), bi = beatDetector.getBeatIntensity();
    const ah = (time * 0.02) % 1;
    this.ambientLight.color.setHSL(ah, 0.3, 0.2 + bass * 0.3);
    this.ambientLight.intensity = 0.2 + mid * 0.4;
    const da = time * 0.1 + mid * 2;
    this.directionalLight.position.x = Math.sin(da) * 8; this.directionalLight.position.z = Math.cos(da) * 8;
    this.directionalLight.position.y = 5 + treble * 5;
    this.directionalLight.intensity = 0.5 + amplitude * 1.5;
    const ph = (bass * 0.5 + time * 0.05) % 1;
    this.pointLight.color.setHSL(ph, 0.8, 0.5);
    this.pointLight.position.x = Math.sin(time * 0.5) * 4 * (1 + bass);
    this.pointLight.position.z = Math.cos(time * 0.5) * 4 * (1 + bass);
    this.pointLight.position.y = Math.sin(time * 0.7) * 3 + bass * 2;
    this.pointLight.intensity = 1 + bass * 3;
    this.pointLight.distance = 10 + bass * 10;
    if (isBeat) { this.spotLight.intensity = 3 + bi * 5; this.spotLight.color.setHSL(0.6 + bi * 0.3, 0.8, 0.5); }
    else { this.spotLight.intensity *= 0.98; if (this.spotLight.intensity < 0.5) this.spotLight.intensity = 0.5; }
  }
  dispose() {
    this.scene.remove(this.ambientLight); this.scene.remove(this.directionalLight);
    this.scene.remove(this.pointLight); this.scene.remove(this.spotLight); this.scene.remove(this.spotLight.target);
  }
}