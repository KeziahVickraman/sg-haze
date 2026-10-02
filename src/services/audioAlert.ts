/**
 * Synthesizes audible alarm tones using Web Audio API
 * No external sound files needed.
 */

class AudioAlertService {
  private ctx: AudioContext | null = null;
  private isAlarmPlaying = false;
  private intervalId: number | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Plays a single alert chime (two-tone attention sound)
   */
  public playAlertChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Tone 1: High alert pitch
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(880, now); // A5
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Tone 2: Harmonizing resolve
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now + 0.12); // D6
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.52);
    } catch {
      // Audio playback blocked or unavailable
    }
  }

  /**
   * Plays an urgent hazard emergency sound (three rapid warning beeps)
   */
  public playHazardEmergencyTone(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const beeps = [0, 0.16, 0.32];

      beeps.forEach((startOffset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(987.77, now + startOffset); // B5 urgent
        gain.gain.setValueAtTime(0.16, now + startOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + startOffset);
        osc.stop(now + startOffset + 0.14);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Starts repeating siren alarm until stopped
   */
  public startEmergencySiren(): void {
    if (this.isAlarmPlaying) return;
    this.isAlarmPlaying = true;
    this.playHazardEmergencyTone();

    this.intervalId = window.setInterval(() => {
      if (this.isAlarmPlaying) {
        this.playHazardEmergencyTone();
      }
    }, 2800);
  }

  public stopEmergencySiren(): void {
    this.isAlarmPlaying = false;
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public isPlaying(): boolean {
    return this.isAlarmPlaying;
  }
}

export const audioAlert = new AudioAlertService();
