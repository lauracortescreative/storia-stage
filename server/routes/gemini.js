import express from 'express';
import { GoogleGenAI, Type, Modality } from '@google/genai';

const router = express.Router();

// ─── Shared helpers ───────────────────────────────────────────────────────────

async function withRetry(fn, maxRetries = 3, initialDelay = 2000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            const msg = err.message || String(err);
            // Retry on all transient errors — Gemini can fail with any message
            const isPermError = msg.includes('API_KEY') || msg.includes('not configured') ||
                msg.includes('PERMISSION_DENIED') || msg.includes('invalid_argument');
            if (!isPermError && i < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, i);
                console.warn(`Gemini retry ${i + 1}/${maxRetries} in ${delay}ms: ${msg}`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}

function getAI() {
    const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not configured on the server.');
    return new GoogleGenAI({ apiKey: key });
}

const REGION_ARTIST_STYLES = {
    global: 'traditional storybook style, soft charcoal and watercolor textures, visible paper grain',
    mexico: 'inspired by Alebrije-inspired colors and folk-art symbols; traditional mural textures',
    portugal: 'inspired by modernism and the classic blue-and-white Azulejo aesthetic; sharp ink lines and glazed tile textures',
    japan: 'inspired by woodblock (Ukiyo-e) precision and soft watercolor backgrounds; authentic paper grain',
    india: 'inspired by rhythmic folk art and traditional Madhubani paintings; earthy pigments and bold organic forms',
    nordic: 'inspired by misty folklore; graphite textures and mossy, atmospheric watercolor',
    france: 'inspired by impressionist light and whimsical sketches; delicate ink work',
    brazil: 'inspired by modernist movements; vibrant colors, organic shapes, and tropical textures',
    egypt: 'inspired by ancient mural art on papyrus; hand-drawn silhouettes and textured golden ochre',
    china: 'inspired by delicate ink wash paintings; graceful minimalist lines and subtle ink gradients on rice paper',
    greece: 'inspired by ancient pottery silhouettes and Mediterranean modernism',
    australia: 'inspired by contemporary Indigenous art; rich patterns and deep ochre storytelling layers',
    kenya: 'inspired by playful folk art; high-contrast brush strokes and stylized savannah animals',
    usa: 'inspired by mid-century concept art; geometric whimsy, bold color blocks, and soft-gouache textures',
    italy: 'inspired by sepia sketches and playful traditional illustrations',
    germany: 'inspired by classic dark woodcut illustrations and expressive charcoal textures',
    canada: 'inspired by vibrant landscapes and rhythmic northern motifs',
    ireland: 'inspired by Celtic mythic art and intricate illuminated borders',
    korea: 'inspired by traditional genre paintings; natural pigments, soft ink outlines, and Hanji paper texture',
    morocco: 'inspired by vibrant naive art; expressive brush strokes and rhythmic geometric symbols',
    peru: 'inspired by mythic surrealism; soft glowing figures and ancient Andean textile textures',
    thailand: 'inspired by ornate mural paintings; delicate gold-leaf outlines and ethereal scenes',
    ukraine: 'inspired by fantastical folk art; bold symmetrical patterns and vibrant floral motifs',
    finland: 'inspired by National Romanticism and ink sketches',
    bulgaria: 'inspired by vibrant portraits; high-saturation gold-leaf outlines and rhythmic embroidery patterns',
    netherlands: 'inspired by Dutch Golden Age and whimsical windmills; soft oil-paint textures',
    turkey: 'inspired by Ottoman miniatures and vibrant Iznik tile patterns; rich pigments',
    vietnam: 'inspired by traditional silk paintings; soft atmospheric washes and delicate ink lines',
    israel: 'inspired by modern Mediterranean sketches and desert hues; textured sandstone feel',
    poland: 'inspired by vibrant paper-cut art (Wycinanki); bold colors and sharp symmetrical forms',
    indonesia: 'inspired by Wayang Kulit silhouettes and Batik patterns; intricate shadow textures',
    russia: 'inspired by Khokhloma and Palekh lacquer art; deep blacks and vibrant reds/golds',
    sweden: 'inspired by Dala horse motifs and clean Scandinavian lines; folk-art textures',
    denmark: 'inspired by H.C. Andersen silhouettes and minimalist storybook charm',
    norway: 'inspired by Rosemaling patterns and glacial watercolor textures',
    argentina: 'inspired by fileteado porteño; elaborate curves and vibrant highlights',
    switzerland: 'inspired by paper-cutting (Scherenschnitte) and crisp alpine sketches',
    south_africa: 'inspired by Ndebele geometric patterns and vibrant contemporary African art',
    singapore: 'inspired by Peranakan porcelain patterns and clean modern outlines',
    romania: 'inspired by traditional embroidery patterns and dark woodland folklore textures',
    hungary: 'inspired by Kalocsa floral motifs and vibrant hand-painted aesthetics',
    czech_republic: 'inspired by traditional marionette textures and Bohemian glass clarity',
    philippines: 'inspired by vibrant fiesta colors and traditional basket-weaving textures',
    malaysia: 'inspired by Wayang and Batik fusion; intricate organic patterns',
    chile: 'inspired by Andean muralism and deep volcanic earth tones',
    new_zealand: 'inspired by Māori carving patterns and lush fern-green watercolor',
    colombia: 'inspired by Pre-Columbian gold textures and vibrant tropical folk art',
    custom: 'traditional hand-painted folk art style specific to this region',
};


const THEME_TRANSLATIONS = {
    theme_global_1: "The Whispering Woods", theme_global_2: "The Starry Night Journey", theme_global_3: "The Helpful Little Robot", theme_global_4: "The Dragon's Tea Party", theme_global_5: "The Underwater Kingdom", theme_global_6: "The Moon's Secret Garden", theme_global_7: "The Brave Little Seed", theme_global_8: "The Rainbow Bridge", theme_global_9: "The Cloud Castle", theme_global_10: "The Time-Traveling Clock", theme_global_11: "The Friendly Giant", theme_global_12: "The Magic Paintbrush",
    theme_australia_1: "The Koala's Eucalyptus Quest", theme_australia_2: "The Kangaroo's Big Jump", theme_australia_3: "The Great Barrier Reef Adventure", theme_australia_4: "The Outback Star Gazers", theme_australia_5: "The Platypus's Secret Pond", theme_australia_6: "The Wombat's Cozy Burrow",
    theme_brazil_1: "The Amazon Rainforest Secret", theme_brazil_2: "The Carnival of Animals", theme_brazil_3: "The Soccer Star's Dream", theme_brazil_4: "The Toucan's Colorful Song", theme_brazil_5: "The Golden Lion Tamarin's Rescue", theme_brazil_6: "The Beach of Dancing Dolphins",
    theme_bulgaria_1: "The Rose Valley Magic", theme_bulgaria_2: "The Balkan Mountain Giants", theme_bulgaria_3: "The Golden Thracian Treasure", theme_bulgaria_4: "The Kukeri's Dance", theme_bulgaria_5: "The Black Sea Mermaid", theme_bulgaria_6: "The Old Plovdiv Mystery",
    theme_canada_1: "The Northern Lights Dance", theme_canada_2: "The Maple Syrup Festival", theme_canada_3: "The Beaver's Busy Dam", theme_canada_4: "The Rocky Mountain Bear", theme_canada_5: "The Totem Pole's Story", theme_canada_6: "The Snowy Owl's Flight",
    theme_china_1: "The Great Wall Dragon", theme_china_2: "The Panda's Bamboo Forest", theme_china_3: "The Lantern Festival Glow", theme_china_4: "The Terracotta Warrior's Secret", theme_china_5: "The Silk Road Journey", theme_china_6: "The Monkey King's Mischief",
    theme_egypt_1: "The Secret of the Pyramids", theme_egypt_2: "The Nile River Cruise", theme_egypt_3: "The Sphinx's Riddle", theme_egypt_4: "The Pharaoh's Golden Mask", theme_egypt_5: "The Desert Oasis Mirage", theme_egypt_6: "The Ancient Hieroglyph Mystery",
    theme_finland_1: "The Moomin Valley Adventure", theme_finland_2: "The Santa's Workshop Secret", theme_finland_3: "The Thousand Lakes Mystery", theme_finland_4: "The Reindeer's Winter Journey", theme_finland_5: "The Aurora Borealis Magic", theme_finland_6: "The Sauna Spirit's Tale",
    theme_france_1: "The Eiffel Tower Sparkle", theme_france_2: "The Louvre Museum Mystery", theme_france_3: "The Lavender Fields of Provence", theme_france_4: "The Palace of Versailles Ball", theme_france_5: "The French Riviera Sunshine", theme_france_6: "The Mont Saint-Michel Legend",
    theme_germany_1: "The Black Forest Fairytale", theme_germany_2: "The Neuschwanstein Castle Dream", theme_germany_3: "The Cuckoo Clock's Secret", theme_germany_4: "The Rhine River Legend", theme_germany_5: "The Berlin Bear's Adventure", theme_germany_6: "The Gingerbread House Mystery",
    theme_greece_1: "The Olympus Gods' Gathering", theme_greece_2: "The Parthenon's Ancient Secret", theme_greece_3: "The Santorini Sunset Magic", theme_greece_4: "The Trojan Horse Adventure", theme_greece_5: "The Labyrinth's Minotaur", theme_greece_6: "The Aegean Sea Odyssey",
    theme_india_1: "The Taj Mahal Love Story", theme_india_2: "The Royal Bengal Tiger's Jungle", theme_india_3: "The Diwali Festival of Lights", theme_india_4: "The Holy Ganges River Journey", theme_india_5: "The Elephant's Royal Parade", theme_india_6: "The Peacock's Colorful Dance",
    theme_ireland_1: "The Leprechaun's Pot of Gold", theme_ireland_2: "The Giant's Causeway Legend", theme_ireland_3: "The Cliffs of Moher Mystery", theme_ireland_4: "The Shamrock's Lucky Charm", theme_ireland_5: "The Blarney Stone's Gift", theme_ireland_6: "The Celtic Harp's Melody",
    theme_italy_1: "The Colosseum Gladiator", theme_italy_2: "The Venice Gondola Serenade", theme_italy_3: "The Leaning Tower of Pisa", theme_italy_4: "The Tuscany Vineyard Secret", theme_italy_5: "The Pompeii Ancient Echoes", theme_italy_6: "The Amalfi Coast Sunshine",
    theme_japan_1: "The Mount Fuji Cherry Blossom", theme_japan_2: "The Samurai's Honorable Quest", theme_japan_3: "The Ninja's Stealthy Mission", theme_japan_4: "The Kyoto Temple Peace", theme_japan_5: "The Tokyo Neon Lights", theme_japan_6: "The Origami Crane's Flight",
    theme_kenya_1: "The Maasai Mara Safari", theme_kenya_2: "The Mount Kenya Peak", theme_kenya_3: "The Great Migration Adventure", theme_kenya_4: "The Swahili Coast Sunshine", theme_kenya_5: "The Baobab Tree's Wisdom", theme_kenya_6: "The Flamingo's Pink Lake",
    theme_korea_1: "The Gyeongbokgung Palace Ball", theme_korea_2: "The Jeju Island Volcanic Secret", theme_korea_3: "The Hanbok's Colorful Silk", theme_korea_4: "The N Seoul Tower View", theme_korea_5: "The Korean Folk Village Tale", theme_korea_6: "The DMZ Peace Garden",
    theme_mexico_1: "The Chichen Itza Mystery", theme_mexico_2: "The Day of the Dead Celebration", theme_mexico_3: "The Mariachi's Musical Heart", theme_mexico_4: "The Monarch Butterfly's Flight", theme_mexico_5: "The Frida Kahlo's Blue House", theme_mexico_6: "The Cancun Turquoise Waves",
    theme_morocco_1: "The Sahara Desert Camel Trek", theme_morocco_2: "The Marrakesh Souk Adventure", theme_morocco_3: "The Atlas Mountain Snow", theme_morocco_4: "The Blue City of Chefchaouen", theme_morocco_5: "The Moroccan Mint Tea Ceremony", theme_morocco_6: "The Casablanca Ocean Breeze",
    theme_nordic_1: "The Viking Longship Voyage", theme_nordic_2: "The Fjord's Deep Secret", theme_nordic_3: "The Troll's Hidden Bridge", theme_nordic_4: "The Ice Hotel's Frozen Magic", theme_nordic_5: "The Midnight Sun's Glow", theme_nordic_6: "The Polar Bear's Arctic Home",
    theme_peru_1: "The Machu Picchu Inca Trail", theme_peru_2: "The Llama's Andean Adventure", theme_peru_3: "The Nazca Lines Mystery", theme_peru_4: "The Lake Titicaca Floating Island", theme_peru_5: "The Amazon River Jungle", theme_peru_6: "The Cusco Imperial City",
    theme_portugal_1: "The Sintra Hills Fairytale", theme_portugal_2: "The Lisbon Tram 28 Journey", theme_portugal_3: "The Algarve Golden Caves", theme_portugal_4: "The Fado Singer's Soul", theme_portugal_5: "The Porto Wine Cellar Secret", theme_portugal_6: "The Madeira Flower Festival",
    theme_thailand_1: "The Grand Palace Sparkle", theme_thailand_2: "The Elephant's Sanctuary", theme_thailand_3: "The Floating Market Adventure", theme_thailand_4: "The Phi Phi Island Paradise", theme_thailand_5: "The Thai Silk Weaver's Art", theme_thailand_6: "The Chiang Mai Lantern Glow",
    theme_ukraine_1: "The Sunflower Fields of Gold", theme_ukraine_2: "The Carpathian Mountain Legend", theme_ukraine_3: "The Kyiv Golden Domes", theme_ukraine_4: "The Vyshyvanka's Pattern", theme_ukraine_5: "The Cossack's Brave Ride", theme_ukraine_6: "The Black Sea Pearl",
    theme_usa_1: "The Statue of Liberty's Torch", theme_usa_2: "The Grand Canyon Echoes", theme_usa_3: "The Hollywood Star's Dream", theme_usa_4: "The Yellowstone Geyser Blast", theme_usa_5: "The New York City Skyline", theme_usa_6: "The Route 66 Road Trip",
    theme_netherlands_1: "The Tulip Field Rainbow", theme_netherlands_2: "The Windmill's Spinning Tale", theme_netherlands_3: "The Amsterdam Canal Cruise", theme_netherlands_4: "The Delft Blue Pottery", theme_netherlands_5: "The Wooden Shoe's Dance", theme_netherlands_6: "The Cheese Market Festival",
    theme_turkey_1: "The Cappadocia Balloon Flight", theme_turkey_2: "The Hagia Sophia Mystery", theme_turkey_3: "The Grand Bazaar Treasure", theme_turkey_4: "The Pamukkale White Terraces", theme_turkey_5: "The Turkish Delight Secret", theme_turkey_6: "The Bosphorus Bridge View",
    theme_vietnam_1: "The Ha Long Bay Dragon", theme_vietnam_2: "The Hoi An Lantern Glow", theme_vietnam_3: "The Rice Terrace Stairway", theme_vietnam_4: "The Ao Dai's Elegant Silk", theme_vietnam_5: "The Mekong Delta Journey", theme_vietnam_6: "The Pho Noodle Secret",
    theme_israel_1: "The Dead Sea Floating Magic", theme_israel_2: "The Western Wall Whispers", theme_israel_3: "The Masada Desert Fortress", theme_israel_4: "The Tel Aviv Beach Fun", theme_israel_5: "The Galilee Green Hills", theme_israel_6: "The Jerusalem Old City Mystery",
    theme_poland_1: "The Wawel Dragon's Cave", theme_poland_2: "The Warsaw Mermaid's Song", theme_poland_3: "The Wieliczka Salt Mine", theme_poland_4: "The Tatra Mountain Peak", theme_poland_5: "The Baltic Sea Amber", theme_poland_6: "The Pierogi Festival Joy",
    theme_indonesia_1: "The Bali Island Paradise", theme_indonesia_2: "The Borobudur Temple Peace", theme_indonesia_3: "The Komodo Dragon's Island", theme_indonesia_4: "The Batik Pattern's Story", theme_indonesia_5: "The Mount Bromo Sunrise", theme_indonesia_6: "The Raja Ampat Coral Reef",
    theme_russia_1: "The Red Square St. Basil's", theme_russia_2: "The Lake Baikal Deep Blue", theme_russia_3: "The Matryoshka Doll's Secret", theme_russia_4: "The Trans-Siberian Journey", theme_russia_5: "The Bolshoi Ballet Dream", theme_russia_6: "The Hermitage Museum Art",
    theme_sweden_1: "The Stockholm Archipelago", theme_sweden_2: "The Dala Horse's Journey", theme_sweden_3: "The Ice Hotel's Frozen Art", theme_sweden_4: "The Northern Lights Dance", theme_sweden_5: "The Viking Runestone Mystery", theme_sweden_6: "The Fika Coffee Break",
    theme_denmark_1: "The Little Mermaid's Tale", theme_denmark_2: "The Legoland Brick World", theme_denmark_3: "The Tivoli Gardens Magic", theme_denmark_4: "The Viking Ship Museum", theme_denmark_5: "The Kronborg Castle Ghost", theme_denmark_6: "The Danish Pastry Secret",
    theme_norway_1: "The Geirangerfjord Majesty", theme_norway_2: "The Trolltunga Cliff View", theme_norway_3: "The Northern Lights Magic", theme_norway_4: "The Viking Heritage Trail", theme_norway_5: "The Lofoten Island Fishing", theme_norway_6: "The Midnight Sun's Glow",
    theme_argentina_1: "The Iguazu Falls Thunder", theme_argentina_2: "The Tango Dance Passion", theme_argentina_3: "The Patagonia Glacier Ice", theme_argentina_4: "The Gaucho's Pampas Ride", theme_argentina_5: "The Buenos Aires Color", theme_argentina_6: "The Andes Mountain Peak",
    theme_switzerland_1: "The Matterhorn Peak Dream", theme_switzerland_2: "The Swiss Chocolate Secret", theme_switzerland_3: "The Lake Geneva Fountain", theme_switzerland_4: "The Alpine Meadow Cowbell", theme_switzerland_5: "The Swiss Watch Precision", theme_switzerland_6: "The Jungfraujoch Top View",
    theme_south_africa_1: "The Table Mountain View", theme_south_africa_2: "The Kruger Park Safari", theme_south_africa_3: "The Cape of Good Hope", theme_south_africa_4: "The Zulu Culture Dance", theme_south_africa_5: "The Garden Route Drive", theme_south_africa_6: "The Diamond Mine Secret",
    theme_singapore_1: "The Marina Bay Sands Glow", theme_singapore_2: "The Gardens by the Bay", theme_singapore_3: "The Merlion's Water Spray", theme_singapore_4: "The Sentosa Island Fun", theme_singapore_5: "The Hawker Center Feast", theme_singapore_6: "The Orchid Garden Bloom",
    theme_romania_1: "The Bran Castle Legend", theme_romania_2: "The Danube Delta Nature", theme_romania_3: "The Painted Monasteries", theme_romania_4: "The Transfagarasan Road", theme_romania_5: "The Merry Cemetery Tale", theme_romania_6: "The Peles Castle Dream",
    theme_hungary_1: "The Budapest Danube View", theme_hungary_2: "The Lake Balaton Summer", theme_hungary_3: "The Thermal Bath Relax", theme_hungary_4: "The Rubik's Cube Secret", theme_hungary_5: "The Paprika Spice Trail", theme_hungary_6: "The Tokaj Wine Legend",
    theme_czech_republic_1: "The Prague Castle Magic", theme_czech_republic_2: "The Charles Bridge Statues", theme_czech_republic_3: "The Astronomical Clock", theme_czech_republic_4: "The Bohemian Glass Art", theme_czech_republic_5: "The Karlovy Vary Spa", theme_czech_republic_6: "The Moravian Wine Cellar",
    theme_philippines_1: "The Boracay White Sand", theme_philippines_2: "The Chocolate Hills", theme_philippines_3: "The Palawan Underground", theme_philippines_4: "The Jeepney Colorful Ride", theme_philippines_5: "The Mayon Volcano Cone", theme_philippines_6: "The Sinulog Festival Joy",
    theme_malaysia_1: "The Petronas Twin Towers", theme_malaysia_2: "The Batu Caves Climb", theme_malaysia_3: "The Langkawi Island Fun", theme_malaysia_4: "The Cameron Highlands Tea", theme_malaysia_5: "The Mount Kinabalu Peak", theme_malaysia_6: "The Malacca Heritage",
    theme_chile_1: "The Easter Island Statues", theme_chile_2: "The Atacama Desert Stars", theme_chile_3: "The Torres del Paine", theme_chile_4: "The Valparaiso Colors", theme_chile_5: "The Chilean Wine Valley", theme_chile_6: "The Andes Ski Adventure",
    theme_new_zealand_1: "The Hobbiton Movie Set", theme_new_zealand_2: "The Milford Sound Cruise", theme_new_zealand_3: "The Kiwi Bird's Secret", theme_new_zealand_4: "The Rotorua Geyser Glow", theme_new_zealand_5: "The Southern Alps Snow", theme_new_zealand_6: "The Maori Haka Dance",
    theme_colombia_1: "The Coffee Region Aroma", theme_colombia_2: "The Cartagena Walled City", theme_colombia_3: "The Gold Museum Treasure", theme_colombia_4: "The Amazon Jungle Secret", theme_colombia_5: "The Flower Festival Joy", theme_colombia_6: "The Salt Cathedral Deep",
    theme_custom_1: "The Secret Garden", theme_custom_2: "The Magic Mountain", theme_custom_3: "The Lost Treasure", theme_custom_4: "The Friendly Dragon", theme_custom_5: "The Space Adventure", theme_custom_6: "The Underwater World",
};

// ─── POST /api/gemini/story ───────────────────────────────────────────────────
router.post('/story', async (req, res) => {
    try {
        const config = req.body;
        const ai = getAI();
        const targetRegion = config.region === 'custom' ? config.customRegionName : config.region;
        const targetWordCount = config.storyLength * 125;

        // Resolve theme key → human-readable title
        const localThemeName = config.theme && config.theme !== 'None'
            ? (THEME_TRANSLATIONS[config.theme] || config.theme)
            : null;
        const globalThemeName = config.globalTheme && config.globalTheme !== 'None'
            ? config.globalTheme
            : null;
        const themeInstruction = [
            localThemeName ? `LOCAL THEME (cultural story arc): "${localThemeName}"` : '',
            globalThemeName ? `GLOBAL THEME (educational layer): "${globalThemeName}"` : '',
        ].filter(Boolean).join('. ');

        let languageInstruction = `Lang: ${config.language}.`;
        if (config.language === 'Portuguese (Portugal)') {
            languageInstruction += ` Use strict EUROPEAN PORTUGUESE (Portugal). Use "Tu" for second person singular. Use specific vocabulary like "autocarro" and "gelado".`;
        }

        const personalizationInstruction = `MAIN CHARACTER: ${config.childName ? `The main character's name is ${config.childName}.` : 'Relatable child hero.'} ${config.friendNames ? `FRIENDS: ${config.friendNames}.` : ''}`;
        const modeInstruction = config.storyMode === 'toddler'
            ? 'STRICT TODDLER MODE (2-3): Short clear sentences, sensory focus, melodic.'
            : 'STRICT PRESCHOOL MODE (4-6): Narrative arc, clear resolution.';
        const styleInstruction = config.rhymeMode === 'rhymes' ? 'STYLE: Simple rhymes.' : 'STYLE: Engaging prose.';
        const repeatInstruction = config.repeat
            ? (config.repeatVariation === 'remixed_story'
                ? `Generate ${config.repeatCount} episodes as REMIXES: same setting/characters, but slightly varied events.`
                : `Generate ${config.repeatCount} identical episodes.`)
            : 'Generate exactly 1 episode.';
        const meditationInstruction = config.meditationEnabled
            ? "ADDITIONAL REQUIREMENT: Add a final episode titled 'Sleepy Wind-down Meditation'. This episode must be a 20-second meditative recap (~40 words), narrated in a very slow, soothing tone, inviting the child to close their eyes and imagine the highlights of the story."
            : '';

        const promptText = `
      Author a magical story for Region: ${targetRegion}. ${themeInstruction ? themeInstruction + '.' : ''}
      ${modeInstruction} ${styleInstruction} ${repeatInstruction} ${meditationInstruction}
      NARRATION PACE: ${config.pace}. ${personalizationInstruction} ${languageInstruction}
      KEYWORDS: ${config.keywords || 'Magical.'}
      TARGET WORD COUNT: ~${targetWordCount} words per main episode.
      Define the character visually in 'main_character_description'. Return JSON.
    `;


        const result = await withRetry(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
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
                                                tone: { type: Type.STRING },
                                            },
                                            required: ['voice_gender', 'voice_style', 'pace', 'tone'],
                                        },
                                        visual_plan: {
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    scene: { type: Type.NUMBER },
                                                    caption: { type: Type.STRING },
                                                    image_prompt: { type: Type.STRING },
                                                },
                                                required: ['scene', 'caption', 'image_prompt'],
                                            },
                                        },
                                        ssml_narration: { type: Type.STRING },
                                        closing_line: { type: Type.STRING },
                                    },
                                    required: ['episode_title', 'logline', 'outline', 'audio_direction', 'visual_plan', 'ssml_narration', 'closing_line'],
                                },
                            },
                        },
                        required: ['app_title', 'story_mode', 'language', 'episodes', 'main_character_description'],
                    },
                },
            });
            return JSON.parse(response.text.trim());
        });

        res.json(result);
    } catch (err) {
        console.error('Gemini /story error:', err);
        res.status(500).json({ error: err.message || 'Story generation failed' });
    }
});

// ─── POST /api/gemini/tts ─────────────────────────────────────────────────────
router.post('/tts', async (req, res) => {
    try {
        const { text, voice, style, language, mode, pace } = req.body;
        const ai = getAI();

        // Split into ~1000 char chunks at sentence boundaries
        const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)/g) || [text];
        const chunks = [];
        let current = '';
        for (const s of sentences) {
            if ((current + s).length > 1000) {
                if (current) chunks.push(current.trim());
                current = s;
            } else { current += s; }
        }
        if (current) chunks.push(current.trim());

        const paceInstruction = pace === 'slow' ? 'Very slow and meditative.' : 'Calm and slow rhythm.';
        const results = [];

        for (const chunk of chunks) {
            const prompt = `Narrate for a children's story (${mode}) in ${language}. ${paceInstruction} Style: ${style}. Voice: ${voice}. Text: ${chunk}`;
            const chunkData = await withRetry(async () => {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-preview-tts',
                    contents: [{ parts: [{ text: prompt }] }],
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
                    },
                });
                return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
            });
            if (chunkData) results.push(chunkData);
        }

        // Decode all base64 chunks, concatenate raw bytes, re-encode
        const decoded = results.map(b64 => {
            const bin = Buffer.from(b64, 'base64');
            return bin;
        });
        const combined = Buffer.concat(decoded);
        res.json({ audio: combined.toString('base64') });
    } catch (err) {
        console.error('Gemini /tts error:', err);
        res.status(500).json({ error: err.message || 'TTS generation failed' });
    }
});

// ─── POST /api/gemini/image ───────────────────────────────────────────────────
router.post('/image', async (req, res) => {
    try {
        const { prompt, mode, region, charDesc } = req.body;
        const ai = getAI();
        const regionStyle = REGION_ARTIST_STYLES[region] || REGION_ARTIST_STYLES.global;
        const finalPrompt = `Children's storybook illustration, ${regionStyle}. Character: ${charDesc}. Scene: ${prompt}. Mode: ${mode}. Safe for kids.`;

        const result = await withRetry(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: finalPrompt }] },
                config: { imageConfig: { aspectRatio: '16:9' } },
            });
            const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (!imagePart?.inlineData?.data) {
                throw new Error('No image data returned by model — will retry');
            }
            return `data:image/png;base64,${imagePart.inlineData.data}`;
        }, 5, 1000); // up to 5 retries, starting at 1s delay

        res.json({ imageUrl: result });
    } catch (err) {
        console.error('Gemini /image error:', err);
        res.status(500).json({ error: err.message || 'Image generation failed' });
    }
});


// ─── POST /api/gemini/soundscape ──────────────────────────────────────────────
router.post('/soundscape', async (req, res) => {
    try {
        const { soundscape } = req.body;
        const ai = getAI();
        const prompt = `Create a 30-second continuous ambient soundscape of: ${soundscape}. Only environmental/nature sounds, no voice narration, no music melody.`;

        const result = await withRetry(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                },
            });
            const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!audioData) {
                throw new Error('No audio data returned by soundscape model — will retry');
            }
            return audioData;
        }, 5, 1500);

        res.json({ audio: result });
    } catch (err) {
        console.error('Gemini /soundscape error:', err);
        res.status(500).json({ error: err.message || 'Soundscape generation failed' });
    }
});


// ─── POST /api/gemini/voice ───────────────────────────────────────────────────
router.post('/voice', async (req, res) => {
    try {
        const { base64Audio } = req.body;
        const ai = getAI();
        const prompt = `Match this parent's voice tone with one of these prebuilt voice signatures: 'Kore' (Warm), 'Puck' (Playful), 'Fenrir' (Deep), 'Charon' (Senior), 'Zephyr' (Soft). Describe the personality. Return as JSON.`;

        const result = await withRetry(async () => {
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
                            personalityDesc: { type: Type.STRING },
                        },
                        required: ['matchedVoice', 'personalityDesc'],
                    },
                },
            });
            return JSON.parse(response.text.trim());
        });

        res.json(result);
    } catch (err) {
        console.error('Gemini /voice error:', err);
        res.status(500).json({ error: err.message || 'Voice analysis failed' });
    }
});

export default router;
