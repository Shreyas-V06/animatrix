// Tiny WebAudio synth: UI sound effects + ambient drone with analyser for visualizers.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let droneGain: GainNode | null = null;
let enabled = false;

function ensure() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.5;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    master.connect(analyser);
    analyser.connect(ctx.destination);
  }
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
  if (!enabled) return;
  const c = ensure();
  if (!c || !master) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g).connect(master);
  o.start();
  o.stop(c.currentTime + dur);
}

function noise(dur: number, vol: number, freq = 1200) {
  if (!enabled) return;
  const c = ensure();
  if (!c || !master) return;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(freq, c.currentTime);
  f.frequency.exponentialRampToValueAtTime(freq * 4, c.currentTime + dur);
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(master);
  src.start();
}

export const sfx = {
  hover: () => tone(1800, 0.05, "square", 0.03),
  click: () => { tone(520, 0.12, "sawtooth", 0.08, 1400); tone(1040, 0.08, "triangle", 0.05); },
  whoosh: () => noise(0.5, 0.25, 300),
  slash: () => { noise(0.25, 0.3, 2000); tone(220, 0.3, "sawtooth", 0.06, 60); },
  power: () => { tone(110, 1.2, "sawtooth", 0.1, 880); noise(1, 0.2, 200); },
  get on() { return enabled; },
  async toggle(on?: boolean) {
    enabled = on ?? !enabled;
    const c = ensure();
    if (!c || !master) return enabled;
    if (c.state === "suspended") await c.resume();
    if (enabled && !droneGain) {
      droneGain = c.createGain();
      droneGain.gain.value = 0;
      const lfo = c.createOscillator();
      const lfoG = c.createGain();
      lfo.frequency.value = 0.15;
      lfoG.gain.value = 300;
      const filt = c.createBiquadFilter();
      filt.type = "lowpass";
      filt.frequency.value = 600;
      lfo.connect(lfoG).connect(filt.frequency);
      [55, 82.4, 110.5, 164.8].forEach((f) => {
        const o = c.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = f;
        o.detune.value = Math.random() * 12 - 6;
        o.connect(filt);
        o.start();
      });
      // pulse
      const pulse = c.createOscillator();
      const pg = c.createGain();
      pulse.frequency.value = 2;
      pg.gain.value = 0.3;
      pulse.connect(pg.gain);
      filt.connect(pg).connect(droneGain);
      droneGain.connect(master);
      lfo.start();
      pulse.start();
    }
    droneGain?.gain.linearRampToValueAtTime(enabled ? 0.12 : 0, c.currentTime + 1);
    return enabled;
  },
  levels(out: Uint8Array) {
    if (!analyser) return false;
    analyser.getByteFrequencyData(out as Uint8Array<ArrayBuffer>);
    return true;
  },
};
