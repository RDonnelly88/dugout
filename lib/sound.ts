/**
 * The app's few noises, synthesised so there are no audio files to load: a
 * referee's whistle and a card being dealt.
 *
 * Each plays only in answer to something somebody did — saving a result,
 * turning a card — and never once they have switched sound off in Settings.
 * The choice is kept on the device rather than the account: whether a phone
 * should whistle depends on where the phone is.
 */

const SOUND_STORAGE_KEY = "dugout-sound";

/** On unless somebody has said otherwise. Anything unrecognised counts as on. */
export const soundAllowed = (stored: string | null): boolean => stored !== "off";

export function soundEnabled(): boolean {
  try {
    return soundAllowed(localStorage.getItem(SOUND_STORAGE_KEY));
  } catch {
    // Storage blocked: nobody has been able to turn it off.
    return true;
  }
}

export function setSoundEnabled(on: boolean): void {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Storage blocked: the choice lasts as long as the page does.
  }
}

let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined" || typeof AudioContext === "undefined") return null;
  if (!soundEnabled()) return null;
  context ??= new AudioContext();
  // Browsers hold a context suspended until the page has been interacted with.
  if (context.state === "suspended") void context.resume();
  return context;
}

/**
 * Wakes the audio while a click is still being handled.
 *
 * A sound that answers a save plays once the server has replied, by which
 * point some browsers no longer count it as following a click and refuse to
 * start the audio. Calling this from the click itself gets the context
 * running in time.
 */
export function primeSound(): void {
  audio();
}

/** A burst of filtered noise, fading out: the raw material of a click or a breath. */
function burst(
  ctx: AudioContext,
  { at, length, frequency, gain, q = 1.4 }: { at: number; length: number; frequency: number; gain: number; q?: number }
) {
  const samples = Math.ceil(ctx.sampleRate * length);
  const buffer = ctx.createBuffer(1, samples, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < samples; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / samples) ** 3;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = frequency;
  filter.Q.value = q;
  const volume = ctx.createGain();
  volume.gain.value = gain;
  source.connect(filter).connect(volume).connect(ctx.destination);
  source.start(at);
}

/**
 * One blast on a pea whistle: a high tone warbling as the pea rattles round
 * the chamber, with a breath of air at the start.
 */
function blast(ctx: AudioContext, at: number, length: number) {
  const tone = ctx.createOscillator();
  tone.frequency.value = 2950;

  // The pea, shaking the pitch and the volume together.
  const pea = ctx.createOscillator();
  pea.frequency.value = 27;
  const pitchShake = ctx.createGain();
  pitchShake.gain.value = 170;
  pea.connect(pitchShake).connect(tone.frequency);

  const level = ctx.createGain();
  level.gain.setValueAtTime(0, at);
  level.gain.linearRampToValueAtTime(0.11, at + 0.025);
  level.gain.setValueAtTime(0.11, at + length - 0.04);
  level.gain.linearRampToValueAtTime(0, at + length);
  const flutter = ctx.createGain();
  flutter.gain.value = 0.035;
  pea.connect(flutter).connect(level.gain);

  tone.connect(level).connect(ctx.destination);
  tone.start(at);
  pea.start(at);
  tone.stop(at + length + 0.05);
  pea.stop(at + length + 0.05);

  burst(ctx, { at, length: 0.08, frequency: 3200, gain: 0.25, q: 1.2 });
}

/** Full time: two short blasts and a long one. */
export function playFullTime(): void {
  const ctx = audio();
  if (!ctx) return;
  const t = ctx.currentTime + 0.02;
  blast(ctx, t, 0.16);
  blast(ctx, t + 0.28, 0.16);
  blast(ctx, t + 0.56, 0.85);
}

/** Kick-off: one blast. */
export function playKickOff(): void {
  const ctx = audio();
  if (!ctx) return;
  blast(ctx, ctx.currentTime + 0.02, 0.55);
}

/** A card turned over and laid down: the snap of the card, then the table. */
export function playCardFlip(): void {
  const ctx = audio();
  if (!ctx) return;
  const t = ctx.currentTime;
  const vary = (n: number) => n * (0.9 + Math.random() * 0.2);
  burst(ctx, { at: t, length: 0.03, frequency: vary(2600), gain: 0.5, q: 2 });
  burst(ctx, { at: t + vary(0.05), length: 0.06, frequency: vary(320), gain: 0.7, q: 0.9 });
}
