class GeometryEngine {
  constructor(sceneManager) {
    this.scene = sceneManager.scene;
    this.group = new THREE.Group(); this.scene.add(this.group);
    this.geometryType = 'cube'; this.count = 20; this.size = 1; this.wireframe = false; this.transparency = false; this.speed = 1;
    this.objects = []; this.targetScales = []; this.originalPositions = [];
    this.palettes = {
      'xp-classic': { primary: 0x3a6ea5, secondary: 0x68bd42, accent: 0xffcc00 },
      'neon-cyber': { primary: 0xff00ff, secondary: 0x00ffff, accent: 0xffff00 },
      'sunset-psy': { primary: 0xff4500, secondary: 0xff1493, accent: 0xffd700 },
      'chrome-robot': { primary: 0xc0c0c0, secondary: 0xff6600, accent: 0x00bfff },
      'aero-glass': { primary: 0xe8f0fe, secondary: 0x4fc3f7, accent: 0xffffff },
    };
    this.currentPalette = 'xp-classic';
    this._build();
  }
  _build() { this._clear(); this._createGeometries(); }
  _clear() {
    this.objects.forEach(obj => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) obj.material.dispose(); this.group.remove(obj); });
    this.objects = []; this.targetScales = []; this.originalPositions = [];
  }
  _createGeometries() {
    for (let i = 0; i < this.count; i++) {
      const geometry = this._createGeometry(this.geometryType);
      const hue = (i / this.count + Math.random() * 0.1) % 1;
      const material = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(hue, 0.8, 0.5), metalness: 0.3, roughness: 0.4, wireframe: this.wireframe, transparent: this.transparency, opacity: this.transparency ? 0.6 : 1 });
      const mesh = new THREE.Mesh(geometry, material);
      const theta = Math.random() * Math.PI * 2, phi = Math.acos(2 * Math.random() - 1), radius = 3 + Math.random() * 5;
      const x = radius * Math.sin(phi) * Math.cos(theta), y = radius * Math.cos(phi) * 1.5, z = radius * Math.sin(phi) * Math.sin(theta);
      mesh.position.set(x, y, z);
      mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, 0);
      const scale = 0.3 + Math.random() * 0.7;
      mesh.scale.set(scale, scale, scale);
      mesh.castShadow = true; mesh.receiveShadow = true;
      this.originalPositions.push({ x, y, z });
      this.targetScales.push(scale);
      mesh.userData = { index: i, baseScale: scale, phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 1.5, hue: Math.random() };
      this.group.add(mesh); this.objects.push(mesh);
    }
  }
  _createGeometry(type) {
    switch (type) {
      case 'cube': return new THREE.BoxGeometry(1, 1, 1);
      case 'sphere': return new THREE.SphereGeometry(0.6, 32, 32);
      case 'torus': return new THREE.TorusGeometry(0.6, 0.25, 16, 32);
      case 'icosahedron': return new THREE.IcosahedronGeometry(0.6, 2);
      case 'dodecahedron': return new THREE.DodecahedronGeometry(0.6, 2);
      case 'torusKnot': return new THREE.TorusKnotGeometry(0.5, 0.2, 64, 8, 2, 3);
      case 'cone': return new THREE.ConeGeometry(0.6, 1, 32);
      case 'cylinder': return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
      default: return new THREE.BoxGeometry(1, 1, 1);
    }
  }
  update(audioData, beatDetector, time) {
    const { bass, mid, treble } = audioData;
    const isBeat = beatDetector.isBeatActive();
    const beatIntensity = beatDetector.getBeatIntensity();
    this.objects.forEach((obj, i) => {
      const ud = obj.userData;
      const phase = ud.phase + time * 0.5 * ud.speed * this.speed;
      const bassScale = 1 + bass * 2 * (0.5 + Math.sin(phase) * 0.5);
      const beatScale = isBeat ? 1 + beatIntensity * 1.5 : 1;
      const s = this.targetScales[i] * bassScale * beatScale;
      obj.scale.set(s, s, s);
      obj.rotation.x += mid * 0.02 * this.speed;
      obj.rotation.y += treble * 0.03 * this.speed;
      obj.rotation.z += bass * 0.01 * this.speed;
      const mx = Math.sin(time * 0.5 * ud.speed + phase) * bass * 1.5;
      const my = Math.cos(time * 0.3 * ud.speed + phase) * mid * 1.5;
      const mz = Math.sin(time * 0.7 * ud.speed + phase) * treble * 1.5;
      obj.position.x = this.originalPositions[i].x + mx;
      obj.position.y = this.originalPositions[i].y + my;
      obj.position.z = this.originalPositions[i].z + mz;
      if (obj.material) {
        const h = (ud.hue + treble * 0.1 + time * 0.02) % 1;
        obj.material.color.setHSL(h, 0.7 + bass * 0.3, 0.3 + mid * 0.5);
        if (isBeat) { obj.material.emissive = obj.material.color; obj.material.emissiveIntensity = beatIntensity * 2; }
        else { obj.material.emissiveIntensity *= 0.95; }
      }
    });
  }
  setGeometryType(type) { this.geometryType = type; this._build(); }
  setCount(count) { this.count = count; this._build(); }
  setWireframe(enabled) { this.wireframe = enabled; this.objects.forEach(obj => { if (obj.material) obj.material.wireframe = enabled; }); }
  setTransparency(enabled) { this.transparency = enabled; this.objects.forEach(obj => { if (obj.material) { obj.material.transparent = enabled; obj.material.opacity = enabled ? 0.6 : 1; } }); }
  setPalette(name) { if (this.palettes[name]) { this.currentPalette = name; this._build(); } }
  setSpeed(speed) { this.speed = speed; }
  dispose() { this._clear(); this.scene.remove(this.group); }
}