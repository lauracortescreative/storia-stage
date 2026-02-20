let sharedAudioCtx: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return sharedAudioCtx;
}

/**
 * Decodes raw PCM16 base64 data directly into an AudioBuffer.
 * This is faster than decodeAudio because it skips the WAV encoding and Blob creation steps.
 */
export async function decodePCMToBuffer(base64: string): Promise<AudioBuffer | null> {
  if (!base64 || base64.trim().length === 0) return null;

  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    if (bytes.byteLength < 2) return null;

    // The audio bytes returned by the API is raw PCM data (16-bit).
    const sampleCount = Math.floor(bytes.byteLength / 2);
    // Ensure we don't have alignment issues by using the buffer slice if needed,
    // though here Uint8Array.buffer is the full fresh buffer.
    const dataInt16 = new Int16Array(bytes.buffer, 0, sampleCount);
    
    const sampleRate = 24000;
    const numChannels = 1;
    const frameCount = dataInt16.length / numChannels;

    if (frameCount <= 0) return null;

    const audioCtx = getSharedAudioContext();
    const buffer = audioCtx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }

    return buffer;
  } catch (e) {
    console.error("Error decoding PCM data to buffer:", e);
    return null;
  }
}

/**
 * Legacy decoder that returns a Blob URL. 
 * Kept for components that strictly require an <audio> tag src.
 */
export async function decodeAudio(base64: string): Promise<string> {
  const buffer = await decodePCMToBuffer(base64);
  if (!buffer) return "";
  
  try {
    const wavBlob = bufferToWave(buffer, buffer.length);
    return URL.createObjectURL(wavBlob);
  } catch (e) {
    console.error("Error creating WAV from buffer:", e);
    return "";
  }
}

// Minimal helper to convert AudioBuffer to WAV Blob
function bufferToWave(abuffer: AudioBuffer, len: number) {
  const numOfChan = abuffer.numberOfChannels;
  const length = len * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16);
  setUint16(1); // PCM - integer
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);

  setUint32(0x61746164); // "data" chunk
  setUint32(length - pos - 4);

  for (i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (sample < 0 ? sample * 0x8000 : sample * 0x7fff) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([buffer], { type: "audio/wav" });
}