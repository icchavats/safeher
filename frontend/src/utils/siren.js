/**
 * Pure Web Audio API loud emergency siren (zero external libraries).
 * Uses dual detuned oscillators with continuous frequency sweep (650 Hz <-> 1380 Hz)
 * and a compressor/gain stage for maximum loudness without clipping.
 */
class EmergencySiren {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.osc1 = null;
    this.osc2 = null;
    this.lfo = null;
    this.masterGain = null;
    this.unlocked = false;
    this.listenersAttached = false;
  }

  ensureContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Attach one-time user gesture listeners to unlock Web Audio early.
   */
  initAutoUnlock() {
    if (this.listenersAttached || typeof window === 'undefined') return;
    this.listenersAttached = true;

    const unlock = () => {
      const ctx = this.ensureContext();
      if (ctx && ctx.state === 'running') {
        this.unlocked = true;
      } else if (ctx) {
        ctx.resume().then(() => {
          this.unlocked = true;
        }).catch(() => {});
      }
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  start() {
    if (this.isPlaying) return true;
    const ctx = this.ensureContext();
    if (!ctx) return false;

    try {
      // Master gain + dynamics compressor for loud, clear siren output
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-10, ctx.currentTime);
      compressor.knee.setValueAtTime(12, ctx.currentTime);
      compressor.ratio.setValueAtTime(12, ctx.currentTime);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.85, ctx.currentTime);

      // Primary sawtooth + secondary square/sawtooth for piercing real-siren harmonics
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(1000, ctx.currentTime);

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1015, ctx.currentTime);

      // LFO sweeps frequency smoothly between ~650 Hz and ~1380 Hz (classic wail siren)
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(1.35, ctx.currentTime); // ~1.35 cycles/sec

      const lfoGain1 = ctx.createGain();
      lfoGain1.gain.setValueAtTime(365, ctx.currentTime);

      const lfoGain2 = ctx.createGain();
      lfoGain2.gain.setValueAtTime(375, ctx.currentTime);

      lfo.connect(lfoGain1);
      lfo.connect(lfoGain2);
      lfoGain1.connect(osc1.frequency);
      lfoGain2.connect(osc2.frequency);

      osc1.connect(masterGain);
      osc2.connect(masterGain);
      masterGain.connect(compressor);
      compressor.connect(ctx.destination);

      osc1.start();
      osc2.start();
      lfo.start();

      this.osc1 = osc1;
      this.osc2 = osc2;
      this.lfo = lfo;
      this.masterGain = masterGain;
      this.isPlaying = true;
      return ctx.state === 'running';
    } catch {
      return false;
    }
  }

  stop() {
    if (!this.isPlaying) return;
    try {
      this.osc1?.stop();
      this.osc2?.stop();
      this.lfo?.stop();
      this.osc1?.disconnect();
      this.osc2?.disconnect();
      this.lfo?.disconnect();
      this.masterGain?.disconnect();
    } catch {
      // Ignore already stopped nodes
    }
    this.osc1 = null;
    this.osc2 = null;
    this.lfo = null;
    this.masterGain = null;
    this.isPlaying = false;
  }

  isAudioRunning() {
    return Boolean(this.ctx && this.ctx.state === 'running');
  }
}

export const emergencySiren = new EmergencySiren();
