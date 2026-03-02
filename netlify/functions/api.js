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

// ─── Resend SDK ───────────────────────────────────────────────────────────────
import { Resend } from 'resend';

function getResend() {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY not set');
    return new Resend(key);
}

const FROM = 'Storia <no-reply@contact.storia.land>';
const LOGO = 'https://resend-attachments.s3.amazonaws.com/69a4bd4a-85b6-46a5-aff7-1e068f2950ab';
const AVATAR = 'https://resend-attachments.s3.amazonaws.com/e4d6bbfb-36c1-41f3-8f22-5c6bb3f50567';

/**
 * Shared branded email using Laura's template layout.
 * @param {string} preview  - Pre-header preview text
 * @param {string} greeting - Text after "Hi <email>,"
 * @param {string} body     - Main body HTML (paragraphs, etc.)
 * @param {string|null} ctaUrl   - CTA button URL (or null to omit)
 * @param {string|null} ctaLabel - CTA button label
 */
function brandedHtml(to, preview, greeting, body, ctaUrl = null, ctaLabel = null) {
    const cta = ctaUrl ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:20px;padding:14px 28px;background:#4f46e5;color:#fff;font-weight:900;text-decoration:none;border-radius:14px;font-size:14px">${ctaLabel} →</a>` : '';
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="width=device-width" name="viewport" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <body>
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">${preview}</div>
    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
      <tbody><tr><td>
        <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
          style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto',sans-serif;font-size:1.0769em;min-height:100%;line-height:155%">
          <tbody><tr><td>
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
              style="max-width:600px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto',sans-serif">
              <tbody><tr><td>
                <img alt="It's Storia time logo" src="${LOGO}" style="display:block;outline:none;border:none;text-decoration:none;max-width:100%;border-radius:8px" width="100%" />
                <p style="margin:0;padding:0.5em 0">Hi ${to},</p>
                <p style="margin:0;padding:0.5em 0">${greeting}</p>
                ${body}
                ${cta}
                <p style="margin:0;padding:1em 0 0.5em 0">Warmly ✨,</p>
                <p style="margin:0;padding:0.5em 0"><strong>Laura Cortes</strong>, Founder, Storia</p>
                <img alt="Laura Cortes, Founder of Storia" src="${AVATAR}" style="display:block;outline:none;border:none;text-decoration:none;max-width:100%;border-radius:8px;margin-top:8px" width="300" />
                <hr style="width:100%;border:none;border-top:2px solid #eaeaea;margin:1em 0" />
                <p style="margin:0;padding:0.5em 0"><strong>Why Storia?</strong></p>
                <ul style="padding-left:1.1em;padding-bottom:1em">
                  <li style="margin:0.3em 0 0.3em 1em"><strong>Predictable Routines</strong>: Reducing anxiety through structured repetition.</li>
                  <li style="margin:0.3em 0 0.3em 1em"><strong>Audio-First</strong>: Aligning with pediatric best practices for sleep and regulation.</li>
                  <li style="margin:0.3em 0 0.3em 1em"><strong>Parent-Governed</strong>: You stay in control with parent-governed safety and restraint.</li>
                </ul>
              </td></tr></tbody>
            </table>
          </td></tr></tbody>
        </table>
      </td></tr></tbody>
    </table>
  </body>
</html>`;
}

async function sendBrandedEmail(to, subject, preview, greeting, body, ctaUrl = null, ctaLabel = null) {
    const { error } = await getResend().emails.send({
        from: FROM, to, subject,
        html: brandedHtml(to, preview, greeting, body, ctaUrl, ctaLabel),
    });
    if (error) { console.error('❌ Email error:', error.message); throw new Error(error.message); }
    console.log('✅ Email sent to', to, '—', subject);
}

// Legacy passthrough (used by a few existing callers)
async function sendEmail(to, subject, html, replyTo) {
    const { error } = await getResend().emails.send({
        from: FROM, to, subject, html,
        ...(replyTo ? { reply_to: replyTo } : {}),
    });
    if (error) { console.error('Email send error:', error.message); throw new Error(error.message); }
    console.log('✅ Email sent to', to);
}

async function sendVerificationEmail(to, verifyUrl) {
    await sendBrandedEmail(
        to,
        'Confirm your email — Storia ✨',
        "Confirm your email to start your family's calm-first ritual with Storia©",
        'We are so happy you\'re here.',
        `<p style="margin:0;padding:0.5em 0">At <strong>Storia©</strong>, we believe that while content might entertain, it is the <strong>ritual</strong> that truly regulates. We know how much heart you put into your family's "settling-down" moments—whether it's the pre-sleep wind down, decompressing after school, or finding calm during a long car ride.</p>
         <p style="margin:0;padding:0.5em 0">Our goal is to help your family regulate emotions through structured, repeatable storytelling. To start creating your first daily ritual, please confirm your email address by clicking the link below:</p>
         <p style="margin:0;padding:0.5em 0"><a href="${verifyUrl}" style="color:#4f46e5;text-decoration:underline;">${verifyUrl}</a></p>
         <p style="margin:0;padding:0.5em 0">By joining us, you're choosing a "calm-first" approach to technology. We've built Storia to be a safe, low-stimulation environment—focused on predictable routines that reduce anxiety and help your little ones feel secure.</p>
         <p style="margin:0;padding:0.5em 0">It's <strong>Storia</strong> time. We can't wait to be a part of your family's daily rhythm.</p>`,
        null, null
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
            // Never retry permanent errors or JSON parse failures
            const isPermError =
                msg.includes('API_KEY') || msg.includes('not configured') ||
                msg.includes('PERMISSION_DENIED') || msg.includes('invalid_argument') ||
                err instanceof SyntaxError || msg.includes('Unexpected token');
            if (!isPermError && i < maxRetries - 1) {
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

// ─── App ────────────────────────────────────────────────────────────────────
const app = express();

app.use(cors({
    origin: (origin, cb) => {
        if (
            !origin ||
            /\.netlify\.app$/.test(origin) ||
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
            /^https?:\/\/(www\.)?storia\.land$/.test(origin)
        ) {
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

// ─── Resend diagnostics ───────────────────────────────────────────────────────
app.get('/api/test-email', async (_req, res) => {
    try {
        const { data, error } = await getResend().emails.send({
            from: FROM, to: 'info@storia.land',
            subject: 'Storia email test',
            html: '<p>Email delivery test — if you see this, Resend is connected ✅</p>',
        });
        if (error) return res.json({ ok: false, error: error.message });
        res.json({ ok: true, id: data?.id });
    } catch (err) {
        res.json({ ok: false, error: err.message });
    }
});

app.get('/api/test-template', async (_req, res) => {
    try {
        const { data, error } = await getResend().emails.send({
            from: FROM, to: 'info@storia.land',
            template_alias: 'email-confirmation',
            variables: { confirmation_link: 'https://storia.land/verify?token=test123', email: 'info@storia.land' },
        });
        if (error) return res.json({ ok: false, error: error.message });
        res.json({ ok: true, id: data?.id });
    } catch (err) {
        res.json({ ok: false, error: err.message });
    }
});

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

        // Generate verification token and store it
        const verifyToken = crypto.randomUUID();
        await sb.from('user_stats').update({ email_verify_token: verifyToken }).eq('user_id', data.user.id);

        const verifyUrl = `https://storia.land/verify?token=${verifyToken}`;

        // Welcome + Verify email (non-blocking)
        sendVerificationEmail(email.toLowerCase(), verifyUrl)
            .catch(e => console.warn('Welcome email failed (non-fatal):', e.message));

        res.status(201).json({ token: signIn.session.access_token, refreshToken: signIn.session.refresh_token, user: { id: data.user.id, email: data.user.email } });
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
        // Include email_verified in response
        const { data: stats } = await getSupabase().from('user_stats').select('email_verified').eq('user_id', data.user.id).single();
        res.json({ token: data.session.access_token, refreshToken: data.session.refresh_token, user: { id: data.user.id, email: data.user.email, emailVerified: stats?.email_verified ?? false } });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/refresh — exchange refresh token for a new access token
app.post('/api/auth/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
    try {
        const { data, error } = await getSupabase().auth.refreshSession({ refresh_token: refreshToken });
        if (error || !data.session) return res.status(401).json({ error: 'Refresh failed — please log in again' });
        res.json({ token: data.session.access_token, refreshToken: data.session.refresh_token });
    } catch (err) {
        res.status(500).json({ error: 'Refresh failed' });
    }
});

// POST /api/auth/oauth-init — called after OAuth redirect to bootstrap user_stats
app.post('/api/auth/oauth-init', async (req, res) => {
    const token = (req.headers['authorization'] || '').split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token required' });
    try {
        const sb = getSupabase();
        const { data, error } = await sb.auth.getUser(token);
        if (error || !data?.user) return res.status(403).json({ error: 'Invalid token' });

        const userId = data.user.id;
        const email = data.user.email;

        // Check if user_stats already exists
        const { data: existing } = await sb.from('user_stats').select('user_id, plan').eq('user_id', userId).single();

        if (!existing) {
            // New OAuth user — bootstrap their account
            await sb.from('user_stats').insert({
                user_id: userId, plan: 'free', monthly_used: 0, monthly_limit: 5,
                bundles_remaining: 0, total_generated: 0, email_verified: true,
                next_reset_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()
            });
            // Send a welcome email (non-blocking)
            sendBrandedEmail(
                email,
                'Welcome to Storia ✨',
                'Your Storia account is ready.',
                'Welcome to the family 🌙',
                `<p style="margin:0;padding:0.5em 0">We're so happy you joined Storia! Your account is all set — start generating a magical bedtime story for your little one right now.</p>
                 <p style="margin:0;padding:0.5em 0">Every story is crafted just for your child — personalised with their name, your language, and the themes they love most.</p>`,
                'Start Creating Stories ✨', 'https://storia.land'
            ).catch(e => console.warn('OAuth welcome email failed (non-fatal):', e.message));
            console.log(`🎉 New OAuth user bootstrapped: ${email}`);
        }

        res.json({
            user: { id: userId, email, emailVerified: true },
            plan: existing?.plan ?? 'free'
        });
    } catch (err) {
        console.error('oauth-init error:', err.message);
        res.status(500).json({ error: 'OAuth init failed' });
    }
});


// GET /api/auth/verify-email?token= — one-click email verification
app.get('/api/auth/verify-email', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Verification token required' });
    try {
        const sb = getSupabase();
        const { data, error } = await sb.from('user_stats')
            .update({ email_verified: true, email_verify_token: null })
            .eq('email_verify_token', token)
            .select('user_id').single();
        if (error || !data) return res.status(400).json({ error: 'Invalid or expired verification link' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

// POST /api/auth/resend-verification — generate new token and re-send verification email
app.post('/api/auth/resend-verification', authenticateToken, async (req, res) => {
    try {
        const sb = getSupabase();
        // Check if already verified
        const { data } = await sb.from('user_stats').select('email_verified').eq('user_id', req.user.id).single();
        if (data?.email_verified) return res.json({ success: true, alreadyVerified: true });

        const newToken = crypto.randomUUID();
        await sb.from('user_stats').update({ email_verify_token: newToken }).eq('user_id', req.user.id);

        const verifyUrl = `https://storia.land/verify?token=${newToken}`;

        await sendVerificationEmail(req.user.email, verifyUrl);

        res.json({ success: true });
    } catch (err) {
        console.error('Resend verification error:', err.message);
        res.status(500).json({ error: 'Failed to resend verification email' });
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
        const userEmail = req.user.email;

        await sb.from('stories').delete().eq('user_id', req.user.id);
        await sb.from('user_stats').delete().eq('user_id', req.user.id);
        const { error } = await sb.auth.admin.deleteUser(req.user.id);
        if (error) throw error;

        // Await email BEFORE responding — serverless functions terminate on res.json()
        try {
            await sendBrandedEmail(
                userEmail,
                'Your Storia account has been deleted',
                'We\'re sad to see you go — your account has been removed.',
                'We\'re sorry to see you go.',
                `<p style="margin:0;padding:0.5em 0">Your Storia account and all associated stories have been permanently deleted as requested. You won't receive any further emails from us.</p>
                 <p style="margin:0;padding:0.5em 0">If this was a mistake, or if you change your mind in the future, you're always welcome back. Simply create a new account at <a href="https://storia.land" style="color:#4f46e5">storia.land</a> whenever you're ready.</p>
                 <p style="margin:0;padding:0.5em 0">Thank you for being part of the Storia family. We hope we helped create some peaceful moments for your little ones. 💙</p>`,
                null, null
            );
        } catch (emailErr) {
            console.warn('Account deletion email failed (non-fatal):', emailErr.message);
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// ─── Stories routes ───────────────────────────────────────────────────────────
app.get('/api/stories', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await getSupabase().from('stories')
            .select('id, data, rating, is_public, created_at').eq('user_id', req.user.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data.map(s => ({ ...s.data, id: s.id, isSaved: true, rating: s.rating ?? undefined })));
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

// PUT /api/stories/:id/rating — save a 0-5 star rating
app.put('/api/stories/:id/rating', authenticateToken, async (req, res) => {
    const { rating } = req.body;
    if (rating === undefined || rating < 0 || rating > 5) return res.status(400).json({ error: 'Rating must be 0-5' });
    try {
        const { error } = await getSupabase().from('stories')
            .update({ rating })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);
        if (error) throw error;
        res.json({ success: true, rating });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save rating' });
    }
});

// ─── Stats routes ─────────────────────────────────────────────────────────────
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const sb = getSupabase();
        const { data, error } = await sb.from('user_stats')
            .select('*').eq('user_id', req.user.id).single();
        if (error) throw error;

        let plan = data.plan;
        let monthlyLimit = data.monthly_limit;

        // ── Stripe cross-check (bidirectional) ───────────────────────────────
        let subscriptionStatus = data.subscription_status || null;
        let subscriptionEndsAt = data.subscription_ends_at || null;
        try {
            const stripe = getStripe();
            const customers = await stripe.customers.list({ email: req.user.email, limit: 1 });
            if (customers.data.length) {
                const custId = customers.data[0].id;
                const activeSubs = await stripe.subscriptions.list({ customer: custId, status: 'active', limit: 1 });

                if (activeSubs.data.length) {
                    const sub = activeSubs.data[0];
                    const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

                    if (plan !== 'plus') {
                        // Missed webhook — upgrade
                        plan = 'plus'; monthlyLimit = 20;
                        await sb.from('user_stats').update({ plan: 'plus', monthly_limit: 20 }).eq('user_id', req.user.id);
                    }

                    if (sub.cancel_at_period_end) {
                        // Scheduled to cancel — mark it
                        subscriptionStatus = 'cancelling';
                        subscriptionEndsAt = periodEnd;
                        await sb.from('user_stats').update({
                            subscription_status: 'cancelling',
                            subscription_ends_at: periodEnd,
                        }).eq('user_id', req.user.id);
                    } else if (subscriptionStatus === 'cancelling') {
                        // Was cancelling but user re-subscribed — clear it
                        subscriptionStatus = null;
                        subscriptionEndsAt = null;
                        await sb.from('user_stats').update({ subscription_status: null, subscription_ends_at: null }).eq('user_id', req.user.id);
                    }
                } else if (plan === 'plus') {
                    // Supabase says plus but no active Stripe sub — downgrade
                    plan = 'free'; monthlyLimit = 5;
                    subscriptionStatus = null; subscriptionEndsAt = null;
                    await sb.from('user_stats').update({
                        plan: 'free', monthly_limit: 5,
                        subscription_status: null, subscription_ends_at: null,
                    }).eq('user_id', req.user.id);
                    console.log(`⬇️ Downgraded user ${req.user.id} — no active Stripe sub found`);
                }
            }
        } catch (stripeErr) {
            console.warn('Stripe cross-check failed (non-fatal):', stripeErr.message);
        }
        // ─────────────────────────────────────────────────────────────────────

        res.json({
            plan, monthlyUsed: data.monthly_used, monthlyLimit,
            bundlesRemaining: data.bundles_remaining, totalGenerated: data.total_generated,
            nextResetDate: data.next_reset_date,
            subscriptionStatus, subscriptionEndsAt,
            emailVerified: data.email_verified ?? false,
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

        // ── Optional: personalise prompt from user's rated stories ────────────
        let personalizationHint = '';
        try {
            const token = (req.headers['authorization'] || '').split(' ')[1];
            if (token) {
                const { data: authData } = await getSupabase().auth.getUser(token);
                if (authData?.user?.id) {
                    const userId = authData.user.id;
                    // Fetch top-rated stories (4-5 stars), most recent 10
                    const { data: rated } = await getSupabase()
                        .from('stories')
                        .select('data, rating')
                        .eq('user_id', userId)
                        .gte('rating', 4)
                        .order('rating', { ascending: false })
                        .limit(10);

                    if (rated && rated.length > 0) {
                        // Extract keyword frequencies from loved stories
                        const kwCount = {};
                        const modeCount = {};
                        for (const row of rated) {
                            const d = row.data;
                            if (Array.isArray(d?.keywords_used)) {
                                for (const kw of d.keywords_used) {
                                    const k = kw.toLowerCase().trim();
                                    kwCount[k] = (kwCount[k] || 0) + (row.rating >= 5 ? 2 : 1);
                                }
                            }
                            if (d?.story_mode) {
                                modeCount[d.story_mode] = (modeCount[d.story_mode] || 0) + 1;
                            }
                        }
                        // Top 5 keywords
                        const topKeywords = Object.entries(kwCount)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([k]) => k);

                        if (topKeywords.length > 0) {
                            personalizationHint = `\n      PERSONALIZATION: This child has loved stories featuring: ${topKeywords.join(', ')}. Where naturally fitting, weave in similar themes, characters, or emotions — but always respect the user's chosen KEYWORDS above.`;
                        }
                        console.log(`✨ Personalizing story for user ${userId} — taste profile: ${topKeywords.join(', ')}`);
                    }
                }
            }
        } catch (pErr) {
            console.warn('Personalization fetch failed (non-fatal):', pErr.message);
        }
        // ─────────────────────────────────────────────────────────────────────

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

        const promptText = `
      Author a magical story for Region: ${targetRegion}. ${themeInstruction ? themeInstruction + '.' : ''}
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
      ${personalizationHint}
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
            const rawText = response.text
                ?? response.candidates?.[0]?.content?.parts?.[0]?.text
                ?? null;
            if (!rawText) {
                const finishReason = response.candidates?.[0]?.finishReason;
                throw new Error(`Gemini returned empty story response (finishReason: ${finishReason || 'unknown'}) — will retry`);
            }
            const parsed = JSON.parse(rawText.trim());
            if (!parsed.episodes || !Array.isArray(parsed.episodes) || parsed.episodes.length === 0) {
                throw new Error('Gemini returned story with no episodes — will retry');
            }
            return parsed;
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
            if (!p?.inlineData?.data) {
                throw new Error('No image data returned by model — will retry');
            }
            return `data:image/png;base64,${p.inlineData.data}`;
        }, 5, 1000); // up to 5 retries, starting at 1s delay
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
                contents: [{ parts: [{ text: `Create a 30-second continuous ambient soundscape of: ${soundscape}. Only environmental/nature sounds, no voice narration, no music melody.` }] }],
                config: { responseModalities: [Modality.AUDIO] },
            });
            const audioData = r.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!audioData) {
                throw new Error('No audio data returned by soundscape model — will retry');
            }
            return audioData;
        }, 5, 1500);
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

// POST /api/contact — contact form (no auth required)
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    if (message.length > 2000) {
        return res.status(400).json({ error: 'Message is too long (max 2000 characters).' });
    }

    // Email to support
    await sendEmail(
        'info@storia.land',
        `[Storia Help] ${subject || 'Contact Form'}`,
        `<div style="font-family:sans-serif;max-width:600px;background:#0a0a0a;color:#fff;padding:32px;border-radius:16px">
          <h2 style="font-size:20px;font-weight:900;margin-bottom:16px">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="color:#71717a;padding:6px 0;width:100px">Name</td><td style="color:#fff;font-weight:bold">${name}</td></tr>
            <tr><td style="color:#71717a;padding:6px 0">Email</td><td style="color:#fff;font-weight:bold">${email}</td></tr>
            <tr><td style="color:#71717a;padding:6px 0">Subject</td><td style="color:#fff;font-weight:bold">${subject || '—'}</td></tr>
          </table>
          <hr style="border-color:#27272a;margin:20px 0">
          <p style="color:#a1a1aa;font-size:14px;line-height:1.7;white-space:pre-wrap">${message}</p>
          <p style="color:#52525b;font-size:11px;margin-top:24px">Reply directly to this email to respond to ${name}.</p>
        </div>`,
        email // reply-to
    );

    // Confirmation to user
    await sendEmail(
        email,
        `We got your message, ${name} 💬`,
        `<div style="font-family:sans-serif;max-width:600px;background:#0a0a0a;color:#fff;padding:40px;border-radius:24px">
          <h1 style="font-size:24px;font-weight:900;margin-bottom:8px">We've received your message 💬</h1>
          <p style="color:#a1a1aa;font-size:15px;line-height:1.6">Thanks for reaching out, <strong style="color:#fff">${name}</strong>! We usually reply within a few hours.</p>
          <p style="color:#52525b;font-size:12px;margin-top:24px;font-style:italic">Your message: "${message.slice(0, 200)}${message.length > 200 ? '…' : ''}"</p>
          <a href="https://storia.land" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#4f46e5;color:#fff;font-weight:900;text-decoration:none;border-radius:14px;font-size:14px">Back to Storia →</a>
        </div>`
    );

    res.json({ success: true });
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

// DELETE /api/subscribe/cancel — cancel at period end (not immediately)
app.delete('/api/subscribe/cancel', authenticateToken, async (req, res) => {
    try {
        const stripe = getStripe();

        const customers = await stripe.customers.list({ email: req.user.email, limit: 1 });
        if (!customers.data.length) return res.status(404).json({ error: 'No billing account found.' });
        const customerId = customers.data[0].id;

        const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 });
        if (!subscriptions.data.length) return res.status(404).json({ error: 'No active subscription found.' });

        // Schedule cancellation at period end — user keeps Plus until then
        const updated = await stripe.subscriptions.update(subscriptions.data[0].id, {
            cancel_at_period_end: true,
        });

        const endsAt = new Date(updated.current_period_end * 1000).toISOString();

        // Mark as cancelling in Supabase (still 'plus' until webhook fires)
        const sb = getSupabase();
        await sb.from('user_stats').update({
            subscription_status: 'cancelling',
            subscription_ends_at: endsAt,
        }).eq('user_id', req.user.id);

        res.json({ success: true, endsAt });
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

                    // ── Branded subscription upgrade email ──
                    const customerEmail = session.customer_email || session.customer_details?.email;
                    if (customerEmail) {
                        sendBrandedEmail(
                            customerEmail,
                            "You're on Storia Plus 💎",
                            "Welcome to Storia Plus — your family's story time just got even better.",
                            "You're officially a Storia Plus family! 🎉",
                            `<p style="margin:0;padding:0.5em 0">You now have access to <strong>20 new stories every month</strong>, every voice, every soundscape, and every cultural region. Your children's bedtime ritual just got richer.</p>
                             <ul style="padding-left:1.1em;padding-bottom:0.5em">
                               <li style="margin:0.3em 0 0.3em 1em"><strong>20 stories per month</strong></li>
                               <li style="margin:0.3em 0 0.3em 1em">Unlimited replays</li>
                               <li style="margin:0.3em 0 0.3em 1em">All voices &amp; soundscapes</li>
                               <li style="margin:0.3em 0 0.3em 1em">Cultural localization for every region</li>
                             </ul>
                             <p style="margin:0;padding:0.5em 0">You can manage your subscription at any time from your Account page.</p>`,
                            'https://storia.land', 'Create Your First Plus Story'
                        ).catch(e => console.warn('Upgrade email failed (non-fatal):', e.message));
                    }
                }
            } catch (err) {
                console.error('Supabase update error:', err.message);
                return res.status(500).json({ error: 'Failed to process payment' });
            }
        }
    }

    // ── Subscription renewal (invoice paid) ────────────────────────────────────
    if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object;
        if (invoice.billing_reason === 'subscription_cycle') {
            const customerEmail = invoice.customer_email;
            const periodEnd = invoice.lines?.data?.[0]?.period?.end;
            const nextDate = periodEnd ? new Date(periodEnd * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'next month';
            if (customerEmail) {
                sendBrandedEmail(
                    customerEmail,
                    'Your Storia Plus subscription has renewed 💎',
                    'Your subscription renewed — 20 more stories are waiting.',
                    'Your subscription has been renewed.',
                    `<p style="margin:0;padding:0.5em 0">Your <strong>Storia Plus</strong> subscription has been successfully renewed. Your story allowance has been refreshed — 20 new stories are ready to create calm, meaningful moments for your family.</p>
                     <p style="margin:0;padding:0.5em 0">Your next renewal date is <strong>${nextDate}</strong>.</p>
                     <p style="margin:0;padding:0.5em 0">You can manage or cancel your subscription at any time from your Account page.</p>`,
                    'https://storia.land', 'Create a Story'
                ).catch(e => console.warn('Renewal email failed (non-fatal):', e.message));
            }
        }
    }

    // ── Subscription ending soon (user requested cancellation) ─────────────────
    if (event.type === 'customer.subscription.updated') {
        const sub = event.data.object;
        if (sub.cancel_at_period_end === true) {
            try {
                const stripe = getStripe();
                const customer = await stripe.customers.retrieve(sub.customer);
                const customerEmail = typeof customer === 'object' && !customer.deleted ? customer.email : null;
                const endDate = sub.current_period_end
                    ? new Date(sub.current_period_end * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'the end of your billing period';
                if (customerEmail) {
                    sendBrandedEmail(
                        customerEmail,
                        'Your Storia Plus subscription is ending 💙',
                        'Your subscription will not renew — access continues until the end of your billing period.',
                        'We received your cancellation request.',
                        `<p style="margin:0;padding:0.5em 0">Your <strong>Storia Plus</strong> subscription is scheduled to end on <strong>${endDate}</strong>. Until then, you'll still have full access to all Plus features.</p>
                         <p style="margin:0;padding:0.5em 0">If you change your mind, you can re-subscribe at any time from your Account page — your stories will always be waiting. 💙</p>
                         <p style="margin:0;padding:0.5em 0">Thank you for being part of the Storia family.</p>`,
                        'https://storia.land/account', 'Manage Subscription'
                    ).catch(e => console.warn('Cancellation email failed (non-fatal):', e.message));
                }
            } catch (e) { console.warn('Subscription.updated email error (non-fatal):', e.message); }
        }
    }

    // ── Discount / promo code expiry ──────────────────────────────────────────
    if (event.type === 'customer.discount.deleted') {
        try {
            const discount = event.data.object;
            const stripe = getStripe();
            const customer = await stripe.customers.retrieve(discount.customer);
            const customerEmail = typeof customer === 'object' && !customer.deleted ? customer.email : null;
            const couponName = discount.coupon?.name || discount.coupon?.id || 'your discount';
            if (customerEmail) {
                sendBrandedEmail(
                    customerEmail,
                    'Your Storia discount has expired',
                    'Your promotional discount has come to an end.',
                    `We wanted to let you know that <strong>${couponName}</strong> has expired.`,
                    `<p style="margin:0;padding:0.5em 0">Your subscription will now renew at the standard rate. Thank you for being an early supporter of Storia — your story time means the world to us.</p>
                     <p style="margin:0;padding:0.5em 0">If you have any questions about your billing, please reach out to us at <a href="mailto:info@storia.land" style="color:#4f46e5">info@storia.land</a> — we're happy to help.</p>`,
                    'https://storia.land', 'Continue Storytelling'
                ).catch(e => console.warn('Discount expiry email failed (non-fatal):', e.message));
            }
        } catch (e) { console.warn('Discount deleted email error (non-fatal):', e.message); }
    }

    // ── Subscription fully deleted (downgrade) ─────────────────────────────────
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        try {
            const stripe = getStripe();
            const customer = await stripe.customers.retrieve(customerId);
            const userId = customer.metadata?.user_id;
            const customerEmail = typeof customer === 'object' && !customer.deleted ? customer.email : null;
            if (userId) {
                const sb = getSupabase();
                await sb.from('user_stats').update({ plan: 'free', monthly_limit: 5 }).eq('user_id', userId);
                console.log(`User ${userId} downgraded to free (subscription cancelled)`);

                if (customerEmail) {
                    sendBrandedEmail(
                        customerEmail,
                        'Your Storia Plus subscription has ended',
                        'Your subscription has ended — your free stories are still here.',
                        'Your Storia Plus subscription has come to an end.',
                        `<p style="margin:0;padding:0.5em 0">You now have access to <strong>5 stories per month</strong> on the free plan. All your saved stories are still in your library.</p>
                         <p style="margin:0;padding:0.5em 0">We'd love to have you back whenever you're ready. Simply visit your Account page to re-subscribe.</p>`,
                        'https://storia.land', 'Re-subscribe'
                    ).catch(e => console.warn('Subscription ended email failed (non-fatal):', e.message));
                }
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
