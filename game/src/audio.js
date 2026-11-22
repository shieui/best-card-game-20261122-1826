// Emberfall — tiny sounds, synthesized with WebAudio, no audio files.
// Everything is guarded: a browser without audio simply stays silent.

let context = null;

function ensureContext() {
  if (context) return context;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    context = new AudioContextClass();
  } catch {
    context = null;
  }
  return context;
}

function blip(frequency, duration, type = 'sine', gain = 0.08) {
  const ctx = ensureContext();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') void ctx.resume();
    const oscillator = ctx.createOscillator();
    const amp = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    amp.gain.setValueAtTime(gain, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.connect(amp);
    amp.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Sound is garnish; a failure here must never break the game.
  }
}

export const sounds = {
  select() { blip(520, 0.07, 'sine', 0.05); },
  play() { blip(392, 0.12, 'triangle', 0.09); blip(587, 0.16, 'triangle', 0.07); },
  surge() { blip(660, 0.1, 'sawtooth', 0.05); blip(880, 0.18, 'sawtooth', 0.05); },
  hurt() { blip(160, 0.18, 'square', 0.06); },
  win() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.25, 'triangle', 0.09), i * 110)); },
  lose() { [392, 330, 262].forEach((f, i) => setTimeout(() => blip(f, 0.3, 'triangle', 0.08), i * 140)); },
};
