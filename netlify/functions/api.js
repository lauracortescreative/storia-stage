// Self-contained Netlify Function — no cross-directory imports.
// All Express routes are inlined here so esbuild can bundle cleanly.
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type, Modality } from '@google/genai';

// ─── Supabase ────────────────────────────────────────────────────────────────
function getSupabase() {
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
    );
}

// ─── Auth middleware ─────────────────────────────────────────────────────────
async function authenticateToken(req, res, next) {
    const token = (req.headers['authorization'] || '').split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });
    try {
        const { data, error } = await getSupabase().auth.getUser(token);
        if (error || !data?.user) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = { id: data.user.id, email: data.user.email };
        next();
    } catch {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
}

// ─── Gemini helpers ──────────────────────────────────────────────────────────
async function withRetry(fn, maxRetries = 3, initialDelay = 2000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try { return await fn(); } catch (err) {
            lastError = err;
            const msg = err.message || String(err);
            const retry = msg.includes('500') || msg.includes('503') || msg.includes('429') ||
                msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate');
            if (retry && i < maxRetries - 1) {
                await new Promise(r => setTimeout(r, initialDelay * Math.pow(2, i)));
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}

function getAI() {
    const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not configured.');
    return new GoogleGenAI({ apiKey: key });
}

const REGION_STYLES = {
    global: 'traditional storybook style, soft charcoal and watercolor textures, visible paper grain',
    mexico: 'Alebrije-inspired colors and folk-art symbols; traditional mural textures',
    portugal: 'blue-and-white Azulejo aesthetic; sharp ink lines and glazed tile textures',
    japan: 'woodblock (Ukiyo-e) precision and soft watercolor backgrounds; authentic paper grain',
    india: 'rhythmic folk art and Madhubani paintings; earthy pigments and bold organic forms',
    nordic: 'misty folklore; graphite textures and mossy, atmospheric watercolor',
    france: 'impressionist light and whimsical sketches; delicate ink work',
    brazil: 'modernist movements; vibrant colors, organic shapes, and tropical textures',
    egypt: 'ancient mural art on papyrus; hand-drawn silhouettes and textured golden ochre',
    china: 'delicate ink wash paintings; graceful minimalist lines on rice paper',
    greece: 'ancient pottery silhouettes and Mediterranean modernism',
    australia: 'contemporary Indigenous art; rich patterns and deep ochre storytelling layers',
    kenya: 'playful folk art; high-contrast brush strokes and stylized savannah animals',
    usa: 'mid-century concept art; geometric whimsy, bold color blocks, and soft-gouache textures',
    italy: 'sepia sketches and playful traditional illustrations',
    germany: 'classic dark woodcut illustrations and expressive charcoal textures',
    canada: 'vibrant landscapes and rhythmic northern motifs',
    ireland: 'Celtic mythic art and intricate illuminated borders',
    korea: 'traditional genre paintings; natural pigments, soft ink outlines, and Hanji paper texture',
    morocco: 'vibrant naive art; expressive brush strokes and geometric symbols',
    peru: 'mythic surrealism; soft glowing figures and ancient Andean textile textures',
    thailand: 'ornate mural paintings; delicate gold-leaf outlines and ethereal scenes',
    ukraine: 'fantastical folk art; bold symmetrical patterns and vibrant floral motifs',
    custom: 'traditional hand-painted folk art style specific to this region',
};

// ─── App ────────────────────────────────────────────────────────────────────
const app = express();

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || /\.netlify\.app$/.test(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return cb(null, true);
        }
        cb(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
    res.json({ status: 'ok', service: 'storia-backend', timestamp: new Date().toISOString() })
);

// ─── Auth routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    try {
        const sb = getSupabase();
        const { data, error } = await sb.auth.admin.createUser({ email: email.toLowerCase(), password, email_confirm: true });
        if (error) {
            if (error.message.includes('already registered') || error.message.includes('already exists'))
                return res.status(409).json({ error: 'An account with this email already exists' });
            throw error;
        }
        await sb.from('user_stats').upsert({
            user_id: data.user.id, plan: 'free', monthly_used: 0, monthly_limit: 5,
            bundles_remaining: 0, total_generated: 0,
            next_reset_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()
        });
        const { data: signIn, error: signInError } = await sb.auth.signInWithPassword({ email: email.toLowerCase(), password });
        if (signInError) throw signInError;
        res.status(201).json({ token: signIn.session.access_token, user: { id: data.user.id, email: data.user.email } });
    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ error: err.message || 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    try {
        const { data, error } = await getSupabase().auth.signInWithPassword({ email: email.toLowerCase(), password });
        if (error) return res.status(401).json({ error: 'Invalid email or password' });
        res.json({ token: data.session.access_token, user: { id: data.user.id, email: data.user.email } });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.put('/api/auth/email', authenticateToken, async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    try {
        const { error } = await getSupabase().auth.admin.updateUserById(req.user.id, { email: email.toLowerCase() });
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update email' });
    }
});

app.delete('/api/auth/account', authenticateToken, async (req, res) => {
    try {
        const sb = getSupabase();
        await sb.from('stories').delete().eq('user_id', req.user.id);
        await sb.from('user_stats').delete().eq('user_id', req.user.id);
        const { error } = await sb.auth.admin.deleteUser(req.user.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// ─── Stories routes ───────────────────────────────────────────────────────────
app.get('/api/stories', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await getSupabase().from('stories')
            .select('id, data, is_public, created_at').eq('user_id', req.user.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data.map(s => ({ ...s.data, id: s.id, isSaved: true })));
    } catch (err) {
        res.status(500).json({ error: 'Failed to load stories' });
    }
});

app.post('/api/stories', authenticateToken, async (req, res) => {
    const story = req.body;
    if (!story?.id) return res.status(400).json({ error: 'Invalid story data' });
    try {
        const { error } = await getSupabase().from('stories')
            .upsert({ id: story.id, user_id: req.user.id, data: story, is_public: false });
        if (error) throw error;
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save story' });
    }
});

app.delete('/api/stories/:id', authenticateToken, async (req, res) => {
    try {
        const { error } = await getSupabase().from('stories')
            .delete().eq('id', req.params.id).eq('user_id', req.user.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete story' });
    }
});

// ─── Stats routes ─────────────────────────────────────────────────────────────
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await getSupabase().from('user_stats')
            .select('*').eq('user_id', req.user.id).single();
        if (error) throw error;
        res.json({
            plan: data.plan, monthlyUsed: data.monthly_used, monthlyLimit: data.monthly_limit,
            bundlesRemaining: data.bundles_remaining, totalGenerated: data.total_generated,
            nextResetDate: data.next_reset_date,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load stats' });
    }
});

app.put('/api/stats', authenticateToken, async (req, res) => {
    const { plan, monthlyUsed, monthlyLimit, bundlesRemaining, totalGenerated, nextResetDate } = req.body;
    try {
        const updates = {};
        if (plan !== undefined) updates.plan = plan;
        if (monthlyUsed !== undefined) updates.monthly_used = monthlyUsed;
        if (monthlyLimit !== undefined) updates.monthly_limit = monthlyLimit;
        if (bundlesRemaining !== undefined) updates.bundles_remaining = bundlesRemaining;
        if (totalGenerated !== undefined) updates.total_generated = totalGenerated;
        if (nextResetDate !== undefined) updates.next_reset_date = nextResetDate;
        const { error } = await getSupabase().from('user_stats').update(updates).eq('user_id', req.user.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update stats' });
    }
});

// ─── Public stories ───────────────────────────────────────────────────────────
app.get('/api/public-stories', async (_req, res) => {
    try {
        const { data, error } = await getSupabase().from('stories')
            .select('id, data, created_at').eq('is_public', true)
            .order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        res.json(data.map(s => ({ ...s.data, id: s.id })));
    } catch (err) {
        res.status(500).json({ error: 'Failed to load public stories' });
    }
});

// ─── Gemini routes ────────────────────────────────────────────────────────────
app.post('/api/gemini/story', async (req, res) => {
    try {
        const config = req.body;
        const ai = getAI();
        const targetRegion = config.region === 'custom' ? config.customRegionName : config.region;
        const meditationInstruction = config.meditationEnabled
            ? "ADDITIONAL REQUIREMENT: Add a final episode titled 'Sleepy Wind-down Meditation'. ~40 words, very slow and soothing."
            : '';
        const promptText = `
      Author a magical story for Region: ${targetRegion}, Theme: ${config.theme}.
      ${config.storyMode === 'toddler' ? 'STRICT TODDLER MODE (2-3): Short clear sentences, sensory focus.' : 'STRICT PRESCHOOL MODE (4-6): Narrative arc, clear resolution.'}
      STYLE: ${config.rhymeMode === 'rhymes' ? 'Simple rhymes.' : 'Engaging prose.'}
      ${config.repeat ? (config.repeatVariation === 'remixed_story' ? `Generate ${config.repeatCount} episodes as REMIXES.` : `Generate ${config.repeatCount} identical episodes.`) : 'Generate exactly 1 episode.'}
      ${meditationInstruction}
      NARRATION PACE: ${config.pace}.
      MAIN CHARACTER: ${config.childName ? `Name is ${config.childName}.` : 'Relatable child hero.'}
      ${config.friendNames ? `FRIENDS: ${config.friendNames}.` : ''}
      Lang: ${config.language}.${config.language === 'Portuguese (Portugal)' ? ' Use strict EUROPEAN PORTUGUESE.' : ''}
      KEYWORDS: ${config.keywords || 'Magical.'}
      TARGET WORD COUNT: ~${config.storyLength * 125} words per main episode.
      Define the character visually in 'main_character_description'. Return JSON.
    `;
        const result = await withRetry(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash', contents: promptText,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            app_title: { type: Type.STRING }, story_mode: { type: Type.STRING },
                            language: { type: Type.STRING }, keywords_used: { type: Type.ARRAY, items: { type: Type.STRING } },
                            main_character_description: { type: Type.STRING },
                            episodes: {
                                type: Type.ARRAY, items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        episode_title: { type: Type.STRING }, logline: { type: Type.STRING },
                                        outline: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        audio_direction: { type: Type.OBJECT, properties: { voice_gender: { type: Type.STRING }, voice_style: { type: Type.STRING }, pace: { type: Type.STRING }, tone: { type: Type.STRING } }, required: ['voice_gender', 'voice_style', 'pace', 'tone'] },
                                        visual_plan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { scene: { type: Type.NUMBER }, caption: { type: Type.STRING }, image_prompt: { type: Type.STRING } }, required: ['scene', 'caption', 'image_prompt'] } },
                                        ssml_narration: { type: Type.STRING }, closing_line: { type: Type.STRING },
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

app.post('/api/gemini/tts', async (req, res) => {
    try {
        const { text, voice, style, language, mode, pace } = req.body;
        const ai = getAI();

        // Split into larger chunks (3000 chars) — reduces API calls significantly
        const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)/g) || [text];
        const chunks = [];
        let cur = '';
        for (const s of sentences) {
            if ((cur + s).length > 3000) { if (cur) chunks.push(cur.trim()); cur = s; } else cur += s;
        }
        if (cur) chunks.push(cur.trim());

        const paceStr = pace === 'slow' ? 'Very slow and meditative.' : 'Calm and slow rhythm.';

        // Process all chunks in parallel — preserves order via index
        const b64Results = await Promise.all(chunks.map(chunk =>
            withRetry(async () => {
                const r = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-preview-tts',
                    contents: [{ parts: [{ text: `Narrate for a children's story (${mode}) in ${language}. ${paceStr} Style: ${style}. Voice: ${voice}. Text: ${chunk}` }] }],
                    config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
                });
                return r.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
            })
        ));

        const buffers = b64Results.filter(Boolean).map(b64 => Buffer.from(b64, 'base64'));
        res.json({ audio: Buffer.concat(buffers).toString('base64') });
    } catch (err) {
        res.status(500).json({ error: err.message || 'TTS failed' });
    }
});


app.post('/api/gemini/image', async (req, res) => {
    try {
        const { prompt, mode, region, charDesc } = req.body;
        const ai = getAI();
        const style = REGION_STYLES[region] || REGION_STYLES.global;
        const result = await withRetry(async () => {
            const r = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: `Children's storybook illustration, ${style}. Character: ${charDesc}. Scene: ${prompt}. Mode: ${mode}. Safe for kids.` }] },
                config: { imageConfig: { aspectRatio: '16:9' } },
            });
            const p = r.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            return p ? `data:image/png;base64,${p.inlineData.data}` : '';
        });
        res.json({ imageUrl: result });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Image generation failed' });
    }
});

app.post('/api/gemini/soundscape', async (req, res) => {
    try {
        const { soundscape } = req.body;
        const ai = getAI();
        const result = await withRetry(async () => {
            const r = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: [{ parts: [{ text: `Create a continuous ambient background loop of ${soundscape}. Environmental sounds only.` }] }],
                config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } },
            });
            return r.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
        });
        res.json({ audio: result });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Soundscape generation failed' });
    }
});

app.post('/api/gemini/voice', async (req, res) => {
    try {
        const { base64Audio } = req.body;
        const ai = getAI();
        const result = await withRetry(async () => {
            const r = await ai.models.generateContent({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                contents: { parts: [{ inlineData: { data: base64Audio, mimeType: 'audio/wav' } }, { text: `Match voice tone: 'Kore' (Warm), 'Puck' (Playful), 'Fenrir' (Deep), 'Charon' (Senior), 'Zephyr' (Soft). Return JSON.` }] },
                config: { responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 }, responseSchema: { type: Type.OBJECT, properties: { matchedVoice: { type: Type.STRING }, personalityDesc: { type: Type.STRING } }, required: ['matchedVoice', 'personalityDesc'] } },
            });
            return JSON.parse(r.text.trim());
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Voice analysis failed' });
    }
});

app.post('/api/gemini/translate', async (req, res) => {
    try {
        const { chunks, targetLang } = req.body;
        const ai = getAI();

        // Merge all incoming chunks into one flat object
        const allKeys = chunks.reduce((acc, chunk) => ({ ...acc, ...chunk }), {});
        const entries = Object.entries(allKeys);

        // Split into 8 small batches (~37 keys each) and translate in parallel
        // gemini-2.0-flash-lite is fast for simple JSON translation tasks
        const batchSize = Math.ceil(entries.length / 8);
        const batches = [];
        for (let i = 0; i < entries.length; i += batchSize) {
            batches.push(entries.slice(i, i + batchSize));
        }

        const translateBatch = (pairs) => {
            const obj = Object.fromEntries(pairs);
            return withRetry(async () => {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: `Translate the values of this JSON object into ${targetLang}. Use a warm, friendly tone for a children's app. Keep all JSON keys exactly the same. Return ONLY valid JSON, no markdown.\nJSON: ${JSON.stringify(obj)}`,
                    config: { responseMimeType: 'application/json' },
                });
                const raw = (response.text || '').trim();
                const match = raw.match(/\{[\s\S]*\}/);
                return match ? JSON.parse(match[0]) : {};
            }, 1, 500); // maxRetries=1, short delay
        };


        const results = await Promise.all(batches.map(translateBatch));
        const combined = Object.assign({}, ...results);
        res.json(combined);
    } catch (err) {
        console.error('Translation error:', err.message);
        res.status(500).json({ error: err.message || 'Translation failed' });
    }
});





// ─── Stripe subscribe routes ──────────────────────────────────────────────────
import Stripe from 'stripe';

function getStripe() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured.');
    return new Stripe(key, { apiVersion: '2024-06-20' });
}

// POST /api/subscribe/checkout — create a Stripe Checkout Session
app.post('/api/subscribe/checkout', authenticateToken, async (req, res) => {
    try {
        const { plan = 'monthly' } = req.body; // 'monthly' or 'yearly'
        const stripe = getStripe();

        const priceId = plan === 'yearly'
            ? process.env.STRIPE_YEARLY_PRICE_ID
            : process.env.STRIPE_MONTHLY_PRICE_ID;

        if (!priceId) return res.status(500).json({ error: `Stripe price ID for ${plan} plan not configured.` });

        const origin = req.headers.origin || (process.env.NETLIFY_URL ? `https://${process.env.URL}` : 'http://localhost:3000');

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            allow_promotion_codes: true,   // Enables Instagram DM promo codes at checkout
            success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/`,
            client_reference_id: req.user.id,   // used in webhook to identify user
            customer_email: req.user.email,
            metadata: { user_id: req.user.id },
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error('Stripe checkout error:', err.message);
        res.status(500).json({ error: err.message || 'Failed to create checkout session' });
    }
});

// POST /api/subscribe/topup — one-time bundle purchase
app.post('/api/subscribe/topup', authenticateToken, async (req, res) => {
    try {
        const { count } = req.body; // 5 | 15 | 30
        const BUNDLE_PRICES = { 10: 699 }; // cents — 10 stories for €6.99
        const priceInCents = BUNDLE_PRICES[count];
        if (!priceInCents) return res.status(400).json({ error: 'Invalid bundle size.' });

        const stripe = getStripe();
        const origin = req.headers.origin || (process.env.URL ? `https://${process.env.URL}` : 'http://localhost:3000');

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    unit_amount: priceInCents,
                    product_data: {
                        name: `Storia — ${count} Story Bundle`,
                        description: `${count} extra AI-generated bedtime stories added to your account.`,
                    },
                },
                quantity: 1,
            }],
            success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/`,
            client_reference_id: req.user.id,
            customer_email: req.user.email,
            metadata: { user_id: req.user.id, type: 'topup', bundle_count: String(count) },
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error('Topup checkout error:', err.message);
        res.status(500).json({ error: err.message || 'Failed to create topup session' });
    }
});

// POST /api/subscribe/portal — create a Stripe Customer Portal session
app.post('/api/subscribe/portal', authenticateToken, async (req, res) => {
    try {
        const stripe = getStripe();
        const origin = req.headers.origin || (process.env.URL ? `https://${process.env.URL}` : 'http://localhost:3000');

        // Look up existing Stripe customer by email
        const customers = await stripe.customers.list({ email: req.user.email, limit: 1 });
        if (!customers.data.length) {
            return res.status(404).json({ error: 'No billing account found. Please subscribe first.' });
        }
        const customerId = customers.data[0].id;

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${origin}/`,
        });

        res.json({ url: portalSession.url });
    } catch (err) {
        console.error('Billing portal error:', err.message);
        res.status(500).json({ error: err.message || 'Failed to open billing portal' });
    }
});

// DELETE /api/subscribe/cancel — cancel active Stripe subscription
app.delete('/api/subscribe/cancel', authenticateToken, async (req, res) => {
    try {
        const stripe = getStripe();

        // Find Stripe customer by email
        const customers = await stripe.customers.list({ email: req.user.email, limit: 1 });
        if (!customers.data.length) {
            return res.status(404).json({ error: 'No billing account found.' });
        }
        const customerId = customers.data[0].id;

        // Find active subscription
        const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 });
        if (!subscriptions.data.length) {
            return res.status(404).json({ error: 'No active subscription found.' });
        }

        // Cancel immediately
        await stripe.subscriptions.cancel(subscriptions.data[0].id);

        // Downgrade in Supabase
        const sb = getSupabase();
        await sb.from('user_stats').update({ plan: 'free', monthly_limit: 5 }).eq('user_id', req.user.id);

        res.json({ success: true });
    } catch (err) {
        console.error('Cancel subscription error:', err.message);
        res.status(500).json({ error: err.message || 'Failed to cancel subscription' });
    }
});

// POST /api/webhooks/stripe — handle Stripe events
// Must receive raw body for signature verification
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Stripe webhook signature error:', err.message);
        return res.status(400).json({ error: `Webhook signature invalid: ${err.message}` });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.user_id;

        if (userId) {
            try {
                const sb = getSupabase();

                if (session.metadata?.type === 'topup') {
                    // Bundle top-up: increment bundles_remaining
                    const bundleCount = parseInt(session.metadata.bundle_count || '0', 10);
                    const { data: current, error: fetchErr } = await sb
                        .from('user_stats').select('bundles_remaining').eq('user_id', userId).single();
                    if (fetchErr) throw fetchErr;
                    const { error } = await sb.from('user_stats').update({
                        bundles_remaining: (current.bundles_remaining || 0) + bundleCount,
                    }).eq('user_id', userId);
                    if (error) throw error;
                    console.log(`✅ User ${userId} topped up with ${bundleCount} stories`);
                } else {
                    // Subscription upgrade
                    const { error } = await sb.from('user_stats').update({
                        plan: 'plus',
                        monthly_limit: 20,
                    }).eq('user_id', userId);
                    if (error) throw error;
                    console.log(`✅ User ${userId} upgraded to Plus via Stripe webhook`);
                }
            } catch (err) {
                console.error('Supabase update error:', err.message);
                return res.status(500).json({ error: 'Failed to process payment' });
            }
        }
    }

    if (event.type === 'customer.subscription.deleted') {
        // Downgrade back to free if they cancel
        const subscription = event.data.object;
        const customerId = subscription.customer;

        try {
            const stripe = getStripe();
            const customer = await stripe.customers.retrieve(customerId);
            const userId = customer.metadata?.user_id;
            if (userId) {
                const sb = getSupabase();
                await sb.from('user_stats').update({ plan: 'free', monthly_limit: 5 }).eq('user_id', userId);
                console.log(`User ${userId} downgraded to free (subscription cancelled)`);
            }
        } catch (err) {
            console.error('Downgrade error:', err.message);
        }
    }

    res.json({ received: true });
});

// ─── Error handler ────────────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ─── Netlify Function handler ─────────────────────────────────────────────────
const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
    // Netlify strips the function path prefix; restore /api prefix for Express routing
    if (event.path && !event.path.startsWith('/api')) {
        event.path = '/api' + event.path;
        if (event.rawPath) event.rawPath = '/api' + event.rawPath;
    }
    return serverlessHandler(event, context);
};
