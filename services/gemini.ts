
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { StoryConfig, StoryResult, Episode, VoiceStyle, Region, VoiceProfile, StoryPace } from "../types";

// Helper for handling API errors and retries with exponential backoff
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 2000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const errorMessage = err.message || String(err);
      
      // Retry on 5xx or 429
      const shouldRetry = errorMessage.includes('500') || 
                          errorMessage.includes('503') || 
                          errorMessage.includes('429') || 
                          errorMessage.toLowerCase().includes('quota') || 
                          errorMessage.toLowerCase().includes('rate');
      
      if (shouldRetry && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Gemini API Error (${errorMessage}). Retry ${i + 1}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// Artist styles for different cultural regions
const REGION_ARTIST_STYLES: Record<Region, string> = {
  global: "traditional storybook style, soft charcoal and watercolor textures, visible paper grain",
  mexico: "inspired by Alebrije-inspired colors and folk-art symbols; traditional mural textures",
  portugal: "inspired by modernism and the classic blue-and-white Azulejo aesthetic; sharp ink lines and glazed tile textures",
  japan: "inspired by woodblock (Ukiyo-e) precision and soft watercolor backgrounds; authentic paper grain",
  india: "inspired by rhythmic folk art and traditional Madhubani paintings; earthy pigments and bold organic forms",
  nordic: "inspired by misty folklore; graphite textures and mossy, atmospheric watercolor",
  france: "inspired by impressionist light and whimsical sketches; delicate ink work",
  brazil: "inspired by modernist movements; vibrant colors, organic shapes, and tropical textures",
  egypt: "inspired by ancient mural art on papyrus; hand-drawn silhouettes and textured golden ochre",
  china: "inspired by delicate ink wash paintings; graceful minimalist lines and subtle ink gradients on rice paper",
  greece: "inspired by ancient pottery silhouettes and Mediterranean modernism",
  australia: "inspired by contemporary Indigenous art; rich patterns and deep ochre storytelling layers",
  kenya: "inspired by playful folk art; high-contrast brush strokes and stylized savannah animals",
  usa: "inspired by mid-century concept art; geometric whimsy, bold color blocks, and soft-gouache textures",
  italy: "inspired by sepia sketches and playful traditional illustrations",
  germany: "inspired by classic dark woodcut illustrations and expressive charcoal textures",
  canada: "inspired by vibrant landscapes and rhythmic northern motifs",
  ireland: "inspired by Celtic mythic art and intricate illuminated borders",
  korea: "inspired by traditional genre paintings; natural pigments, soft ink outlines, and Hanji paper texture",
  morocco: "inspired by vibrant naive art; expressive brush strokes and rhythmic geometric symbols",
  peru: "inspired by mythic surrealism; soft glowing figures and ancient Andean textile textures",
  thailand: "inspired by ornate mural paintings; delicate gold-leaf outlines and ethereal scenes",
  ukraine: "inspired by fantastical folk art; bold symmetrical patterns and vibrant floral motifs",
  finland: "inspired by National Romanticism and ink sketches",
  bulgaria: "inspired by vibrant portraits; high-saturation gold-leaf outlines and rhythmic embroidery patterns",
  netherlands: "inspired by Dutch Golden Age and whimsical windmills; soft oil-paint textures",
  turkey: "inspired by Ottoman miniatures and vibrant Iznik tile patterns; rich pigments",
  vietnam: "inspired by traditional silk paintings; soft atmospheric washes and delicate ink lines",
  israel: "inspired by modern Mediterranean sketches and desert hues; textured sandstone feel",
  poland: "inspired by vibrant paper-cut art (Wycinanki); bold colors and sharp symmetrical forms",
  indonesia: "inspired by Wayang Kulit silhouettes and Batik patterns; intricate shadow textures",
  russia: "inspired by Khokhloma and Palekh lacquer art; deep blacks and vibrant reds/golds",
  sweden: "inspired by Dala horse motifs and clean Scandinavian lines; folk-art textures",
  denmark: "inspired by H.C. Andersen silhouettes and minimalist storybook charm",
  norway: "inspired by Rosemaling patterns and glacial watercolor textures",
  argentina: "inspired by fileteado porteño; elaborate curves and vibrant highlights",
  switzerland: "inspired by paper-cutting (Scherenschnitte) and crisp alpine sketches",
  south_africa: "inspired by Ndebele geometric patterns and vibrant contemporary African art",
  singapore: "inspired by Peranakan porcelain patterns and clean modern outlines",
  romania: "inspired by traditional embroidery patterns and dark woodland folklore textures",
  hungary: "inspired by Kalocsa floral motifs and vibrant hand-painted aesthetics",
  czech_republic: "inspired by traditional marionette textures and Bohemian glass clarity",
  philippines: "inspired by vibrant fiesta colors and traditional basket-weaving textures",
  malaysia: "inspired by Wayang and Batik fusion; intricate organic patterns",
  chile: "inspired by Andean muralism and deep volcanic earth tones",
  new_zealand: "inspired by Māori carving patterns and lush fern-green watercolor",
  colombia: "inspired by Pre-Columbian gold textures and vibrant tropical folk art",
  custom: "traditional hand-painted folk art style specific to this region"
};

export class StoryService {
  async analyzeVoice(base64Audio: string): Promise<VoiceProfile> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Match this parent's voice tone with one of these prebuilt voice signatures: 'Kore' (Warm), 'Puck' (Playful), 'Fenrir' (Deep), 'Charon' (Senior), 'Zephyr' (Soft). Describe the personality. Return as JSON.`;

    return withRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        contents: { parts: [{ inlineData: { data: base64Audio, mimeType: 'audio/wav' } }, { text: prompt }] },
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: {
            type: Type.OBJECT,
            properties: { 
              matchedVoice: { type: Type.STRING }, 
              personalityDesc: { type: Type.STRING } 
            },
            required: ["matchedVoice", "personalityDesc"]
          }
        }
      });
      return JSON.parse(response.text.trim());
    });
  }

  async generateStoryStructure(config: StoryConfig): Promise<StoryResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const targetRegion = config.region === 'custom' ? config.customRegionName : config.region;
    const targetWordCount = config.storyLength * 125;

    let languageInstruction = `Lang: ${config.language}.`;
    if (config.language === 'Portuguese (Portugal)') {
      languageInstruction += ` Use strict EUROPEAN PORTUGUESE (Portugal). Use "Tu" for second person singular. Use specific vocabulary like "autocarro" and "gelado".`;
    }

    const personalizationInstruction = `MAIN CHARACTER: ${config.childName ? `The main character's name is ${config.childName}.` : "Relatable child hero."} ${config.friendNames ? `FRIENDS: ${config.friendNames}.` : ""}`;

    let modeInstruction = config.storyMode === 'toddler' 
      ? "STRICT TODDLER MODE (2-3): Short clear sentences, sensory focus, melodic." 
      : "STRICT PRESCHOOL MODE (4-6): Narrative arc, clear resolution.";

    const styleInstruction = config.rhymeMode === 'rhymes' ? `STYLE: Simple rhymes.` : `STYLE: Engaging prose.`;

    let repeatInstruction = config.repeat 
      ? (config.repeatVariation === 'remixed_story' 
        ? `Generate ${config.repeatCount} episodes as REMIXES: same setting/characters, but slightly varied events.` 
        : `Generate ${config.repeatCount} identical episodes.`)
      : "Generate exactly 1 episode.";
      
    let meditationInstruction = config.meditationEnabled 
      ? "ADDITIONAL REQUIREMENT: Add a final episode titled 'Sleepy Wind-down Meditation'. This episode must be a 20-second meditative recap (~40 words), narrated in a very slow, soothing tone, inviting the child to close their eyes and imagine the highlights of the story." 
      : "";

    const promptText = `
      Author a magical story for Region: ${targetRegion}, Theme: ${config.theme}.
      ${modeInstruction}
      ${styleInstruction}
      ${repeatInstruction}
      ${meditationInstruction}
      NARRATION PACE: ${config.pace}.
      ${personalizationInstruction}
      ${languageInstruction}
      KEYWORDS: ${config.keywords || "Magical."}
      TARGET WORD COUNT: ~${targetWordCount} words per main episode.
      Define the character visually in 'main_character_description'.
      Return JSON.
    `;

    return withRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              app_title: { type: Type.STRING },
              story_mode: { type: Type.STRING },
              language: { type: Type.STRING },
              keywords_used: { type: Type.ARRAY, items: { type: Type.STRING } },
              main_character_description: { type: Type.STRING },
              episodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    episode_title: { type: Type.STRING },
                    logline: { type: Type.STRING },
                    outline: { type: Type.ARRAY, items: { type: Type.STRING } },
                    audio_direction: {
                      type: Type.OBJECT,
                      properties: {
                        voice_gender: { type: Type.STRING },
                        voice_style: { type: Type.STRING },
                        pace: { type: Type.STRING },
                        tone: { type: Type.STRING }
                      },
                      required: ["voice_gender", "voice_style", "pace", "tone"]
                    },
                    visual_plan: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          scene: { type: Type.NUMBER },
                          caption: { type: Type.STRING },
                          image_prompt: { type: Type.STRING }
                        },
                        required: ["scene", "caption", "image_prompt"]
                      }
                    },
                    ssml_narration: { type: Type.STRING },
                    closing_line: { type: Type.STRING }
                  },
                  required: ["episode_title", "logline", "outline", "audio_direction", "visual_plan", "ssml_narration", "closing_line"]
                }
              }
            },
            required: ["app_title", "story_mode", "language", "episodes", "main_character_description"]
          }
        }
      });
      return JSON.parse(response.text.trim());
    });
  }

  private splitIntoChunks(text: string, maxChars: number = 1000): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)/g) || [text];
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChars) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  async generateTTS(text: string, voice: string, style: VoiceStyle, language: string, mode: string, pace: StoryPace): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chunks = this.splitIntoChunks(text, 1000);
    const results: Uint8Array[] = [];

    const paceInstruction = pace === 'slow' 
      ? "Very slow and meditative." 
      : "Calm and slow rhythm.";

    for (const chunk of chunks) {
      const prompt = `Narrate for a children's story (${mode}) in ${language}. ${paceInstruction} Style: ${style}. Voice: ${voice}. Text: ${chunk}`;
      
      const chunkData = await withRetry(async () => {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice },
              },
            },
          },
        });
        const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
        if (!base64) return new Uint8Array(0);
        
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      });
      
      if (chunkData.length > 0) results.push(chunkData);
    }

    if (results.length === 0) return "";

    const totalLength = results.reduce((acc, curr) => acc + curr.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const res of results) {
      combined.set(res, offset);
      offset += res.length;
    }

    let binary = '';
    for (let i = 0; i < combined.byteLength; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return btoa(binary);
  }

  async generateSceneImage(prompt: string, mode: string, region: Region, charDesc: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const regionStyle = REGION_ARTIST_STYLES[region] || REGION_ARTIST_STYLES.global;
    const finalPrompt = `Children's storybook illustration, ${regionStyle}. Character: ${charDesc}. Scene: ${prompt}. Mode: ${mode}. Safe for kids.`;

    return withRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: finalPrompt }] },
        config: {
          imageConfig: { aspectRatio: "16:9" }
        }
      });
      
      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      return imagePart ? `data:image/png;base64,${imagePart.inlineData.data}` : "";
    });
  }

  async generateSoundscape(soundscape: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Create a continuous ambient background loop of ${soundscape}. Environmental sounds only.`;

    return withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
    });
  }
}
