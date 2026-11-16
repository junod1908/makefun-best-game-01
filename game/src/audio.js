export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.master = null;
  }

  unlock() {
    if (!this.ctx) {
      const AudioContextClass = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.15;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  tone(freqStart, freqEnd, duration, { type = 'sine', gain = 0.2, delay = 0 } = {}) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(1, freqStart), now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), now + duration);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), now + Math.min(0.015, duration * 0.2));
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp).connect(this.master);
    osc.start(now); osc.stop(now + duration + 0.02);
  }

  reflect() { this.tone(520, 1100, 0.09, { gain: 0.18 }); }
  mote() { this.tone(440, 660, 0.18, { gain: 0.12 }); this.tone(660, 880, 0.2, { gain: 0.1, delay: 0.1 }); }
  ring() { [660, 880, 1100].forEach((f, i) => this.tone(f, f * 1.08, 0.16, { gain: 0.13, delay: i * 0.07 })); }
  cityHit() { this.tone(150, 55, 0.24, { type: 'sawtooth', gain: 0.24 }); }
  dash() { this.tone(420, 90, 0.2, { type: 'sawtooth', gain: 0.07 }); }
  upgrade() { [523, 659, 784].forEach((f, i) => this.tone(f, f * 1.02, 0.22, { gain: 0.14, delay: i * 0.1 })); }
  click() { this.tone(900, 700, 0.035, { gain: 0.1 }); }
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, f * 1.03, 0.2, { gain: 0.16, delay: i * 0.11 })); }
  lose() { [392, 330, 262].forEach((f, i) => this.tone(f, f * 0.92, 0.25, { gain: 0.14, delay: i * 0.16 })); }
  toggleMute() { this.muted = !this.muted; return this.muted; }
}
