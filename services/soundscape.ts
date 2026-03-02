/**
 * Storia Soundscape Synthesizer
 * Generates loopable ambient sounds using the Web Audio API.
 * No external API or CDN required — works fully offline.
 */

import { getSharedAudioContext } from './audio';

export type SoundscapeType = 'rain' | 'forest' | 'ocean' | 'wind' | 'none';

interface SoundscapeNodes {
    gainNode: GainNode;
    sources: AudioNode[];
    stop: () => void;
}

let activeSoundscape: SoundscapeNodes | null = null;

/**
 * Creates a buffer filled with white noise
 */
function createNoiseBuffer(ctx: AudioContext, durationSeconds = 2): AudioBuffer {
    const bufferSize = ctx.sampleRate * durationSeconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
}

/**
 * Creates a looping buffered source node from a noise buffer
 */
function createLoopingNoise(ctx: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
}

function buildRain(ctx: AudioContext, masterGain: GainNode): AudioNode[] {
    const noiseBuffer = createNoiseBuffer(ctx, 3);

    // Heavy rain layer — high-passed white noise
    const rainSource = createLoopingNoise(ctx, noiseBuffer);
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'highpass';
    rainFilter.frequency.value = 1200;
    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.5;
    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(masterGain);

    // Soft drip layer — band-passed at a lower freq
    const dripSource = createLoopingNoise(ctx, noiseBuffer);
    const dripFilter = ctx.createBiquadFilter();
    dripFilter.type = 'bandpass';
    dripFilter.frequency.value = 400;
    dripFilter.Q.value = 0.5;
    const dripGain = ctx.createGain();
    dripGain.gain.value = 0.3;
    dripSource.connect(dripFilter);
    dripFilter.connect(dripGain);
    dripGain.connect(masterGain);

    rainSource.start();
    dripSource.start();

    return [rainSource, dripSource, rainFilter, dripFilter, rainGain, dripGain];
}

function buildOcean(ctx: AudioContext, masterGain: GainNode): AudioNode[] {
    const noiseBuffer = createNoiseBuffer(ctx, 4);
    const waveSource = createLoopingNoise(ctx, noiseBuffer);

    // Low-pass for deep ocean rumble
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 500;

    // LFO to simulate wave rhythm
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12; // ~1 wave every 8 seconds
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.4;
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain as unknown as AudioNode); // modulate master gain

    const waveGain = ctx.createGain();
    waveGain.gain.value = 0.7;

    waveSource.connect(lowpass);
    lowpass.connect(waveGain);
    waveGain.connect(masterGain);

    waveSource.start();
    lfo.start();

    return [waveSource, lowpass, lfo, lfoGain, waveGain];
}

function buildWind(ctx: AudioContext, masterGain: GainNode): AudioNode[] {
    const noiseBuffer = createNoiseBuffer(ctx, 3);
    const windSource = createLoopingNoise(ctx, noiseBuffer);

    // Bandpass for "whooshing" character
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 300;
    bp.Q.value = 0.8;

    // Gentle LFO to simulate gusts
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.25;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.5;

    lfo.connect(lfoGain);
    lfoGain.connect(windGain.gain as unknown as AudioNode);

    windSource.connect(bp);
    bp.connect(windGain);
    windGain.connect(masterGain);

    windSource.start();
    lfo.start();

    return [windSource, bp, lfo, lfoGain, windGain];
}

function buildForest(ctx: AudioContext, masterGain: GainNode): AudioNode[] {
    const noiseBuffer = createNoiseBuffer(ctx, 3);

    // Gentle background rustle
    const rustleSource = createLoopingNoise(ctx, noiseBuffer);
    const rustleFilter = ctx.createBiquadFilter();
    rustleFilter.type = 'bandpass';
    rustleFilter.frequency.value = 2500;
    rustleFilter.Q.value = 1.5;
    const rustleGain = ctx.createGain();
    rustleGain.gain.value = 0.15;

    rustleSource.connect(rustleFilter);
    rustleFilter.connect(rustleGain);
    rustleGain.connect(masterGain);
    rustleSource.start();

    // Periodic bird chirps using oscillators
    const oscillators: OscillatorNode[] = [];
    const chirpScheduler = () => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 2000 + Math.random() * 1500;
        const chirpGain = ctx.createGain();
        chirpGain.gain.setValueAtTime(0, ctx.currentTime);
        chirpGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(chirpGain);
        chirpGain.connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
        oscillators.push(osc);
    };

    // Fire chirps at random intervals
    const chirpInterval = setInterval(() => {
        if (Math.random() > 0.4) chirpScheduler();
    }, 1500);

    // Return a stop function that also clears the interval
    const stopFn: any = { clearInterval: () => clearInterval(chirpInterval) };

    return [rustleSource, rustleFilter, rustleGain, stopFn];
}

/**
 * Starts a soundscape. Returns a stop function.
 */
export function startSoundscape(type: SoundscapeType, volume = 0.5): (() => void) | null {
    if (type === 'none') return null;

    stopSoundscape();

    try {
        const ctx = getSharedAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        const masterGain = ctx.createGain();
        masterGain.gain.value = volume;
        masterGain.connect(ctx.destination);

        let nodes: AudioNode[] = [];
        let extraCleanup: (() => void) | null = null;

        switch (type) {
            case 'rain': nodes = buildRain(ctx, masterGain); break;
            case 'ocean': nodes = buildOcean(ctx, masterGain); break;
            case 'wind': nodes = buildWind(ctx, masterGain); break;
            case 'forest': {
                const forestNodes = buildForest(ctx, masterGain);
                // Last element may have clearInterval
                const last = forestNodes[forestNodes.length - 1] as any;
                if (last?.clearInterval) {
                    extraCleanup = last.clearInterval;
                    nodes = forestNodes.slice(0, -1);
                } else {
                    nodes = forestNodes;
                }
                break;
            }
        }

        const stop = () => {
            try {
                masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
                if (extraCleanup) extraCleanup();
                setTimeout(() => {
                    nodes.forEach(n => {
                        try { (n as AudioBufferSourceNode).stop?.(); } catch (_) { }
                        try { n.disconnect(); } catch (_) { }
                    });
                    masterGain.disconnect();
                }, 600);
            } catch (_) { }
        };

        activeSoundscape = { gainNode: masterGain, sources: nodes, stop };
        return stop;
    } catch (e) {
        console.error('Soundscape synthesis failed:', e);
        return null;
    }
}

/**
 * Stops the currently active synthesized soundscape.
 */
export function stopSoundscape() {
    if (activeSoundscape) {
        activeSoundscape.stop();
        activeSoundscape = null;
    }
}

/**
 * Changes the volume of the active soundscape.
 */
export function setSoundscapeVolume(volume: number) {
    if (activeSoundscape) {
        const ctx = getSharedAudioContext();
        activeSoundscape.gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
    }
}
