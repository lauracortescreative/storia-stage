
/**
 * Storia Gemini Service — server-side proxy
 * All Gemini calls go through /api/gemini/* — the API key never reaches the browser.
 */

import { StoryConfig, StoryResult, VoiceStyle, Region, VoiceProfile, StoryPace } from '../types';

const BASE = import.meta.env.DEV ? 'http://localhost:3001/api/gemini' : '/api/gemini';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Gemini proxy error (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export class StoryService {
  async analyzeVoice(base64Audio: string): Promise<VoiceProfile> {
    return post('/voice', { base64Audio });
  }

  async generateStoryStructure(config: StoryConfig): Promise<StoryResult> {
    return post('/story', config);
  }

  async generateTTS(
    text: string,
    voice: string,
    style: VoiceStyle,
    language: string,
    mode: string,
    pace: StoryPace
  ): Promise<string> {
    const { audio } = await post<{ audio: string }>('/tts', { text, voice, style, language, mode, pace });
    return audio;
  }

  async generateSceneImage(
    prompt: string,
    mode: string,
    region: Region,
    charDesc: string
  ): Promise<string> {
    const { imageUrl } = await post<{ imageUrl: string }>('/image', { prompt, mode, region, charDesc });
    return imageUrl;
  }

  async generateSoundscape(soundscape: string): Promise<string> {
    const { audio } = await post<{ audio: string }>('/soundscape', { soundscape });
    return audio;
  }
}
