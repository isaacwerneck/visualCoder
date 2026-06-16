class ParticleSystem {
  constructor(sceneManager) {
    this.scene = sceneManager.scene;
    this.particles = null;
    this.particleCount = 5000;
    this.positions = new Float32Array(this.particleCount * 3);
    this.colors = new Float32Array(this.particleCount * 3);
    this.sizes = new Float32Array(this.particleCount);
    this.velocities = [];
    this._init();
  }
  _init() {
    const geometry = new THREE.BufferGeometry();
    for (let i = 0; i < this.particleCount; i++) {
      const radius = 5 + Math.random() * 10, theta = Math.random() * Math.PI * 2, phi = Math.acos(2 * Math.random() - 1);
      this.positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      this.positions[i * 3 + 1] = radius * Math.cos(phi) * 1.5;
      this.positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      this.sizes[i] = 0.05 + Math.random() * 0.15;
      this.velocities.push({ x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02, z: (Math.random() - 0.5) * 0.02 });
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    const material = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }
  update(audioData, beatDetector, time) {
    const { bass, mid, treble, amplitude } = audioData;
    const positions = this.particles.geometry.attributes.position.array;
    const colors = this.particles.geometry.attributes.color.array;
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      this.velocities[i].x += (Math.random() - 0.5) * bass * 0.05;
      this.velocities[i].y += (Math.random() - 0.5) * mid * 0.05;
      this.velocities[i].z += (Math.random() - 0.5) * treble * 0.05;
      this.velocities[i].x *= 0.98; this.velocities[i].y *= 0.98; this.velocities[i].z *= 0.98;
      positions[i3] += this.velocities[i].x; positions[i3 + 1] += this.velocities[i].y; positions[i3 + 2] += this.velocities[i].z;
      const px = positions[i3], py = positions[i3 + 1], pz = positions[i3 + 2];
      const dist = Math.sqrt(px * px + py * py + pz * pz);
      if (dist > 12) { positions[i3] *= 0.99; positions[i3 + 1] *= 0.99; positions[i3 + 2] *= 0.99; }
      const hue = (dist / 12 + treble * 0.2 + time * 0.01) % 1;
      const c = new THREE.Color().setHSL(hue, 0.8, 0.5 + bass * 0.3);
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.color.needsUpdate = true;
    this.particles.material.size = 0.1 + amplitude * 0.3;
    this.particles.material.opacity = 0.5 + treble * 0.5;
  }
  setEnabled(enabled) { this.particles.visible = enabled; }
  dispose() { this.scene.remove(this.particles); this.particles.geometry.dispose(); this.particles.material.dispose(); }
}