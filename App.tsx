
import React, { useState, useRef, useEffect } from 'react';

import { StoryConfig, StoryResult, Episode, VisualScene, Region, UITranslations, UserStats } from './types';
import Form, { RAW_REGION_DATA, SUPPORTED_LANGUAGES } from './components/Form';
import StorySeedPage from './components/StorySeedPage';
import RefinementPage from './components/RefinementPage';
import StoryPlayer from './components/StoryPlayer';
import LandingPage from './components/LandingPage';
import SettingsPage from './components/SettingsPage';
import SubscribeSuccessPage from './components/SubscribeSuccessPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import AboutPage from './components/AboutPage';
import Paywall from './components/Paywall';
import LibraryPage from './components/LibraryPage';
import PublicLibraryPage from './components/PublicLibraryPage';
import ColoringBookPage from './components/ColoringBookPage';
import AccountPage from './components/AccountPage';
import TesterDisclaimer from './components/TesterDisclaimer';
import { StoryService } from './services/gemini';
import { decodeAudio } from './services/audio';
import { checkSafety } from './services/moderation';
import { THEME_TRANSLATIONS } from './src/themes';
import {
  apiRegister, apiLogin, apiDeleteAccount, apiUpdateEmail,
  apiGetStories, apiSaveStory,
  apiGetStats, apiUpdateStats,
  apiCreateCheckoutSession, apiCreateTopupSession,
  getToken, clearToken
} from './services/api';

const ALL_TRANSLATIONS: Record<string, Partial<UITranslations>> = {
  'English': {
    ...THEME_TRANSLATIONS,
    about_link: "Our Story",
    about_title: "Storia started at home",
    about_content: "My child takes a long time to fall asleep. Stories were the only thing that helped him calm his body and mind enough to rest. We told them every night. Long ones. Short ones. Made-up ones. The same ones, over and over. When he woke up in the middle of the night, he asked for more.\n\nAt some point, exhaustion turned into curiosity.\n\nI’m a creative director working at the intersection of storytelling, technology, and emerging tools. I spend my life designing experiences. Yet the most meaningful one I was part of was happening quietly, every night, in the dark, with a small human who needed reassurance more than entertainment.\n\nThat’s where Storia began.\n\nI wanted stories that were calm, not overstimulating. Voices that soothed instead of performing. Visuals that felt gentle, not addictive. Stories that reflected different cultures, places, and ways of living, so curiosity could grow alongside comfort.\n\nMost children’s content today is optimized for attention. Faster, brighter, louder. Storia is intentionally the opposite.\n\nIt’s designed for bedtime and quiet moments. For winding down. For listening instead of watching. For helping kids feel safe, grounded, and open to the world beyond their own.\n\nAs both a parent and a creator, I’m increasingly aware of how personalized technology can narrow our perspectives. Storia explores personalization with a different goal: not to trap children in familiar loops, but to gently introduce them to other cultures, languages, and traditions, one story at a time.\n\nStoria wasn’t built to scale attention.\n\nIt was built to create calm.\n\nIf it helps one small human fall asleep feeling safe, it’s done its job.\n\nIf it helps more families do the same, even better.",
    about_signature: "— Laura Cortes, creative director, wife, mother of a toddler",
    error_safety_title: "Oops! Let's keep it magical",
    error_safety_desc: "Storia is a safe space for children. Some of the words used don't quite fit our kindness guidelines. Could you try using different, friendlier keywords?",
    error_safety_button: "Got it, I'll fix it",
    landing_subtitle: "Storia is a calm, modern technology-powered storytelling app designed to help children 2-5 wind down, self-regulate, and explore stories from around the world.",
    landing_slogan: "It's Storia time.",
    landing_button: "Begin the Magic",
    landing_carousel_title: "Library of Dreams",
    landing_carousel_subtitle: "Peek inside our latest magical collections",
    story_nico_title: "Nico & the Dino-Car Race",
    story_nico_region: "Portugal 🇵🇹",
    story_nico_desc: "Nico and his loyal dog Taco discover a hidden track in the Sintra hills where mechanical dinosaurs race vintage cars! A high-speed, roaring adventure for little explorers.",
    story_nico_tags: "Dinosaurs, Cars, Adventure",
    story_nico_sample_text: "Nico and his loyal dog Taco were ready. In the Sintra hills, amid the mist, mechanical dinosaurs roared, ready for the most fantastic race ever!",
    story_lily_title: "Lily's Unicorn Ballet",
    story_lily_region: "Bulgaria 🇧🇬",
    story_lily_desc: "In the heart of the Balkan mountains, Lily performs a magical dance that calls the crystal unicorns to a starlight stage. A gentle, shimmering tale of grace and magic.",
    story_lily_tags: "Ballet, Unicorns, Magic",
    story_lily_sample_text: "Lily twirled under the mantle of stars. The Balkan mountains shimmered as the crystal unicorns approached for the most magical ball in the world.",
    story_day_title: "Day's Song of the Palace",
    story_day_region: "India 🇮🇳",
    story_day_desc: "Every note Day sings turns into a golden bird. Join him as he heals the Maharaja's silent garden with the power of his voice. A musical journey through ancient palace walls.",
    story_day_tags: "Music, Culture, Palace",
    story_day_sample_text: "Every note Day sang was pure gold. In the Maharaja's silent garden, birds of light began to dance to the melody of his magical voice.",
    landing_testimonials_title: "Trusted by Parents Worldwide",
    testimonial_1_names: "Bilyana & Fred",
    testimonial_1_loc: "Bulgaria 🇧🇬",
    testimonial_1_quote: "Our daughter Lily is obsessed with the crystal unicorns. The Balkan art style is so beautiful and authentic; it's like a piece of home every night.",
    testimonial_2_names: "Kristen & Tarik",
    testimonial_2_loc: "USA 🇺🇸",
    testimonial_2_quote: "The whisper mode is truly magical. It's the only thing that helps Leo settle down after a busy day. He's usually asleep before the story ends!",
    testimonial_3_names: "Catarina & Fran",
    testimonial_3_loc: "Portugal 🇵🇹",
    testimonial_3_quote: "Finalmente, uma aplicação que acerta no Português Europeu! A história de Sintra é uma das favoritas da família, e as ilustrações são simplesmente de classe mundial.",
    feat1_title: "Modern Technology Voice Lab",
    feat1_desc: "Match your voice with a modern technology profile to simulate cloning for your children's stories.",
    feat2_title: "Magical Visuals",
    feat2_desc: "Switch between immersive storybook illustrations or a gentle dark mode for sleeping.",
    feat3_title: "Remixed Repeats",
    feat3_desc: "Turn on repeats to hear the same story or a magical variation for longer sessions.",
    landing_how_title: "How your stories are created",
    landing_how_step1_title: "Seeds of Imagination",
    landing_how_step1_desc: "You provide a few keywords and select a cultural region. This forms the heartbeat of the tale.",
    landing_how_step2_title: "Modern Technology Alchemy",
    landing_how_step2_desc: "Gemini crafts a safe, mode-specific narrative and matches it with a soothing modern technology voice signature.",
    landing_how_step3_title: "Wind-down-First UI",
    landing_how_step3_desc: "Immersive hand-drawn visuals appear alongside the audio, or vanish in Dark Mode for deep rest.",
    landing_features_title: "Everything built for little ears",
    landing_feat_voice_title: "Voice Matching",
    landing_feat_voice_desc: "Analyzes your tone to find a professional voice that sounds like you.",
    landing_feat_culture_title: "Cultural Roots",
    landing_feat_culture_desc: "Authentic regional tales intended to open young minds to the beauty of other cultures and drive deep empathy.",
    landing_feat_sleep_title: "Wind-down-First UI",
    landing_feat_sleep_desc: "Gentle lighting and Dark Mode ensure the screen never keeps them awake.",
    landing_feat_modes_title: "Age-Specific logic",
    landing_feat_modes_desc: "Gentle 2-3 mode focuses on sensory comfort; 4-5 mode drives curiosity.",
    landing_feat_lang_title: "Selected Languages",
    landing_feat_lang_desc: "High-quality support for English, French, Spanish, and Portuguese.",
    landing_feat_replays_title: "Unlimited Replays",
    landing_feat_replays_desc: "Save the stories your child loves most to your permanent family library.",
    landing_feat_whisper_title: "Whisper Narration",
    landing_feat_whisper_desc: "A specialized whisper mode for a softer, more intimate transition into deep sleep.",
    landing_feat_styles_title: "Master Artist Styles",
    landing_feat_styles_desc: "Every scene is illustrated in authentic regional styles, from Japanese woodblocks to Mexican folk art.",
    landing_feat_rhymes_title: "Rhyming Mode",
    landing_feat_rhymes_desc: "Transform any story into a catchy, rhyming poem for a more musical bedtime experience.",
    landing_feat_pace_title: "Pace Control",
    landing_feat_pace_desc: "Choose between slow or medium narration speeds to match your child's winding-down rhythm.",
    landing_feat_moderation_title: "Magic with Guardrails",
    landing_feat_moderation_desc: "Storia uses advanced safety filters to ensure every story is kind, age-appropriate, and free from any scary or unsuitable themes.",
    landing_feat_pdf_title: "Coloring Book Export",
    landing_feat_pdf_desc: "Turn your digital story into a physical memory. Download a custom coloring book PDF featuring the scenes from your unique tale.",
    landing_cta_title: "Ready for a magical night's rest?",
    landing_cta_subtitle: "Start with 5 free stories • Then only",

    // Refinement Page
    refine_title: "Fine-tune the Magic",
    refine_subtitle: "Choose how the story will be experienced tonight. Every setting is designed for calm.",
    refine_visual_style: "Visual Style",
    refine_sleepy_vis: "Sleepy Visualization",
    refine_times: "times",
    refine_button: "Begin the Magic ✨",
    refine_back: "Wait, go back",

    // Wizard Steps
    step_1_label: "Step 1 of 3: Personalization",
    step_2_label: "Step 2 of 3: The Seed",
    step_3_label: "Step 3 of 3: Refinement",
    pers_header: "Your Storyteller",
    pers_subtitle: "Customize the voices and characters that will bring your adventure to life.",
    seed_header: "Create a New Adventure",
    seed_subtitle: "Personalize the magic with cultural themes and local languages.",

    form_header: "Create a New Adventure",
    form_subtitle: "Personalize the magic with cultural themes and local languages.",
    label_region: "Travel to",
    label_theme: "Traditional Theme",
    label_global_theme: "Global Theme",
    label_child_name: "Child's Name (optional)",
    placeholder_child_name: "e.g. Leo",
    label_friend_names: "Friends' Names (optional)",
    placeholder_friend_names: "e.g. Mia, Toby",
    label_keywords: "Story Keywords",
    placeholder_keywords: "e.g. magic forest, a sleepy panda, lost red balloon",
    label_language: "Narrator Language",
    label_mode: "Story Mode",
    label_voice: "Voice Narrator",
    label_length: "Story Duration",
    label_experience: "Screen Experience",
    label_soundscape: "Background Soundscape",
    label_pace: "Speed",
    label_rhyme_mode: "Style",
    label_sleep_fade: "Sleep Fade-out",
    label_nightly_routine: "Nightly Routine",
    label_repeats_remixes: "Repeats & Remixes",
    label_repeat_count: "Repeat Count",
    label_variation_type: "Variation Type",
    label_meditation: "Wind-down Meditation",
    desc_meditation: "Adds a 20-second meditative recap at the end to help your child drift off.",
    voice_cloned: "Parent Voice Cloned",
    voice_record: "Record 8s Sample",
    voice_stop: "Stop Recording",
    voice_matching: "Matching Voice Signature...",
    voice_success: "Success",
    voice_matched: "Matched",
    voice_lab_title: "Parent Voice Lab",
    voice_lab_subtitle: "Modern Technology Matching & Simulation",
    voice_lab_desc: "Our modern technology analyzes your unique vocal tone and matches it with a professional narrator profile that best simulates your voice.",
    button_submit: "Continue to Experience ✨",
    loading_magic: "Gathering Magic...",
    loader_subtext: "Gathering dust from the stars",
    form_free_remaining: "Free generations remaining",
    button_membership: "Join Membership",
    gt_none: "None",
    gt_animals: "Animals & Wildlife",
    gt_biology: "Our Bodies & Biology",
    gt_diversity: "Diversity & Inclusion",
    gt_food: "Food & Agriculture",
    gt_nature: "Nature & Environment",
    gt_people: "People & Community",
    gt_science: "Science & Space",
    gt_social: "Social Impact",
    gt_society: "Culture & Society",
    gt_technology: "Future Technology",
    gt_transportation: "Ways to Travel",
    gt_weather: "Weather & Climate",
    player_menu: "Story Menu",
    player_now_playing: "NOW PLAYING",
    player_episode: "Episode",
    player_painting: "Painting Magic...",
    player_voicing: "Magic is being voiced...",
    player_save_to_library: "Save to Library",
    player_saved: "Saved",
    cta_coloring_title: "Finish with some magic?",
    cta_coloring_desc: "Would you like to print a custom coloring book featuring the scenes from this story?",
    cta_coloring_button: "Print Coloring Book 🖍️",
    cta_coloring_skip: "No thanks, just close",
    library_title: "My Story Library",
    library_empty: "Your library is empty. Create a story to begin!",
    library_recent: "Session Stories (Temporary)",
    library_saved: "Permanent Library (Account)",
    library_save_cta: "Create an account to save your stories forever!",
    library_account_required: "Account required to save stories permanently.",
    library_read_script: "Read Script",
    script_title: "Story Transcript",
    button_create_account: "Create Account",
    button_download_pdf: "Download Coloring Book",
    public_library_title: "Community Gems",
    public_library_subtitle: "Explore stories shared by families worldwide",
    public_library_link: "Public Library",
    public_library_explore_cta: "Watch Now",
    coloring_book_title: "Magic Coloring Lab",
    coloring_book_subtitle: "Printable masterpieces from your favorite tales",
    coloring_book_download: "Download Coloring Book",
    account_title: "My Account",
    label_email: "Email Address",
    button_save_changes: "Save Changes",
    section_danger_zone: "Danger Zone",
    delete_account_title: "Delete Account & Data",
    delete_account_desc: "This will permanently remove your saved stories and reset your generation history. This action cannot be undone.",
    button_delete_confirm: "Delete Everything",
    delete_confirm_prompt: "Are you sure? Type DELETE to confirm.",
    account_updated: "Account details updated.",
    account_deleted: "Account and all data have been deleted.",
    setup_title: "Magical Access",
    setup_desc: "Select a paid API Key to unlock high-quality master artist illustrations.",
    setup_button: "Select API Key",
    opt_visuals: "Visuals",
    opt_dark: "Dark Mode",
    opt_minutes: "minutes",
    opt_years: "Years",
    opt_toddler: "Toddler Mode (2-3 Years)",
    opt_preschool: "Preschool Mode (4-5 Years)",
    opt_female: "Female",
    opt_male: "Male",
    opt_neutral: "Neutral",
    opt_clear: "Clear",
    opt_whisper: "Whisper",
    opt_silent: "Silent",
    opt_sounds: "Sounds",
    opt_none: "None",
    opt_slow: "Slow",
    opt_medium: "Medium",
    opt_regular: "Regular",
    opt_rhymes: "Rhymes",
    opt_on: "On",
    opt_off: "Off",
    opt_duration_short: "Short",
    opt_duration_medium: "Medium",
    opt_duration_long: "Long",
    opt_exact_repeat: "Exact Repeat",
    opt_magical_remix: "Magical Remix",
    desc_remix_magical: "Gemini will craft subtle, magical variations of the plot for each repeat.",
    desc_remix_exact: "The exact same story will play multiple times for deep comfort.",
    sound_rain: "Soft Rain",
    sound_forest: "Magic Forest",
    sound_ocean: "Calm Ocean",
    sound_wind: "Gentle Wind",
    cancel: "Cancel Magic",
    close: "Close",
    detected_label: "Detected",
    footer_region: "App Language",
    footer_for_parents: "For Parents",
    footer_created_by: "Created by Laura Cortes",
    footer_built_with: "Built with Love © 2026 Spoonful Labs",
    error_story: "The magical link failed. Please try a different theme.",
    lang_english: "English",
    lang_portuguese_brazil: "Portuguese (Brazil)",
    lang_portuguese_portugal: "Portuguese (Portugal)",
    lang_spanish: "Spanish",
    lang_french: "French",
    terms_link: "Terms & Conditions",
    terms_title: "Terms & Conditions",
    terms_ai_gen_title: "Modern Technology-Generated Content",
    terms_ai_gen_desc: "Every narration, script, and master-artist illustration in Storia is created in real-time by modern technology. This allows for a truly personalized experience that changes every time you play.",
    terms_data_title: "Data & Privacy",
    terms_data_desc: "We use your story keywords and regional preferences to craft the plot. If you use the Voice Lab, we process an 8-second sample to find a modern technology match; we do not store your original audio permanently or use it to train global models.",
    terms_moderation_title: "Safety & Moderation",
    terms_moderation_desc: "Storia is a guided creative tool, not an open-ended generator. We employ strict safety layers to ensure all generated content remains wholesome, positive, and appropriate for young children.",
    terms_ownership_title: "Content Ownership",
    terms_ownership_desc: "The generated media, including illustrations and text, are property of the Storia platform. You are granted a personal, non-commercial license to enjoy them within your family.",
    terms_back: "Back to Magic",
    privacy_link: "Privacy Policy",
    privacy_title: "Privacy Policy",
    privacy_intro: "At Storia, we take your family's privacy seriously. This policy explains how we handle your information.",
    privacy_usage_title: "Data Usage",
    privacy_usage_desc: "We collect only the prompts and settings you provide to generate your stories. This data is processed in real-time and is not sold to third parties.",
    privacy_audio_title: "Voice Processing",
    privacy_audio_desc: "Voice Lab samples are used strictly for matching you with a modern technology profile. We do not permanently store these 8-second samples once the session is over.",
    privacy_security_title: "Security",
    privacy_security_desc: "All interactions are protected by industry-standard encryption. Generated content is moderated to maintain a safe environment for kids.",
    pw_continue: "Continue",
    pw_intro_title: "Stories that help little minds slow down",
    pw_intro_subtitle: "Calm, personalized bedtime stories with gentle voices and cultural warmth. Made for winding down. Built for long nights.",
    pw_intro_feat1: "Personalized bedtime stories",
    pw_intro_feat2: "Whisper or clear voices",
    pw_intro_feat3: "Dark screen or soft visuals",
    pw_intro_feat4: "Unlimited replays of favorites",
    pw_plus_title: "Welcome to Storia Plus",
    pw_plus_body: "Storia Plus gives you a generous number of new stories each month, and unlimited listening to the ones your child loves most. No pressure. No ads. Just calm nights.",
    pw_plus_feat1: "20 new stories per month",
    pw_plus_feat2: "Unlimited replays",
    pw_plus_feat3: "All voices",
    pw_plus_feat4: "Cultural localization",
    pw_plus_feat5: "Auto-play & repeat mode",
    pw_keep_exploring: "Keep exploring for now",
    pw_limit_title: "You've used all your free stories",
    pw_limit_body: "You've explored all 5 of your free stories. You can replay your saved favorites any time, or unlock more with Storia Plus.",
    pw_limit_replay: "Replay a favorite",
    pw_limit_reset: "Next stories reset in",
    pw_topup_title: "Extra stories for long nights",
    pw_topup_subtitle: "Perfect for growth spurts, travel, or those evenings that just need one more story.",
    pw_bundle_5_title: "5 Stories",
    pw_bundle_5_desc: "Small boost for tonight",
    pw_bundle_15_title: "15 Stories",
    pw_bundle_15_desc: "Our most popular",
    pw_bundle_30_title: "30 Stories",
    pw_bundle_30_desc: "For busy weeks",
    pw_bundle_footer: "Story bundles never expire.",
    pw_add_stories: "Add stories",
    pw_not_now: "Not now",
    pw_plan_active: "Storia Plus — Active",
    pw_plan_used: "Stories used this month",
    pw_plan_reset: "Next reset",
    pw_plan_extras: "Story bundles",
    pw_plan_change: "Change plan",
    pw_plan_yearly: "Switch yearly",
    pw_plan_restore: "Restore purchases",
    pw_trust_tagline: "No pressure. Just calm nights.",
    paywall_monthly_title: "Monthly Magic",
    paywall_monthly_price: "$6.99",
    paywall_yearly_title: "Yearly Adventure",
    paywall_yearly_price: "$59.99",
    paywall_yearly_discount: "2 months free",
    paywall_button: "Start Storia Plus",
    tester_badge: "Tester Preview",
    tester_title: "Welcome to Storia",
    tester_desc: "This is an early tester link for the Storia platform. We are hard at work bringing full magic to every household.",
    tester_follow_title: "Follow the Journey ✨",
    tester_follow_desc: "Follow us on Instagram for updates, news, and behind-the-scenes magic.",
    tester_instagram_cta: "Follow us @storia.land",
    tester_feedback_cta: "Please fill our Feedback Form",
    tester_cta: "Enter the Magic ✨",
  }
};

const COUNTRY_MAP: Record<string, Region> = {
  'MX': 'mexico', 'JP': 'japan', 'IN': 'india', 'SE': 'sweden', 'NO': 'norway',
  'DK': 'denmark', 'FI': 'finland', 'FR': 'france', 'BR': 'brazil', 'EG': 'egypt',
  'CN': 'china', 'GR': 'greece', 'AU': 'australia', 'KE': 'kenya', 'US': 'usa',
  'IT': 'italy', 'DE': 'germany', 'PT': 'portugal', 'CA': 'canada', 'IE': 'ireland',
  'KR': 'korea', 'MA': 'morocco', 'PE': 'peru', 'TH': 'thailand', 'UA': 'ukraine',
  'BG': 'bulgaria', 'ES': 'mexico', 'NL': 'netherlands', 'TR': 'turkey', 'VN': 'vietnam',
  'IL': 'israel', 'PL': 'poland', 'ID': 'indonesia', 'RU': 'russia', 'AR': 'argentina',
  'CH': 'switzerland', 'ZA': 'south_africa', 'SG': 'singapore', 'RO': 'romania',
  'HU': 'hungary', 'CZ': 'czech_republic', 'PH': 'philippines', 'MY': 'malaysia',
  'CL': 'chile', 'NZ': 'new_zealand', 'CO': 'colombia'
};

const DEFAULT_STATS: UserStats = {
  plan: 'free',
  monthlyUsed: 0,
  monthlyLimit: 5,
  bundlesRemaining: 0,
  totalGenerated: 0,
  nextResetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()
};

const App: React.FC = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [view, setView] = useState<'landing' | 'app' | 'seed' | 'refinement' | 'setup' | 'settings' | 'privacy' | 'about' | 'paywall' | 'library' | 'public_library' | 'coloring_book' | 'auth' | 'account' | 'subscribe_success'>(
    window.location.pathname === '/subscribe/success' ? 'subscribe_success' : 'landing'
  );
  const [paywallScreen, setPaywallScreen] = useState<'intro' | 'plus' | 'limit' | 'topup'>('intro');
  const [hasKey, setHasKey] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [story, setStory] = useState<StoryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [wizardConfig, setWizardConfig] = useState<Partial<StoryConfig>>({});
  const [savedPersonalization, setSavedPersonalization] = useState<Partial<StoryConfig>>(() => {
    const saved = localStorage.getItem('storia_personalization_v1');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('storia_current_lang') || 'English';
  });

  const [dynamicT, setDynamicT] = useState<Record<string, Partial<UITranslations>>>(() => {
    const initialLang = localStorage.getItem('storia_current_lang') || 'English';
    const cached = localStorage.getItem(`storia_trans_${initialLang}`);
    return cached ? { [initialLang]: JSON.parse(cached) } : {};
  });

  const [detectedRegion, setDetectedRegion] = useState<Region>('global');
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_STATS);
  const [sessionStories, setSessionStories] = useState<StoryResult[]>([]);
  const [savedStories, setSavedStories] = useState<StoryResult[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const generationIdRef = useRef(0);
  const translationIdRef = useRef(0);

  const t = {
    ...ALL_TRANSLATIONS['English'],
    ...(ALL_TRANSLATIONS[currentLang] || {}),
    ...(dynamicT[currentLang] || {})
  } as UITranslations;

  useEffect(() => {
    // Restore session from JWT + localStorage cache
    const token = getToken();
    const user = localStorage.getItem('storia_user');
    if (token && user) {
      const userData = JSON.parse(user);
      setIsLoggedIn(true);
      setUserEmail(userData.email);
      // Load stats and saved stories from backend
      apiGetStats()
        .then(stats => setUserStats(stats))
        .catch(() => {
          const storedStats = localStorage.getItem('storia_user_stats');
          if (storedStats) setUserStats(JSON.parse(storedStats));
        });
      apiGetStories()
        .then(stories => setSavedStories(stories))
        .catch(() => {
          const saved = localStorage.getItem('storia_saved_stories');
          if (saved) setSavedStories(JSON.parse(saved));
        });
    } else {
      // Not logged in — use localStorage stats
      const storedStats = localStorage.getItem('storia_user_stats');
      if (storedStats) setUserStats(JSON.parse(storedStats));
    }
    detectLocation();
  }, []);

  // Scroll to top on every view change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [view]);

  useEffect(() => {
    localStorage.setItem('storia_current_lang', currentLang);
    if (!hasKey || currentLang === 'English') return;

    const cached = localStorage.getItem(`storia_trans_${currentLang}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Only use cache if it has a full translation (≥158 keys incl tester_*) — clears stale caches
      if (Object.keys(parsed).length >= 158) {
        setDynamicT(prev => ({ ...prev, [currentLang]: parsed }));
        return;
      }
      // Remove the partial/bad cache so we fetch a fresh full translation
      localStorage.removeItem(`storia_trans_${currentLang}`);
    }


    const translateMagic = async () => {
      const tid = ++translationIdRef.current;
      try {
        const englishStrings = ALL_TRANSLATIONS['English'];
        const keys = Object.keys(englishStrings);
        const chunkSize = 200;
        const chunks: any[] = [];
        for (let i = 0; i < keys.length; i += chunkSize) {
          const chunkObj: any = {};
          keys.slice(i, i + chunkSize).forEach(k => chunkObj[k] = (englishStrings as any)[k]);
          chunks.push(chunkObj);
        }

        const BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';
        const res = await fetch(`${BASE}/api/gemini/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chunks, targetLang: currentLang }),
        });
        if (!res.ok) throw new Error('Translation request failed');
        const combinedResult = await res.json() as Partial<UITranslations>;

        if (tid !== translationIdRef.current) return;

        if (Object.keys(combinedResult).length > 5) {
          localStorage.setItem(`storia_trans_${currentLang}`, JSON.stringify(combinedResult));
          setDynamicT(prev => ({ ...prev, [currentLang]: combinedResult }));
        }
      } catch (e) {
        console.error("Storia Magic Localization Failed", e);
      }
    };
    translateMagic();
  }, [currentLang, hasKey]);

  const updateStats = (updates: Partial<UserStats>) => {
    setUserStats(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('storia_user_stats', JSON.stringify(next));
      // Also sync to backend when logged in
      if (isLoggedIn) {
        apiUpdateStats(updates).catch(err => console.warn('Stats sync failed:', err));
      }
      return next;
    });
  };

  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!isLoggedIn) { setView('auth'); return; }
    setSubscribeLoading(true);
    setSubscribeError(null);
    try {
      const { url } = await apiCreateCheckoutSession(plan);
      window.location.href = url;
    } catch (err: any) {
      console.error('Stripe checkout error:', err);
      setSubscribeError(err.message || 'Could not start checkout. Please try again.');
      setSubscribeLoading(false);
    }
  };

  const handleAddStories = async (count: number) => {
    if (!isLoggedIn) { setView('auth'); return; }
    setSubscribeLoading(true);
    setSubscribeError(null);
    try {
      const { url } = await apiCreateTopupSession(count);
      window.location.href = url;
    } catch (err: any) {
      console.error('Topup checkout error:', err);
      setSubscribeError(err.message || 'Could not start checkout. Please try again.');
      setSubscribeLoading(false);
    }
  };

  const [authError, setAuthError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [authLoading, setAuthLoading] = useState(false);

  const handleCreateAccount = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await apiRegister(email, password);
      localStorage.setItem('storia_user', JSON.stringify({ email: result.user.email }));
      setIsLoggedIn(true);
      setUserEmail(result.user.email);
      // Migrate any session stories to the new account
      for (const s of sessionStories) {
        await apiSaveStory(s).catch(() => { });
      }
      setView('library');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await apiLogin(email, password);
      localStorage.setItem('storia_user', JSON.stringify({ email: result.user.email }));
      setIsLoggedIn(true);
      setUserEmail(result.user.email);
      const [stories, stats] = await Promise.all([apiGetStories(), apiGetStats()]);
      setSavedStories(stories);
      setUserStats(stats);
      setView('library');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdateEmail = async (newEmail: string) => {
    try {
      await apiUpdateEmail(newEmail);
      const user = localStorage.getItem('storia_user');
      if (user) {
        const userData = JSON.parse(user);
        userData.email = newEmail;
        localStorage.setItem('storia_user', JSON.stringify(userData));
      }
      setUserEmail(newEmail);
    } catch (err: any) {
      console.error('Update email failed:', err);
      throw err; // let AccountPage handle display
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiDeleteAccount();
    } catch (err) {
      console.error('Delete account API failed:', err);
    }
    localStorage.removeItem('storia_user');
    localStorage.removeItem('storia_saved_stories');
    localStorage.removeItem('storia_user_stats');
    clearToken();
    setIsLoggedIn(false);
    setUserEmail('');
    setSavedStories([]);
    setUserStats(DEFAULT_STATS);
    setView('landing');
  };

  const saveToAccount = async (storyToSave: StoryResult) => {
    if (!isLoggedIn) {
      setView('auth');
      return;
    }
    const alreadySaved = savedStories.find(s => s.id === storyToSave.id);
    if (alreadySaved) return;

    const updatedStory = { ...storyToSave, isSaved: true };
    const updatedSaved = [...savedStories, updatedStory];
    setSavedStories(updatedSaved);

    setSessionStories(prev => prev.map(s => s.id === storyToSave.id ? { ...s, isSaved: true } : s));
    if (story?.id === storyToSave.id) setStory(prev => prev ? { ...prev, isSaved: true } : prev);

    // Persist to backend
    try {
      await apiSaveStory(updatedStory);
    } catch (err) {
      console.error('Story save to backend failed:', err);
      // Fallback: keep in localStorage
      localStorage.setItem('storia_saved_stories', JSON.stringify(updatedSaved));
    }
  };

  const detectLocation = async () => {
    const storedLang = localStorage.getItem('storia_current_lang');
    const userExplicitLang = localStorage.getItem('storia_lang_user_explicit');
    // Skip IP detection only if:
    // (a) user explicitly set a non-English language, OR
    // (b) user explicitly chose English (flag set + stored lang is English)
    // Never skip if stored lang is just the default 'English' saved on first load.
    const skipDetection = (storedLang && storedLang !== 'English') || (userExplicitLang && storedLang === 'English');
    const browserLang = navigator.language || (navigator as any).userLanguage;
    let initialLangDetected = 'English';

    if (browserLang) {
      const langCode = browserLang.split('-')[0].toLowerCase();
      if (langCode === 'fr') initialLangDetected = 'French';
      else if (langCode === 'es') initialLangDetected = 'Spanish';
      else if (langCode === 'pt') {
        initialLangDetected = browserLang.toLowerCase().includes('br') ? 'Portuguese (Brazil)' : 'Portuguese (Portugal)';
      }
    }

    let region: Region = 'global';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const resp = await fetch('https://www.cloudflare.com/cdn-cgi/trace', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (resp.ok) {
        const text = await resp.text();
        const match = text.match(/loc=([A-Z]{2})/);
        if (match && match[1] && COUNTRY_MAP[match[1]]) {
          const code = match[1];
          region = COUNTRY_MAP[code];
          if (!skipDetection) {
            if (code === 'PT') initialLangDetected = 'Portuguese (Portugal)';
            else if (code === 'BR') initialLangDetected = 'Portuguese (Brazil)';
            else if (code === 'FR') initialLangDetected = 'French';
            else if (['MX', 'ES', 'AR', 'CL', 'CO'].includes(code)) initialLangDetected = 'Spanish';
          }
        }
      }
    } catch (e) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes('Europe/Lisbon')) region = 'portugal';
      else if (tz.includes('America/Sao_Paulo')) region = 'brazil';
      else if (tz.includes('Europe/Paris')) region = 'france';
      if (!skipDetection) {
        if (region === 'portugal') initialLangDetected = 'Portuguese (Portugal)';
        else if (region === 'brazil') initialLangDetected = 'Portuguese (Brazil)';
        else if (region === 'france') initialLangDetected = 'French';
      }
    }

    setDetectedRegion(region);
    if (!skipDetection) {
      setCurrentLang(initialLangDetected);
    }
  };

  const calculateSceneTimings = (visualScene: VisualScene[]) => {
    if (!visualScene || visualScene.length === 0) return [];
    const sorted = [...visualScene].sort((a, b) => (a.scene || 0) - (b.scene || 0));
    return sorted.map((s, i) => ({ ...s, start_time_pct: i / Math.max(1, sorted.length) }));
  };

  const handleNextFromCustomize = (customConfig: Partial<StoryConfig>) => {
    setWizardConfig(prev => ({ ...prev, ...customConfig }));
    setView('seed');
  };

  const handleNextFromSeed = (seedConfig: Partial<StoryConfig>) => {
    setWizardConfig(prev => ({ ...prev, ...seedConfig }));
    setView('refinement');
  };

  const handleGenerateStory = async (refinedConfig: Partial<StoryConfig>) => {
    const config = { ...wizardConfig, ...refinedConfig } as StoryConfig;

    // Final safety guard before generation
    const unsafeChildName = checkSafety(config.childName || "");
    const unsafeFriendNames = checkSafety(config.friendNames || "");
    const unsafeKeywords = checkSafety(config.keywords || "");

    if (unsafeChildName || unsafeFriendNames || unsafeKeywords) {
      setError(t.error_safety_desc || "Safety violation detected.");
      setLoading(false);
      return;
    }

    const usingBundle = userStats.bundlesRemaining > 0 &&
      !((userStats.plan === 'plus' && userStats.monthlyUsed < userStats.monthlyLimit) ||
        (userStats.plan === 'free' && userStats.totalGenerated < 5));

    const canGenerate = (userStats.plan === 'plus' && userStats.monthlyUsed < userStats.monthlyLimit) ||
      (userStats.plan === 'free' && userStats.totalGenerated < 5) ||
      (userStats.bundlesRemaining > 0);

    if (!canGenerate) {
      setPaywallScreen('limit');
      setView('paywall');
      return;
    }

    const currentGenId = ++generationIdRef.current;
    setLoading(true);
    setView('app');
    setError(null);
    setLoadingStatus(t.loading_magic);

    try {
      const service = new StoryService();
      const storyData = await service.generateStoryStructure(config);
      if (currentGenId !== generationIdRef.current) return;

      // Decrement bundle if that's what allowed this generation
      if (usingBundle && isLoggedIn) {
        const newBundle = Math.max(0, userStats.bundlesRemaining - 1);
        setUserStats(prev => ({ ...prev, bundlesRemaining: newBundle }));
        apiUpdateStats({ bundlesRemaining: newBundle }).catch(console.error);
      }

      // --- SAVE PERSONALIZATION ---
      const personalizationKeys: (keyof StoryConfig)[] = [
        'childName', 'friendNames', 'storyMode', 'language', 'voiceGender',
        'voiceStyle', 'pace', 'rhymeMode', 'storyLength', 'soundscape',
        'parentVoiceEnabled', 'parentVoiceProfile'
      ];
      const personalization: any = {};
      personalizationKeys.forEach(k => { personalization[k] = config[k]; });
      localStorage.setItem('storia_personalization_v1', JSON.stringify(personalization));
      setSavedPersonalization(personalization);

      const voice = (config.parentVoiceEnabled && config.parentVoiceProfile)
        ? config.parentVoiceProfile.matchedVoice
        : (config.voiceGender === 'male' ? 'Fenrir' : config.voiceGender === 'neutral' ? 'Puck' : 'Kore');

      const initialStory: StoryResult = {
        ...storyData,
        id: `story_${Date.now()}`,
        episodes: storyData.episodes.map(ep => ({ ...ep, visual_plan: calculateSceneTimings(ep.visual_plan || []) })),
        autoplay_next: config.autoplayNext,
        soundscape: config.soundscape,
        screen_mode: config.screenMode,
        sleep_fade: config.sleepFade,
        timestamp: Date.now(),
        isSaved: false
      };

      let firstSceneReady = false;
      const checkReadyState = () => {
        if (firstSceneReady && currentGenId === generationIdRef.current) {
          setLoading(false);
          setStory(initialStory);
          setSessionStories(prev => [initialStory, ...prev]);
        }
      };

      if (config.screenMode === 'dark') {
        firstSceneReady = true;
        checkReadyState();
      }

      updateStats({
        totalGenerated: userStats.totalGenerated + 1,
        monthlyUsed: userStats.monthlyUsed + 1,
        bundlesRemaining: (userStats.bundlesRemaining > 0 && userStats.monthlyUsed >= userStats.monthlyLimit) ? userStats.bundlesRemaining - 1 : userStats.bundlesRemaining
      });

      if (config.soundscape !== 'none') {
        service.generateSoundscape(config.soundscape)
          .then(audio => currentGenId === generationIdRef.current ? decodeAudio(audio) : null)
          .then(url => {
            if (!url || currentGenId !== generationIdRef.current) return;
            setStory(prev => prev?.id === initialStory.id ? { ...prev, soundscapeBlobUrl: url } : prev);
          });
      }

      storyData.episodes.forEach((episode, epIdx) => {
        const isMeditation = config.meditationEnabled && epIdx === storyData.episodes.length - 1 && episode.episode_title.toLowerCase().includes('wind-down');
        service.generateTTS(episode.ssml_narration, voice, isMeditation ? 'whisper' : config.voiceStyle, config.language, config.storyMode, isMeditation ? 'slow' : config.pace)
          .then(audio => currentGenId === generationIdRef.current ? decodeAudio(audio) : null)
          .then(url => {
            if (!url || currentGenId !== generationIdRef.current) return;
            setStory(prev => {
              if (prev?.id !== initialStory.id) return prev;
              const next = { ...prev, episodes: [...prev.episodes] };
              next.episodes[epIdx] = { ...next.episodes[epIdx], audioBlobUrl: url };
              return next;
            });
          });

        if (config.screenMode === 'visuals') {
          episode.visual_plan?.forEach((scene, sIdx) => {
            service.generateSceneImage(scene.image_prompt, storyData.story_mode, config.region, storyData.main_character_description)
              .then(url => {
                if (currentGenId !== generationIdRef.current) return;
                if (epIdx === 0 && sIdx === 0) { firstSceneReady = true; checkReadyState(); }
                setStory(prev => {
                  if (prev?.id !== initialStory.id) return prev;
                  const next = { ...prev, episodes: [...prev.episodes] };
                  const nextPlan = [...(next.episodes[epIdx].visual_plan || [])];
                  if (nextPlan[sIdx]) nextPlan[sIdx] = { ...nextPlan[sIdx], imageUrl: url };
                  next.episodes[epIdx].visual_plan = nextPlan;
                  return next;
                });
              }).catch(() => { if (epIdx === 0 && sIdx === 0) { firstSceneReady = true; checkReadyState(); } });
          });
        }
      });
    } catch (err: any) {
      if (currentGenId === generationIdRef.current) {
        if (err.message?.includes("Requested entity was not found")) { setHasKey(false); setView('setup'); }
        setError(err.message?.toLowerCase().includes("safety") ? t.error_safety_desc : t.error_story);
        setLoading(false);
      }
    }
  };

  const showWizardHeader = !story && (view === 'app' || view === 'seed' || view === 'refinement');

  if (showDisclaimer) {
    return <TesterDisclaimer translations={t} onProceed={() => setShowDisclaimer(false)} />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* GLOBAL LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 z-[500] bg-black flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-black to-purple-950 opacity-100"></div>
          <div className="relative text-white text-center flex flex-col items-center max-sm px-6 z-10">
            <p className="text-3xl font-black tracking-tight mb-4 animate-pulse">{loadingStatus}</p>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8 animate-pulse opacity-60">{t.loader_subtext}</p>
            <button onClick={() => { generationIdRef.current++; setLoading(false); }} className="px-8 py-3 bg-white/5 rounded-full text-zinc-500 text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5">{t.cancel}</button>
          </div>
        </div>
      )}

      <div className="flex-1">

        {/* ── Universal sub-page mini-nav (shown for all views except landing + app) ── */}
        {!['landing', 'app', 'seed', 'refinement'].includes(view) && (
          <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-zinc-900 px-5 py-3 flex items-center justify-between animate-in fade-in duration-300">
            <button
              onClick={() => setView('landing')}
              className="flex items-center gap-2 text-white font-black text-xl tracking-tight hover:text-indigo-400 transition-colors"
            >
              Storia<sup className="text-[0.5em] align-super">©</sup>
              <span className="text-zinc-700 text-sm font-normal ml-1 hidden sm:inline">← Home</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('library')}
                className="px-4 py-2 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors hidden sm:flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                {t.library_title}
              </button>
              <button
                onClick={() => setView('app')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
              >
                ✨ {t.landing_button || 'Create a Story'}
              </button>
            </div>
          </div>
        )}

        {showWizardHeader && (
          <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <header className="flex flex-col md:flex-row items-center justify-between gap-6">
              <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight font-borel py-2 cursor-pointer" onClick={() => setView('landing')}>Storia<sup className="text-[0.4em] mb-4">©</sup></h1>
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">

                <button onClick={() => setView('library')} className="px-5 py-3 md:px-6 md:py-3 bg-zinc-900 border border-zinc-800 rounded-full text-white text-sm font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-xl backdrop-blur-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  {t.library_title}
                </button>
                {isLoggedIn ? (
                  <button onClick={() => setView('account')} className="px-5 py-3 md:px-6 md:py-3 bg-zinc-900 border border-zinc-800 rounded-full text-white text-sm font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-xl backdrop-blur-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {t.account_title}
                  </button>
                ) : (
                  <button onClick={() => setView('auth')} className="px-5 py-3 md:px-6 md:py-3 bg-indigo-600 rounded-full text-white text-sm font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                    {t.button_create_account}
                  </button>
                )}
              </div>
            </header>
          </div>
        )}

        {view === 'landing' && <LandingPage onStart={() => hasKey ? setView('app') : setView('setup')} onJoinMembership={() => { setPaywallScreen('plus'); setView('paywall'); }} onExplorePublic={() => setView('public_library')} onGoToColoring={() => setView('coloring_book')} translations={t} currentLang={currentLang} />}
        {view === 'setup' && (
          <div className="min-h-screen flex items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-8 p-10 bg-zinc-900 rounded-[3rem] border border-zinc-800 shadow-2xl">
              <div className="text-6xl animate-bounce">🔑</div>
              <h2 className="text-3xl font-black text-white">{t.setup_title}</h2>
              <p className="text-zinc-400">{t.setup_desc}</p>
              <button onClick={async () => { if (window.aistudio) { await window.aistudio.openSelectKey(); setHasKey(true); } setView('app'); }} className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl">{t.setup_button}</button>
            </div>
          </div>
        )}
        {view === 'refinement' && (
          <div className="py-12 md:py-24 px-4 bg-black min-h-screen">
            <RefinementPage
              translations={t}
              onBack={() => setView('seed')}
              onStart={handleGenerateStory}
            />
          </div>
        )}
        {view === 'seed' && (
          <div className="py-12 md:py-24 px-4 bg-black min-h-screen">
            <StorySeedPage
              translations={t}
              initialRegion={detectedRegion}
              onBack={() => setView('app')}
              onNext={handleNextFromSeed}
            />
          </div>
        )}
        {view === 'app' && !story && (
          <div className="py-12 md:py-24 px-4 bg-black min-h-screen">
            <Form
              initialData={savedPersonalization}
              generationCount={userStats.monthlyUsed}
              translations={t}
              onBack={() => setView('landing')}
              onJoinMembership={() => { setPaywallScreen('plus'); setView('paywall'); }}
              onSubmit={handleNextFromCustomize}
            />
          </div>
        )}
        {view === 'auth' && (
          <div className="min-h-screen flex items-center justify-center p-6 bg-black">
            <div className="max-w-md w-full bg-zinc-900 rounded-[3rem] p-10 border border-zinc-800 shadow-2xl text-center space-y-6">
              <div className="text-6xl">✨</div>
              <h2 className="text-3xl font-black text-white">
                {authMode === 'register' ? t.button_create_account : 'Welcome back'}
              </h2>
              <p className="text-zinc-400 text-sm">
                {authMode === 'register' ? t.library_save_cta : 'Sign in to access your saved stories.'}
              </p>
              {authError && (
                <p className="text-red-400 text-sm font-semibold bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-2">{authError}</p>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                  const password = (form.elements.namedItem('password') as HTMLInputElement).value;
                  authMode === 'register' ? handleCreateAccount(email, password) : handleLogin(email, password);
                }}
                className="space-y-3"
              >
                <input required name="email" type="email" placeholder="Email Address" className="w-full px-6 py-4 rounded-2xl bg-zinc-800 border-2 border-zinc-700 text-white focus:border-indigo-500 focus:outline-none" />
                <input required name="password" type="password" placeholder="Password (min 6 chars)" minLength={6} className="w-full px-6 py-4 rounded-2xl bg-zinc-800 border-2 border-zinc-700 text-white focus:border-indigo-500 focus:outline-none" />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading ? 'Please wait…' : (authMode === 'register' ? t.button_create_account : 'Sign In')}
                </button>
              </form>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => { setAuthMode(m => m === 'register' ? 'login' : 'register'); setAuthError(null); }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm"
                >
                  {authMode === 'register' ? 'Already have an account? Sign in' : 'New here? Create a free account'}
                </button>
                <button onClick={() => setView('app')} className="text-zinc-500 hover:text-white font-bold text-sm">{t.terms_back}</button>
              </div>
            </div>
          </div>
        )}
        {view === 'settings' && <SettingsPage userStats={userStats} translations={t} token={getToken()} onBack={() => setView('app')} />}
        {view === 'privacy' && <PrivacyPolicyPage translations={t} onBack={() => setView('landing')} />}
        {view === 'about' && <AboutPage translations={t} onBack={() => setView('landing')} />}
        {view === 'paywall' && (
          <Paywall
            screen={paywallScreen}
            translations={t}
            userStats={userStats}
            onSubscribe={handleSubscribe}
            onAddStories={handleAddStories}
            onContinue={() => setView('app')}
            onBack={() => setView('app')}
            onReplay={() => setView('library')}
          />
        )}
        {subscribeError && view === 'paywall' && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-950 border border-red-700 text-red-300 text-sm font-bold px-6 py-3 rounded-2xl shadow-2xl">
            {subscribeError}
          </div>
        )}
        {subscribeLoading && (
          <div className="fixed inset-0 z-[600] bg-black/80 flex items-center justify-center">
            <div className="text-white text-center space-y-4">
              <p className="text-2xl font-black animate-pulse">Redirecting to checkout…</p>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Powered by Stripe</p>
            </div>
          </div>
        )}
        {view === 'account' && <AccountPage translations={t} email={userEmail} onUpdateEmail={handleUpdateEmail} onDeleteAccount={handleDeleteAccount} onBack={() => setView('app')} />}
        {view === 'library' && <LibraryPage translations={t} sessionStories={sessionStories} savedStories={savedStories} isLoggedIn={isLoggedIn} onSelectStory={(s) => { setStory(s); setView('app'); }} onSaveStory={saveToAccount} onBack={() => setView('app')} onAuth={() => setView('auth')} />}
        {view === 'public_library' && <PublicLibraryPage translations={t} onSelectStory={(s) => { setStory(s); setView('app'); }} onGoToColoring={() => setView('coloring_book')} onBack={() => setView('landing')} />}
        {view === 'coloring_book' && <ColoringBookPage translations={t} onBack={() => setView('landing')} />}
        {view === 'subscribe_success' && (
          <SubscribeSuccessPage
            translations={t}
            onContinue={() => { window.history.replaceState({}, '', '/'); setView('app'); }}
            onRefreshStats={async () => {
              try {
                const fresh = await apiGetStats();
                if (fresh) setUserStats(prev => ({ ...prev, ...fresh }));
              } catch { }
            }}
          />
        )}

        {story && (
          <div className="py-12 px-4">
            <div className="max-w-6xl mx-auto">
              <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight font-borel py-2 cursor-pointer" onClick={() => setView('landing')}>Storia<sup className="text-[0.4em] mb-4">©</sup></h1>
                <div className="flex gap-4">
                  <button onClick={() => setView('library')} className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-white font-bold hover:bg-zinc-800 transition-all flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>{t.library_title}</button>
                  {isLoggedIn ? <button onClick={() => setView('account')} className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-white font-bold hover:bg-zinc-800 transition-all flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>{t.account_title}</button> : <button onClick={() => setView('auth')} className="px-6 py-3 bg-indigo-600 rounded-full text-white font-bold hover:bg-indigo-500 transition-all">{t.button_create_account}</button>}
                </div>
              </header>
              {error && <div className="text-center text-red-500 mb-8 p-4 bg-red-950/20 rounded-2xl border border-red-900">{error}</div>}
              {story && <StoryPlayer translations={t} story={story} isLoggedIn={isLoggedIn} onAuth={() => setView('auth')} onClose={() => { generationIdRef.current++; setStory(null); setView('app'); }} onSave={() => saveToAccount(story)} />}
            </div>
          </div>
        )}
        {/* GLOBAL ERROR DISPLAY (WHEN NO STORY YET) */}
        {!story && error && (
          <div className="max-w-xl mx-auto px-4 mt-8">
            <div className="text-center text-red-500 p-6 bg-red-950/20 rounded-2xl border border-red-900/50 shadow-xl">
              <p className="font-black mb-2">Something went wrong</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-zinc-950 border-t border-zinc-900 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col gap-1"><p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t.footer_region}</p><div className="relative"><select value={currentLang} onChange={(e) => { localStorage.setItem('storia_lang_user_explicit', '1'); setCurrentLang(e.target.value); }} className="bg-zinc-900 text-white text-xs font-bold py-3 pl-4 pr-10 rounded-xl border border-zinc-800 appearance-none cursor-pointer focus:outline-none focus:border-indigo-500">{SUPPORTED_LANGUAGES.map(lang => (<option key={lang} value={lang}>{lang}</option>))}</select><div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></div></div></div>

            <button onClick={() => setView('public_library')} className="text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>{t.public_library_link}</button>
            <button onClick={() => setView('about')} className="text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{t.about_link}</button>
            <a
              href="https://www.instagram.com/storia.land/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.999 0h.001zm-.512 1.442c.859-.04 1.154-.047 3.333-.047 2.179 0 2.474.007 3.333.047.794.037 1.226.171 1.513.282.38.147.652.322.936.606.284.284.459.556.606.936.111.287.245.72.282 1.513.04.859.047 1.154.047 3.333 0 2.179-.007 2.474-.047 3.333-.037.794-.171 1.226-.282 1.513a2.389 2.389 0 0 1-.606.936 2.39 2.39 0 0 1-.936.606c-.287.111-.72.245-1.513.282-.859.04-1.154.047-3.333.047-2.179 0-2.474-.007-3.333-.047-.794-.037-1.226-.171-1.513-.282a2.389 2.389 0 0 1-.936-.606 2.389 2.389 0 0 1-.606-.936c-.111-.287-.245-.72-.282-1.513-.04-.859-.047-1.154-.047-3.333 0-2.179.007-2.474.047-3.333.037-.794.171-1.226.282-1.513.147-.38.322-.652.606-.936.284-.284.556-.459.936-.606.287-.111.72-.245 1.513-.282zM8 3.891a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334zm4.328-1.576a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92z" />
              </svg>
              Instagram
            </a>
          </div>
          <div className="text-center md:text-right"><h4 className="text-white font-black font-borel text-2xl mb-1">Storia<sup className="text-[0.5em] mb-2 ml-0.5">©</sup></h4><div className="flex flex-col gap-1"><p className="text-zinc-50 text-[10px] font-bold uppercase tracking-tighter">&copy; 2026 Modern Technology-Powered Audiobook Adventures</p><p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest opacity-60">{t.footer_created_by}</p></div></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
