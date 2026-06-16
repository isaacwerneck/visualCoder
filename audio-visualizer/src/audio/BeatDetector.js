class BeatDetector {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.isBeat = false; this.bpm = 120; this.beatConfidence = 0; this.lastBeatTime = 0;
    this.minBPM = 60; this.maxBPM = 180; this.beatThreshold = 0.6; this.historySize = 43;
    this.energyHistory = []; this.instantEnergy = 0; this.averageEnergy = 0; this.variance = 0;
    this.beatTimer = 0; this.beatDuration = 0.15;
  }
  update() {
    const bass = this.audioManager.bass;
    this.instantEnergy = bass * bass;
    this.energyHistory.push(this.instantEnergy);
    if (this.energyHistory.length > this.historySize) this.energyHistory.shift();
    const sum = this.energyHistory.reduce((a, b) => a + b, 0);
    this.averageEnergy = sum / this.energyHistory.length;
    const vs = this.energyHistory.reduce((a, b) => a + (b - this.averageEnergy) ** 2, 0);
    this.variance = vs / this.energyHistory.length;
    const stdDev = Math.sqrt(this.variance);
    const threshold = this.averageEnergy + this.beatThreshold * stdDev;
    this.isBeat = this.instantEnergy > threshold && bass > 0.3;
    if (this.isBeat) {
      const now = Date.now();
      if (this.lastBeatTime > 0) {
        const interval = (now - this.lastBeatTime) / 1000;
        if (interval > 0.3 && interval < 2.0) {
          const instantBPM = 60 / interval;
          this.bpm = Math.max(this.minBPM, Math.min(this.maxBPM, this.bpm * 0.7 + instantBPM * 0.3));
        }
      }
      this.lastBeatTime = now;
      this.beatTimer = this.beatDuration;
    }
    if (this.beatTimer > 0) this.beatTimer -= 1 / 60;
  }
  isBeatActive() { return this.beatTimer > 0; }
  getBeatIntensity() { if (this.beatTimer <= 0) return 0; return Math.min(1, this.beatTimer / this.beatDuration); }
}