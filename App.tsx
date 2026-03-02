
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
import TermsPage from './components/TermsPage';
import HelpPage from './components/HelpPage';
import VerifyEmailPage from './components/VerifyEmailPage';
import { useToast } from './components/ToastContext';
import StoryLoaderOverlay from './components/StoryLoaderOverlay';
import { StoryService } from './services/gemini';
import { decodeAudio } from './services/audio';
import { checkSafety } from './services/moderation';
import { THEME_TRANSLATIONS } from './src/themes';
import {
  apiRegister, apiLogin, apiDeleteAccount, apiUpdateEmail, apiOAuthInit,
  apiGetStories, apiSaveStory, apiRateStory,
  apiGetStats, apiUpdateStats,
  apiCreateCheckoutSession, apiCreateTopupSession, apiCreatePortalSession, apiCancelSubscription, apiResendVerification,
  apiGetProfile, apiSaveProfile,
  getToken, setToken, clearToken, setRefreshToken
} from './services/api';
import { signInWithGoogle, signInWithApple, getOAuthSession } from './services/oauthClient';
import type { ChildProfile } from './services/api';

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
    landing_subtitle: "Storia is made for parents of children aged 2–5. Calm, personalized bedtime stories with soothing voices and cultural warmth — designed to help little ones wind down, self-regulate, and drift off to sleep.",
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
    button_create_account: "Create Account / Sign In",
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
    account_child_section: "Your Child",
    account_child_optional: "Optional · Prefills your story form",
    account_child_name: "Child's Name",
    account_child_age: "Child's Age",
    account_child_avatar: "Choose an Avatar",
    account_child_saved: "Child profile saved! ✨",
    account_billing: "Manage Billing",
    account_billing_desc: "Update payment method, cancel or manage subscription",
    account_support: "Contact Support",
    account_logout: "Log Out",
    account_logout_desc: "You can log back in any time",
    account_plan_section: "Your Plan",
    account_plan_free: "Basic · Free",
    account_plan_plus: "Storia Plus",
    account_plan_used: "stories this month",
    account_plan_limit: "monthly limit",
    account_subscribe_cta: "Subscribe to Plus — £6.99/month",
    account_upgrade_cta: "Switch to Yearly & Save — £59.99/year",
    account_cancel_cta: "Cancel Subscription",
    account_cancel_confirm: "Are you sure you want to cancel?",
    account_cancel_desc: "You'll keep Plus access until the end of your billing period.",
    account_cancel_success: "Subscription cancelled. You're now on the free plan.",
    account_cancel_keep: "Keep Storia Plus",
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
    loader_crafted: "Your story is being crafted",
    loader_did_you_know: "Did you know?",
    loader_fact_1: "Stories activate 7 regions of the brain simultaneously — including those that process emotions, movement, and smell.",
    loader_fact_2: "Children who hear a story before bed fall asleep up to 20 minutes faster than those who don't.",
    loader_fact_3: "Hearing a character feel nervous helps children name and regulate their own anxiety — a skill called \"bibliotherapy.\"",
    loader_fact_4: "Repetition is magic: hearing the same story 3–5 times builds neural pathways that help children predict — and feel safe.",
    loader_fact_5: "Stories from a child's own cultural world strengthen identity and a sense of belonging — both tied to emotional security.",
    loader_fact_6: "A calm narrator's voice entrains a child's nervous system through co-regulation — even over audio.",
    loader_fact_7: "Children who are read to daily have vocabularies 3x larger by age 5, giving them more words for their feelings.",
    loader_fact_8: "Predictable bedtime rituals lower cortisol levels — making story time one of the most powerful tools for calm.",
    loader_fact_9: "Stories with a clear resolution teach children that problems can be solved — building emotional resilience.",
    loader_fact_10: "When a child identifies with a character overcoming fear, their own amygdala response to that fear is reduced.",

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
    lang_italian: "Italian",
    lang_german: "German",
    lang_polish: "Polish",
    lang_russian: "Russian",
    lang_bulgarian: "Bulgarian",
    lang_dutch: "Dutch",
    lang_turkish: "Turkish",
    lang_arabic: "Arabic",
    lang_japanese: "Japanese",
    lang_korean: "Korean",
    lang_chinese_simplified: "Chinese (Simplified)",
    lang_swedish: "Swedish",
    lang_finnish: "Finnish",
    play_sample: "Play Sample",
    stop_sample: "Stop Sample",
    loading_audio: "Loading...",
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
    // ── Terms & Conditions — full page content ──────────────────────────────
    terms_label: "Legal",
    terms_last_updated: "Last updated: February 2026 · Spoonful Labs, Ltd",
    terms_intro_text: "Welcome to Storia, an AI-powered audiobook and bedtime storytelling app developed by Spoonful Labs, Ltd. By creating an account or using the app, you agree to the following terms. We've written them plainly — please read them.",
    terms_s_accept_title: "Acceptance of Terms",
    terms_s_accept_p1: "By accessing or using Storia, you confirm that you are at least 18 years old (or the legal age of majority in your jurisdiction) and that you accept these Terms in full. If you are using Storia on behalf of a child, you accept these Terms on their behalf and take responsibility for their use of the service.",
    terms_s_accept_p2: "If you do not agree with any part of these Terms, do not use Storia.",
    terms_s_what_title: "What Storia Does",
    terms_s_what_p1: "Storia uses Google's Gemini API and AI image generation to create personalized bedtime stories and accompanying illustrations in real time. Each story is unique to your session and generated based on the inputs you provide — keywords, region, character names, language, and settings.",
    terms_s_what_p2: "Because content is AI-generated, you may occasionally encounter variations in quality, tone, or style. We apply content moderation filters, but no automated system is perfect. Please report any inappropriate content to info@storia.land.",
    terms_s_account_title: "Your Account",
    terms_s_account_list: "You must provide a valid email address to register.\nYou are responsible for keeping your account credentials secure.\nOne account per person. You may not share, sell, or transfer your account.\nYou may delete your account at any time from your account settings. All associated data is permanently removed immediately.\nWe reserve the right to suspend or terminate accounts that violate these Terms, with or without notice.",
    terms_s_bill_title: "Plans, Payments & Billing",
    terms_s_bill_free: "Free plan: new accounts receive 5 free story generations per month during our early access period. This limit is subject to change and will be communicated before any reduction takes effect.",
    terms_s_bill_plus: "Storia Plus: a paid subscription providing 20 story generations per month, unlocked via Stripe. Subscriptions auto-renew monthly or yearly depending on your choice.",
    terms_s_bill_bundles: "Story bundles: one-time purchases of additional story credits. These never expire and are non-refundable once used.",
    terms_s_bill_list: "All prices are shown in USD unless your local currency is detected.\nPayments are processed by Stripe. We do not store payment card details.\nSubscriptions can be cancelled at any time; access continues until the end of the billing period.\nWe offer refunds on a case-by-case basis. Contact info@storia.land within 7 days of a charge you believe is erroneous.",
    terms_s_content_title: "AI-Generated Content & Ownership",
    terms_s_content_intro: "All stories, narrations, and illustrations produced by Storia are generated in real time by AI models. Each piece of content is:",
    terms_s_content_list: "Unique to your session — the same inputs won't produce the exact same output twice.\nLicensed to you personally — you may use generated content for private, non-commercial, family use only.\nNot for redistribution — you may not sell, sublicense, or publicly distribute generated stories or images without our prior written consent.\nNot for AI training — you may not use generated content to train, fine-tune, or benchmark AI models.",
    terms_s_content_footer: "The underlying app code, design, branding, and platform remain the intellectual property of Spoonful Labs, Ltd. All rights reserved.",
    terms_s_safety_title: "Safety & Content Moderation",
    terms_s_safety_intro: "Storia is designed for young children and their families. We apply the following content controls:",
    terms_s_safety_list: "Real-time keyword filtering on all story inputs.\nGemini API safety settings configured to block harmful, violent, sexual, or inappropriate content.\nImage generation prompts are constrained to child-safe themes.",
    terms_s_safety_p1: "You agree not to attempt to circumvent these filters through jailbreaking, prompt injection, or any other technique. Attempts to do so will result in immediate account termination.",
    terms_s_safety_p2: "If any generated content concerns you, please report it to info@storia.land and we will investigate within 48 hours.",
    terms_s_prohibited_title: "Prohibited Uses",
    terms_s_prohibited_intro: "You may not use Storia to:",
    terms_s_prohibited_list: "Generate content that is illegal, hateful, abusive, or harmful to children.\nImpersonate any person or entity.\nAttempt to reverse-engineer, scrape, or extract the AI models or underlying systems.\nUse automated scripts or bots to access the service.\nResell or commercialize your access to the platform.\nInterfere with or disrupt the integrity or performance of the service.",
    terms_s_disclaimer_title: "Disclaimers & Limitation of Liability",
    terms_s_disclaimer_intro: "Storia is provided \"as is\" without warranties of any kind — express or implied. We do not guarantee:",
    terms_s_disclaimer_list: "Uninterrupted or error-free access to the service.\nThat AI-generated stories will always meet your expectations in quality or tone.\nThat third-party services (Gemini API, Stripe, Supabase) will be continuously available.",
    terms_s_disclaimer_footer: "To the maximum extent permitted by law, Spoonful Labs, Ltd shall not be liable for any indirect, incidental, or consequential damages arising from your use of Storia. Our total liability in any matter is limited to the amount you paid us in the 3 months preceding the claim.",
    terms_s_law_title: "Governing Law",
    terms_s_law_p1: "These Terms are governed by the laws of the European Union and, where applicable, the laws of the country in which Spoonful Labs, property of Keep Away From Fire Ld.a, Ltd, is incorporated. Any disputes will be resolved through binding arbitration, or in the courts of our jurisdiction, at our election.",
    terms_s_law_p2: "If you are a consumer in the EU, you retain all rights granted by mandatory local consumer protection laws, which these Terms do not override.",
    terms_s_changes_title: "Changes to These Terms",
    terms_s_changes_p1: "We may update these Terms as the service evolves. If we make material changes, we will notify you by email or via an in-app notice at least 14 days before they take effect. Continued use after the effective date constitutes acceptance.",
    terms_s_changes_p2: "The most current version will always be available at storia.land/terms.",
    terms_s_contact_title: "Contact Us",
    terms_s_contact_intro: "If you have any questions about these Terms, please reach out:",
    terms_s_contact_email_label: "Email:",
    terms_s_contact_website_label: "Website:",
    terms_s_contact_instagram_label: "Instagram:",
    terms_questions_title: "Questions?",
    terms_questions_email: "Email us at",
    terms_privacy_cta: "Privacy Policy →",
    terms_privacy_cta_desc: "How we handle your family's data",
    terms_footer_text: "© 2026 Spoonful Labs, Ltd · All Rights Reserved",
    // ── Privacy Policy — full page content ──────────────────────────────────
    privacy_label: "Legal",
    privacy_last_updated: "Last updated: February 2026 · Spoonful Labs, Ltd",
    privacy_intro_full: "At Storia, we build products for families — and we take that responsibility seriously. This policy explains exactly what data we collect, how we use it, and the rights you hold as a user. We keep this language plain on purpose: no legalese, no surprises.",
    privacy_s_collect_title: "What We Collect",
    privacy_s_collect_intro: "We collect the minimum necessary to provide the service:",
    privacy_s_collect_list: "Account data — your email address and a hashed password, securely stored via Supabase Auth.\nStory preferences — keywords, regional settings, language, voice choices, and any child name you enter. These are used only to generate your story.\nChild profile (optional) — if you save a child's name, age range, and avatar in your account settings, this is stored securely and used only to prefill the story form for your convenience.\nUsage statistics — how many stories you have generated this month, to enforce plan limits. No story content is shared with third parties for analytics.\nVoice Lab audio — an 8-second sample you record is sent to our AI model to find a narrator match. It is not stored permanently after the session ends.",
    privacy_s_use_title: "How We Use Your Data",
    privacy_s_use_intro: "We use your data for one purpose: delivering Storia to you.",
    privacy_s_use_list: "Generating personalized bedtime stories via the Gemini API (Google).\nCreating and serving AI-generated illustrations for your story scenes.\nProcessing Voice Lab audio samples to match a narrator profile.\nManaging your subscription and story generation limits via Stripe.\nRestoring your saved stories and preferences when you log in.",
    privacy_s_use_footer: "We do not sell your data. We do not use your data to train AI models. We do not serve ads.",
    privacy_s_third_title: "Third-Party Services",
    privacy_s_third_intro: "Storia uses a small number of trusted third-party providers:",
    privacy_s_third_supabase: "Supabase — database and authentication. Data is stored in EU data centres.",
    privacy_s_third_google: "Google (Gemini API) — story and image generation. API calls include your story prompt.",
    privacy_s_third_stripe: "Stripe — payment processing. We never see or store your card details.",
    privacy_s_third_netlify: "Netlify — hosting and CDN. Standard access logs may be retained for 30 days.",
    privacy_s_third_policy_link: "Privacy policy →",
    privacy_s_children_title: "Children's Privacy",
    privacy_s_children_p1: "Storia is a tool for parents, not for children to use independently. We do not knowingly collect personal information directly from children under 13.",
    privacy_s_children_p2: "Any child name entered into the story form or child profile is:",
    privacy_s_children_list: "Used only to personalize the story narrative.\nStored under the parent's account, not attributed to the child.\nDeletable at any time from your account settings.",
    privacy_s_children_contact: "We comply with COPPA (US) and GDPR-K (EU) principles. If you believe a child has provided us personal data without parental consent, contact us immediately at info@storia.land.",
    privacy_s_cookies_title: "Cookies & Local Storage",
    privacy_s_cookies_intro: "We use no third-party tracking cookies. We use browser localStorage for:",
    privacy_s_cookies_list: "Your JWT authentication token (session management).\nCached UI translations to avoid re-fetching on every visit.\nYour preferred language and region settings.\nTemporary story data for the current session.",
    privacy_s_cookies_footer: "This data stays on your device. You can clear it at any time in your browser settings.",
    privacy_s_security_title_full: "Security",
    privacy_s_security_list: "All traffic is encrypted over HTTPS/TLS.\nPasswords are never stored in plaintext — Supabase handles bcrypt hashing.\nAuthentication uses short-lived JWTs with server-side verification on every request.\nOur backend uses Supabase's service-role key from a private server — it is never exposed to the client.",
    privacy_s_security_footer: "No system is 100% secure. In the event of a breach affecting your data, we will notify you within 72 hours as required by GDPR.",
    privacy_s_rights_title: "Your Rights",
    privacy_s_rights_intro: "Depending on your location, you may have the right to:",
    privacy_s_rights_list: "Access — request a copy of all data we hold about you.\nCorrection — update your email address from your account settings.\nDeletion — permanently delete your account and all associated data from your account settings. This is immediate and irreversible.\nPortability — request an export of your saved stories.\nObjection — object to any processing we perform.",
    privacy_s_rights_footer: "To exercise any right, email us at info@storia.land. We respond within 30 days.",
    privacy_s_transfers_title: "International Transfers",
    privacy_s_transfers_body: "Storia is operated from the European Union. If you access the service from outside the EU, your data may be processed in the EU and in the US (Google, Stripe). These transfers are governed by Standard Contractual Clauses and the EU–US Data Privacy Framework.",
    privacy_s_changes_title: "Changes to This Policy",
    privacy_s_changes_body: "If we make material changes, we will notify you by email or by a prominent notice when you next open the app. The \"Last updated\" date at the top of this page will always reflect the most recent version. Continuing to use Storia after changes constitutes acceptance of the updated policy.",
    privacy_questions_title: "Questions?",
    privacy_questions_email: "Email us at",
    privacy_terms_cta: "Terms & Conditions →",
    privacy_terms_cta_desc: "What you agree to when using Storia",
    privacy_footer_text: "Your Family's Privacy Matters · © 2026 Spoonful Labs, Ltd",
    pw_continue: "Continue",
    pw_intro_title: "Stories that help little minds slow down",
    pw_intro_subtitle: "Calm, personalized bedtime stories with gentle voices and cultural warmth. Made for winding down. Built for long nights.",
    pw_intro_feat1: "Personalized bedtime stories",
    pw_intro_feat2: "Whisper or clear voices",
    pw_intro_feat3: "Dark screen or soft visuals",
    pw_intro_feat4: "Unlimited replays of favorites",
    pw_plus_title: "Welcome to Storia Plus",
    pw_plus_body: "20 new stories every month. Unlimited replays of the ones your child loves. No ads. Just calm nights.",
    pw_plus_feat1: "20 new stories per month",
    pw_plus_feat2: "Unlimited replays",
    pw_plus_feat3: "All voices",
    pw_plus_feat4: "Cultural localization",
    pw_plus_feat5: "Auto-play & repeat mode",
    pw_keep_exploring: "Keep exploring for now",
    pw_promo_label: "New member offer",
    pw_promo_desc: "Follow @storia.land on Instagram and DM us for a discount code — £3.99/month for your first 3 months.",
    pw_subscribe_cta: "Subscribe — £6.99/month",
    pw_limit_title: "You've used your 5 free stories",
    pw_limit_body: "Your free stories are all used up. Subscribe to Storia Plus for 20 new stories every month — or grab a one-time top-up bundle.",
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
    paywall_monthly_price: "£6.99",
    paywall_yearly_title: "Yearly Adventure",
    paywall_yearly_price: "£59.99",
    paywall_yearly_discount: "Best value",
    paywall_button: "Start Storia Plus",
    tester_badge: "Tester Preview",
    tester_title: "Welcome to Storia",
    tester_desc: "This is an early tester link for the Storia platform. We are hard at work bringing full magic to every household.",
    tester_follow_title: "Follow the Journey ✨",
    tester_follow_desc: "Follow us on Instagram for updates, news, and behind-the-scenes magic.",
    tester_instagram_cta: "Follow us @storia.land",
    tester_feedback_cta: "Please fill our Feedback Form",
    tester_cta: "Enter the Magic ✨",
    // Auth
    auth_welcome_back: "Welcome back",
    auth_sign_in_desc: "Sign in to access your saved stories.",
    auth_sign_in_button: "Sign In",
    auth_already_have: "Already have an account? Sign in",
    auth_new_here: "New here? Create a free account",
    auth_please_wait: "Please wait…",
    auth_email_placeholder: "Email Address",
    auth_password_placeholder: "Password (min 6 chars)",
    // Checkout
    checkout_redirecting: "Redirecting to checkout…",
    checkout_powered_by: "Powered by Stripe",
    // Library card
    lib_account_active: "Account Active",
    lib_guest_session: "Guest Session",
    lib_listen: "Listen",
    lib_script: "Script",
    lib_color: "Colour",
    // Player controls
    player_visuals_on: "Visuals ON",
    player_audio_only: "Audio Only",
    player_fullscreen: "Fullscreen",
    player_pdf: "PDF",
    // Filters
    filter_all_regions: "All Regions",
    filter_all_ages: "All Ages",
    // Settings
    settings_your_plan: "Your Plan",
    settings_plus_plan: "💎 Storia Plus",
    settings_basic_plan: "Storia Basic",
    settings_monthly: "Monthly",
    settings_yearly: "Yearly",
    settings_per_month: "per month",
    settings_per_year: "per year",
    settings_upgrade_title: "Upgrade to Storia Plus ✨",
    settings_upgrade_desc: "20 stories/month, all regions unlocked, every voice & soundscape.",
    settings_redirecting: "Redirecting to checkout…",
    settings_plus_thanks: "You're on Storia Plus. Thank you for supporting us!",
    settings_remaining: "remaining",
    settings_copyright: "Magic Responsibly © 2026 Storia Labs",
    // Nav
    nav_home_label: "← Home",
    // Landing/form banners
    landing_early_access: "Early access: 5 free stories/month until August 1st — then 2. Enjoy while it lasts!",
    form_early_access: "Early access offer: 5 free stories/month until August 1st — after that, 2 free stories/month.",
    landing_reveal_button: "Reveal Modern Technology Visuals",
    landing_painting_magic: "Painting Magic...",
    landing_promo_price: "New users: £3.99/month for the first 3 months",
    landing_promo_instagram: "Follow @storia.land · DM for access code",
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
  nextResetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString(),
  subscriptionStatus: null,
  subscriptionEndsAt: null,
};

const App: React.FC = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(() => !localStorage.getItem('storia_tester_seen'));
  const [view, setView] = useState<'landing' | 'app' | 'seed' | 'refinement' | 'setup' | 'settings' | 'privacy' | 'terms' | 'about' | 'paywall' | 'library' | 'public_library' | 'coloring_book' | 'auth' | 'account' | 'subscribe_success' | 'help' | 'verify'>(
    window.location.pathname === '/subscribe/success' ? 'subscribe_success'
      : window.location.pathname === '/verify' ? 'verify'
        : 'landing'
  );
  const [verifyToken] = useState(() => new URLSearchParams(window.location.search).get('token') || '');
  const [paywallScreen, setPaywallScreen] = useState<'intro' | 'plus' | 'limit' | 'topup'>('intro');
  const [hasKey, setHasKey] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
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
  const [detectedCountry, setDetectedCountry] = useState<string>('');
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_STATS);
  const [sessionStories, setSessionStories] = useState<StoryResult[]>([]);
  const [savedStories, setSavedStories] = useState<StoryResult[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [childProfile, setChildProfile] = useState<ChildProfile>(() => {
    const saved = localStorage.getItem('storia_child_profile');
    return saved ? JSON.parse(saved) : { childName: '', childAge: null, childAvatar: '' };
  });

  const generationIdRef = useRef(0);
  const translationIdRef = useRef(0);

  const t = {
    ...ALL_TRANSLATIONS['English'],
    ...(ALL_TRANSLATIONS[currentLang] || {}),
    ...(dynamicT[currentLang] || {})
  } as UITranslations;

  useEffect(() => {
    // ── OAuth callback: detect Supabase session from hash after Google/Apple redirect
    const handleOAuthCallback = async () => {
      const session = await getOAuthSession();
      if (session) {
        try {
          const result = await apiOAuthInit(session.token);
          setIsLoggedIn(true);
          setUserEmail(session.email);
          setEmailVerified(true);
          localStorage.setItem('storia_user', JSON.stringify({ id: session.userId, email: session.email }));
          window.history.replaceState({}, '', '/');
          setView('app');
          // Load data
          apiGetStats().then(setUserStats).catch(() => { });
          apiGetStories().then(setSavedStories).catch(() => { });
          apiGetProfile().then(p => { setChildProfile(p); }).catch(() => { });
          return; // exit early — no need to check stored token
        } catch (e) {
          console.warn('OAuth callback failed:', e);
        }
      }
      // Restore session from JWT + localStorage cache
      const token = getToken();
      const user = localStorage.getItem('storia_user');
      if (token && user) {
        const userData = JSON.parse(user);
        setIsLoggedIn(true);
        setUserEmail(userData.email);
        // Load stats and saved stories from backend
        apiGetStats()
          .then(stats => {
            setUserStats(stats);
            if ((stats as any).emailVerified !== undefined) setEmailVerified((stats as any).emailVerified);
          })
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
        apiGetProfile()
          .then(profile => {
            setChildProfile(profile);
            localStorage.setItem('storia_child_profile', JSON.stringify(profile));
          })
          .catch(() => {
            const saved = localStorage.getItem('storia_child_profile');
            if (saved) setChildProfile(JSON.parse(saved));
          });
      } else {
        // Not logged in — use localStorage stats
        const storedStats = localStorage.getItem('storia_user_stats');
        if (storedStats) setUserStats(JSON.parse(storedStats));
      }
      detectLocation();
    };
    handleOAuthCallback();
  }, []);

  // Scroll to top on every view change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [view]);

  // Re-fetch stats from backend whenever the account or success page is opened
  // so the plan status is always fresh after a Stripe payment webhook has fired
  useEffect(() => {
    if (!isLoggedIn || !getToken()) return;
    if (view === 'account' || view === 'subscribe_success') {
      apiGetStats()
        .then(stats => {
          setUserStats(stats);
          if ((stats as any).emailVerified !== undefined) setEmailVerified((stats as any).emailVerified);
          localStorage.setItem('storia_user_stats', JSON.stringify(stats));
        })
        .catch(() => { });
    }
  }, [view]);

  useEffect(() => {
    localStorage.setItem('storia_current_lang', currentLang);
    if (!hasKey || currentLang === 'English') return;

    const cached = localStorage.getItem(`storia_trans_${currentLang}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Use cache if it has ≥180 keys (main-UI batch from Gemini returns ~210-230)
      if (Object.keys(parsed).length >= 180) {
        setDynamicT(prev => ({ ...prev, [currentLang]: parsed }));
        return;
      }
      // Stale/partial cache — remove and re-fetch
      localStorage.removeItem(`storia_trans_${currentLang}`);
    }

    const translateMainUI = async () => {
      const tid = ++translationIdRef.current;
      try {
        const englishStrings = ALL_TRANSLATIONS['English'];
        // Exclude long legal-section keys to keep the payload well under 10 s
        const mainKeys = Object.keys(englishStrings).filter(
          k => !k.startsWith('terms_s_') && !k.startsWith('privacy_s_')
        );
        const chunkObj: any = {};
        mainKeys.forEach(k => chunkObj[k] = (englishStrings as any)[k]);

        const BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';
        const res = await fetch(`${BASE}/api/gemini/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chunks: [chunkObj], targetLang: currentLang }),
        });
        if (!res.ok) throw new Error('Translation request failed');
        const result = await res.json() as Partial<UITranslations>;

        if (tid !== translationIdRef.current) return;

        if (Object.keys(result).length > 5) {
          localStorage.setItem(`storia_trans_${currentLang}`, JSON.stringify(result));
          setDynamicT(prev => ({ ...prev, [currentLang]: result }));
        }
      } catch (e) {
        console.error('Storia Magic Localization Failed', e);
      }
    };
    translateMainUI();
  }, [currentLang, hasKey]);

  // Lazy-load legal section translations only when Terms or Privacy is opened
  useEffect(() => {
    if (currentLang === 'English' || (view !== 'terms' && view !== 'privacy')) return;
    if (!hasKey) return;
    // Skip if already translated
    const cur = dynamicT[currentLang] as any;
    if (cur?.terms_s_accept_title) return;

    const translateLegal = async () => {
      try {
        const englishStrings = ALL_TRANSLATIONS['English'];
        const legalKeys = Object.keys(englishStrings).filter(
          k => k.startsWith('terms_s_') || k.startsWith('privacy_s_')
        );
        const chunkObj: any = {};
        legalKeys.forEach(k => chunkObj[k] = (englishStrings as any)[k]);

        const BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';
        const res = await fetch(`${BASE}/api/gemini/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chunks: [chunkObj], targetLang: currentLang }),
        });
        if (!res.ok) throw new Error('Legal translation failed');
        const result = await res.json() as Partial<UITranslations>;

        if (Object.keys(result).length > 5) {
          setDynamicT(prev => {
            const merged = { ...(prev[currentLang] || {}), ...result };
            localStorage.setItem(`storia_trans_${currentLang}`, JSON.stringify(merged));
            return { ...prev, [currentLang]: merged };
          });
        }
      } catch (e) {
        console.error('Legal page translation failed', e);
      }
    };
    translateLegal();
  }, [view, currentLang]);

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
  const { showToast } = useToast();

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!isLoggedIn || !getToken()) {
      // Clear any stale session that has no JWT
      if (isLoggedIn && !getToken()) {
        clearToken();
        localStorage.removeItem('storia_user');
        setIsLoggedIn(false);
        setUserEmail('');
      }
      setView('auth');
      return;
    }
    setSubscribeLoading(true);
    try {
      const { url } = await apiCreateCheckoutSession(plan);
      window.open(url, '_blank');
    } catch (err: any) {
      console.error('Stripe checkout error:', err);
      showToast(err.message || 'Could not start checkout. Please try again.', 'error');
      setSubscribeLoading(false);
    }
  };

  const handleAddStories = async (count: number) => {
    if (!isLoggedIn || !getToken()) {
      if (isLoggedIn && !getToken()) {
        clearToken(); localStorage.removeItem('storia_user');
        setIsLoggedIn(false); setUserEmail('');
      }
      setView('auth'); return;
    }
    setSubscribeLoading(true);
    try {
      const { url } = await apiCreateTopupSession(count);
      window.open(url, '_blank');
    } catch (err: any) {
      console.error('Topup checkout error:', err);
      showToast(err.message || 'Could not start checkout. Please try again.', 'error');
      setSubscribeLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!isLoggedIn || !getToken()) { setView('auth'); return; }
    try {
      await apiCancelSubscription();
      // Re-fetch stats so UI immediately shows 'cancelling' + end date
      const fresh = await apiGetStats();
      setUserStats(prev => ({ ...prev, ...fresh }));
      localStorage.setItem('storia_user_stats', JSON.stringify({ ...userStats, ...fresh }));
    } catch (err: any) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('token') || msg.includes('expired') || msg.includes('invalid')) {
        clearToken(); localStorage.removeItem('storia_user');
        setIsLoggedIn(false); setUserEmail(''); setView('auth');
      } else {
        throw err;
      }
    }
  };

  const handleManageBilling = async () => {
    if (!isLoggedIn || !getToken()) { setView('auth'); return; }
    // Open blank tab NOW (synchronously, tied to the click gesture) so browsers don't block it
    const newTab = window.open('', '_blank');
    try {
      const { url } = await apiCreatePortalSession();
      if (newTab) newTab.location.href = url;
      else window.open(url, '_blank'); // fallback if tab was blocked
    } catch (err: any) {
      if (newTab) newTab.close();
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('token') || msg.includes('expired') || msg.includes('invalid') || msg.includes('403')) {
        clearToken();
        localStorage.removeItem('storia_user');
        setIsLoggedIn(false);
        setUserEmail('');
        setView('auth');
      } else {
        throw err; // Let AccountPage surface it as a toast
      }
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
      setToken(result.token);
      if ((result as any).refreshToken) setRefreshToken((result as any).refreshToken);
      localStorage.setItem('storia_user', JSON.stringify({ email: result.user.email }));
      setIsLoggedIn(true);
      setUserEmail(result.user.email);
      // Migrate any session stories to the new account
      for (const s of sessionStories) {
        await apiSaveStory(s).catch(() => { });
      }
      setView('account');
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
      setToken(result.token);
      if ((result as any).refreshToken) setRefreshToken((result as any).refreshToken);
      localStorage.setItem('storia_user', JSON.stringify({ email: result.user.email }));
      setIsLoggedIn(true);
      setUserEmail(result.user.email);
      const [stories, stats] = await Promise.all([apiGetStories(), apiGetStats()]);
      setSavedStories(stories);
      setUserStats(stats);
      setView('account');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveProfile = async (profile: ChildProfile) => {
    setChildProfile(profile);
    localStorage.setItem('storia_child_profile', JSON.stringify(profile));
    await apiSaveProfile(profile);
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

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem('storia_user');
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
      else if (langCode === 'it') initialLangDetected = 'Italian';
      else if (langCode === 'de') initialLangDetected = 'German';
      else if (langCode === 'pl') initialLangDetected = 'Polish';
      else if (langCode === 'ru') initialLangDetected = 'Russian';
      else if (langCode === 'bg') initialLangDetected = 'Bulgarian';
      else if (langCode === 'nl') initialLangDetected = 'Dutch';
      else if (langCode === 'tr') initialLangDetected = 'Turkish';
      else if (langCode === 'ar') initialLangDetected = 'Arabic';
      else if (langCode === 'ja') initialLangDetected = 'Japanese';
      else if (langCode === 'ko') initialLangDetected = 'Korean';
      else if (['zh', 'zh-hans', 'zh-cn'].includes(langCode)) initialLangDetected = 'Chinese (Simplified)';
      else if (langCode === 'sv') initialLangDetected = 'Swedish';
      else if (langCode === 'fi') initialLangDetected = 'Finnish';
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
          setDetectedCountry(code);
          if (!skipDetection) {
            if (code === 'PT') initialLangDetected = 'Portuguese (Portugal)';
            else if (code === 'BR') initialLangDetected = 'Portuguese (Brazil)';
            else if (code === 'FR') initialLangDetected = 'French';
            else if (['MX', 'ES', 'AR', 'CL', 'CO', 'PE'].includes(code)) initialLangDetected = 'Spanish';
            else if (code === 'IT') initialLangDetected = 'Italian';
            else if (['DE', 'AT', 'CH'].includes(code)) initialLangDetected = 'German';
            else if (code === 'PL') initialLangDetected = 'Polish';
            else if (code === 'RU') initialLangDetected = 'Russian';
            else if (code === 'BG') initialLangDetected = 'Bulgarian';
            else if (['NL', 'BE'].includes(code)) initialLangDetected = 'Dutch';
            else if (code === 'TR') initialLangDetected = 'Turkish';
            else if (['EG', 'MA', 'SA', 'AE', 'QA', 'KW'].includes(code)) initialLangDetected = 'Arabic';
            else if (code === 'JP') initialLangDetected = 'Japanese';
            else if (code === 'KR') initialLangDetected = 'Korean';
            else if (['CN', 'TW', 'HK', 'SG'].includes(code)) initialLangDetected = 'Chinese (Simplified)';
            else if (['SE', 'NO', 'DK'].includes(code)) initialLangDetected = 'Swedish';
            else if (code === 'FI') initialLangDetected = 'Finnish';
          }
        }
      }
    } catch (e) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes('Europe/Lisbon')) region = 'portugal';
      else if (tz.includes('America/Sao_Paulo')) region = 'brazil';
      else if (tz.includes('Europe/Paris')) region = 'france';
      if (!skipDetection) {
        if (tz.includes('Europe/Lisbon')) { region = 'portugal'; initialLangDetected = 'Portuguese (Portugal)'; }
        else if (tz.includes('America/Sao_Paulo')) { region = 'brazil'; initialLangDetected = 'Portuguese (Brazil)'; }
        else if (tz.includes('Europe/Paris')) { region = 'france'; initialLangDetected = 'French'; }
        else if (tz.includes('Europe/Rome') || tz.includes('Europe/Vatican')) initialLangDetected = 'Italian';
        else if (tz.includes('Europe/Berlin') || tz.includes('Europe/Vienna')) initialLangDetected = 'German';
        else if (tz.includes('Europe/Warsaw')) initialLangDetected = 'Polish';
        else if (tz.includes('Europe/Moscow')) initialLangDetected = 'Russian';
        else if (tz.includes('Europe/Sofia')) initialLangDetected = 'Bulgarian';
        else if (tz.includes('Europe/Amsterdam') || tz.includes('Europe/Brussels')) initialLangDetected = 'Dutch';
        else if (tz.includes('Europe/Istanbul')) initialLangDetected = 'Turkish';
        else if (tz.includes('Asia/Tokyo')) initialLangDetected = 'Japanese';
        else if (tz.includes('Asia/Seoul')) initialLangDetected = 'Korean';
        else if (tz.includes('Asia/Shanghai') || tz.includes('Asia/Hong_Kong')) initialLangDetected = 'Chinese (Simplified)';
        else if (tz.includes('Europe/Stockholm') || tz.includes('Europe/Oslo') || tz.includes('Europe/Copenhagen')) initialLangDetected = 'Swedish';
        else if (tz.includes('Europe/Helsinki')) initialLangDetected = 'Finnish';
      }
    }

    setDetectedRegion(region);
    if (!skipDetection) {
      setCurrentLang(initialLangDetected);
    }
  };

  // Derive display currency from detected country code
  const currencySymbol = (() => {
    if (detectedCountry === 'GB') return '£';
    if (detectedCountry === 'US') return '$';
    if (detectedCountry === 'CA') return 'CA$';
    if (detectedCountry === 'AU') return 'A$';
    return '€'; // default for EU and rest of world
  })();

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

  if (showDisclaimer) {
    return <TesterDisclaimer translations={t} onProceed={() => { localStorage.setItem('storia_tester_seen', '1'); setShowDisclaimer(false); }} />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* GLOBAL LOADING OVERLAY */}
      {loading && (() => {
        const FACTS = [
          { emoji: '🧠', fact: t.loader_fact_1 },
          { emoji: '😴', fact: t.loader_fact_2 },
          { emoji: '💛', fact: t.loader_fact_3 },
          { emoji: '🔁', fact: t.loader_fact_4 },
          { emoji: '🌍', fact: t.loader_fact_5 },
          { emoji: '🎙️', fact: t.loader_fact_6 },
          { emoji: '✨', fact: t.loader_fact_7 },
          { emoji: '🌙', fact: t.loader_fact_8 },
          { emoji: '❤️', fact: t.loader_fact_9 },
          { emoji: '🐻', fact: t.loader_fact_10 },
        ];

        return (
          <StoryLoaderOverlay
            facts={FACTS}
            loadingStatus={loadingStatus}
            onCancel={() => { generationIdRef.current++; setLoading(false); }}
            cancelLabel={t.cancel}
            craftedLabel={t.loader_crafted}
            didYouKnow={t.loader_did_you_know}
          />
        );
      })()}



      <div className="flex-1">

        {/* ── Global Nav — hidden only when the story player is actively playing ── */}
        {(!story || view !== 'app') && (<>

          {/* ── DESKTOP (lg+): top centred two-row nav ── */}
          <nav className={`hidden lg:flex fixed top-0 left-0 w-full z-[100] flex-col items-center animate-in fade-in duration-300 ${view === 'landing' ? 'bg-gradient-to-b from-black/70 via-black/30 to-transparent backdrop-blur-[2px] border-b-0' : 'bg-black/80 backdrop-blur-md border-b border-white/5'}`}>
            {/* Row 1 — Logo centred */}
            <div className="w-full flex justify-center pt-5 pb-5">
              <button onClick={() => setView('landing')} className="text-2xl font-black text-white tracking-tighter font-borel hover:text-indigo-300 transition-colors">
                Storia<sup className="text-[0.5em] ml-0.5">©</sup>
              </button>
            </div>
            {/* Row 2 — Nav items centred */}
            <div className="w-full flex justify-center items-center gap-2 flex-wrap px-4 pb-3">
              {!['seed', 'refinement'].includes(view) && !(view === 'app' && !story) && (
                <button id="nav-create-story" onClick={() => { setStory(null); setView('app'); }} className="px-4 md:px-6 py-2 rounded-full bg-white text-black hover:bg-zinc-200 transition-all text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                  ✨ {t.landing_button || 'Create a Story'}
                </button>
              )}
              {view !== 'public_library' && <button onClick={() => setView('public_library')} className="flex px-4 md:px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-white font-black uppercase tracking-[0.1em] text-[10px] md:text-xs items-center gap-2">
                📚 {t.public_library_link || 'Public Library'}
              </button>}
              {isLoggedIn && (
                <button id="nav-my-library" onClick={() => setView('library')} className="flex px-4 md:px-5 py-2 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 transition-all border border-indigo-500/40 text-indigo-300 font-black uppercase tracking-[0.1em] text-[10px] md:text-xs items-center gap-2">
                  🌙 {t.library_title || 'My Library'}
                </button>
              )}
              {view !== 'coloring_book' && <button onClick={() => setView('coloring_book')} className="flex px-4 md:px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-white font-black uppercase tracking-[0.1em] text-[10px] md:text-xs items-center gap-2">
                🖍️ Coloring Lab
              </button>}
              {view !== 'account' && (isLoggedIn ? (
                <button onClick={() => setView('account')} className="flex items-center gap-2 px-4 md:px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-white font-black uppercase tracking-[0.1em] text-[10px] md:text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {t.account_title || 'My Account'}
                </button>
              ) : (
                <button onClick={() => setView('auth')} className="px-4 md:px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-white font-black uppercase tracking-[0.1em] text-[10px] md:text-xs">
                  {t.button_create_account || 'Create Account / Sign In'}
                </button>
              ))}
              <button onClick={() => setView('help')} className="flex items-center gap-2 px-4 md:px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-white font-black uppercase tracking-[0.1em] text-[10px] md:text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Help
              </button>
              <button onClick={() => { setPaywallScreen('plus'); setView('paywall'); }} className="group px-3 md:px-4 py-2 rounded-full bg-indigo-600/20 hover:bg-indigo-600 transition-all border border-indigo-500/40 text-indigo-400 hover:text-white font-black text-xs flex items-center gap-1.5">
                <span className="text-base">💎</span>
                <span className="uppercase tracking-widest text-[10px]">{t.button_membership || 'Plus'}</span>
              </button>
            </div>
          </nav>

          {/* ── MOBILE / TABLET (< lg): fixed bottom icon tab bar ── */}
          <nav className={`lg:hidden fixed bottom-0 left-0 w-full z-[100] flex justify-around items-center px-2 py-2 bg-black/90 backdrop-blur-md border-t border-white/10`}
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}>

            {/* Storia logo — centre tap goes home */}
            <button onClick={() => setView('landing')} className="flex flex-col items-center gap-0.5 text-white/80 hover:text-white transition-colors" title="Home">
              <span className="text-lg font-black font-borel leading-none">S</span>
              <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Home</span>
            </button>

            {/* Create Story */}
            {!['seed', 'refinement'].includes(view) && !(view === 'app' && !story) && (
              <button onClick={() => { setStory(null); setView('app'); }} className={`flex flex-col items-center gap-0.5 transition-colors ${view === 'app' ? 'text-white' : 'text-white/60 hover:text-white'}`} title="Create Story">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Create</span>
              </button>
            )}

            {/* Public Library */}
            {view !== 'public_library' && (
              <button onClick={() => setView('public_library')} className={`flex flex-col items-center gap-0.5 transition-colors text-white/60 hover:text-white`} title="Public Library">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Library</span>
              </button>
            )}

            {/* My Library (logged in) */}
            {isLoggedIn && (
              <button onClick={() => setView('library')} className={`flex flex-col items-center gap-0.5 transition-colors ${view === 'library' ? 'text-indigo-400' : 'text-white/60 hover:text-indigo-300'}`} title="My Library">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Mine</span>
              </button>
            )}

            {/* Coloring Lab */}
            {view !== 'coloring_book' && (
              <button onClick={() => setView('coloring_book')} className={`flex flex-col items-center gap-0.5 transition-colors text-white/60 hover:text-white`} title="Coloring Lab">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Color</span>
              </button>
            )}

            {/* Account / Auth */}
            {view !== 'account' && (isLoggedIn ? (
              <button onClick={() => setView('account')} className={`flex flex-col items-center gap-0.5 transition-colors ${view === 'account' ? 'text-white' : 'text-white/60 hover:text-white'}`} title="My Account">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Account</span>
              </button>
            ) : (
              <button onClick={() => setView('auth')} className="flex flex-col items-center gap-0.5 text-indigo-400 hover:text-indigo-300 transition-colors" title="Sign In">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Sign In</span>
              </button>
            ))}

            {/* Plus */}
            <button onClick={() => { setPaywallScreen('plus'); setView('paywall'); }} className="flex flex-col items-center gap-0.5 text-indigo-400 hover:text-indigo-300 transition-colors" title="Plus">
              <span className="text-lg leading-none">💎</span>
              <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Plus</span>
            </button>

            {/* Help */}
            <button onClick={() => setView('help')} className={`flex flex-col items-center gap-0.5 transition-colors ${view === 'help' ? 'text-white' : 'text-white/60 hover:text-white'}`} title="Help">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Help</span>
            </button>
          </nav>
        </>)}

        {/* Offset for fixed nav */}
        {(!story || view !== 'app') && view !== 'landing' && (
          <>
            <div className="hidden lg:block h-24" /> {/* desktop top nav spacer */}
            <div className="lg:hidden h-4" />           {/* mobile: content doesn't need top spacer */}
          </>
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
              initialData={{
                ...savedPersonalization,
                // Prepopulate from saved child profile (child name + age → storyMode)
                ...(childProfile.childName ? { childName: childProfile.childName } : {}),
                ...(childProfile.childAge === 2 ? { storyMode: 'toddler' as const } : {}),
                ...(childProfile.childAge === 4 ? { storyMode: 'preschool' as const } : {}),
              }}
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
                {authMode === 'register' ? t.button_create_account : t.auth_welcome_back}
              </h2>
              <p className="text-zinc-400 text-sm">
                {authMode === 'register' ? t.library_save_cta : t.auth_sign_in_desc}
              </p>
              {authError && (
                <p className="text-red-400 text-sm font-semibold bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-2">{authError}</p>
              )}

              {/* ── OAuth buttons ── */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  className="w-full flex items-center justify-center gap-3 py-3.5 bg-white text-zinc-900 font-bold rounded-2xl hover:bg-zinc-100 transition-all shadow-sm text-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => signInWithApple()}
                  className="w-full flex items-center justify-center gap-3 py-3.5 bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition-all border border-zinc-700 text-sm"
                >
                  <svg width="17" height="20" viewBox="0 0 170 209" xmlns="http://www.w3.org/2000/svg" fill="white">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375a25.222 25.222 0 0 1-.188-3.07c0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.252 8.99-3.497 13.1-3.71.12 1.017.17 2.033.17 3.041z" />
                  </svg>
                  Continue with Apple
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-700" />
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-zinc-700" />
              </div>

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
                <input required name="email" type="email" placeholder={t.auth_email_placeholder} className="w-full px-6 py-4 rounded-2xl bg-zinc-800 border-2 border-zinc-700 text-white focus:border-indigo-500 focus:outline-none" />
                <input required name="password" type="password" placeholder={t.auth_password_placeholder} minLength={6} className="w-full px-6 py-4 rounded-2xl bg-zinc-800 border-2 border-zinc-700 text-white focus:border-indigo-500 focus:outline-none" />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading ? t.auth_please_wait : (authMode === 'register' ? t.button_create_account : t.auth_sign_in_button)}
                </button>
              </form>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => { setAuthMode(m => m === 'register' ? 'login' : 'register'); setAuthError(null); }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm"
                >
                  {authMode === 'register' ? t.auth_already_have : t.auth_new_here}
                </button>
                <button onClick={() => setView('app')} className="text-zinc-500 hover:text-white font-bold text-sm">{t.terms_back}</button>
              </div>
            </div>
          </div>
        )}
        {view === 'settings' && <SettingsPage userStats={userStats} translations={t} token={getToken()} onBack={() => setView('app')} />}
        {view === 'privacy' && <PrivacyPolicyPage translations={t} onBack={() => setView('landing')} onGoToTerms={() => setView('terms')} />}
        {view === 'terms' && <TermsPage translations={t} onBack={() => setView('landing')} onGoToPrivacy={() => setView('privacy')} />}
        {view === 'about' && <AboutPage translations={t} onBack={() => setView('landing')} />}
        {view === 'paywall' && (
          <Paywall
            screen={paywallScreen}
            translations={t}
            userStats={userStats}
            currencySymbol={currencySymbol}
            onSubscribe={handleSubscribe}
            onAddStories={handleAddStories}
            onContinue={() => setView('app')}
            onBack={() => setView('app')}
            onReplay={() => setView('library')}
          />
        )}

        {subscribeLoading && (
          <div className="fixed inset-0 z-[600] bg-black/80 flex items-center justify-center">
            <div className="text-white text-center space-y-6">
              <p className="text-2xl font-black animate-pulse">{t.checkout_redirecting}</p>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">{t.checkout_powered_by}</p>
              <button
                onClick={() => setSubscribeLoading(false)}
                className="mt-4 px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-widest transition-all"
              >
                {t.cancel || 'Cancel'}
              </button>
            </div>
          </div>
        )}
        {view === 'account' && <AccountPage translations={t} email={userEmail} emailVerified={emailVerified} childProfile={childProfile} plan={userStats.plan} monthlyUsed={userStats.monthlyUsed} monthlyLimit={userStats.monthlyLimit} subscriptionStatus={userStats.subscriptionStatus} subscriptionEndsAt={userStats.subscriptionEndsAt} onResendVerification={apiResendVerification} onUpdateEmail={handleUpdateEmail} onSaveProfile={handleSaveProfile} onDeleteAccount={handleDeleteAccount} onLogout={handleLogout} onManageBilling={handleManageBilling} onSubscribe={handleSubscribe} onCancelSubscription={handleCancelSubscription} onGoToLibrary={() => setView('library')} onBack={() => setView('app')} />}
        {view === 'help' && <HelpPage translations={t} userEmail={userEmail} onBack={() => setView(isLoggedIn ? 'app' : 'landing')} />}
        {view === 'verify' && <VerifyEmailPage token={verifyToken} onContinue={() => { setEmailVerified(true); window.history.replaceState({}, '', '/'); setView('app'); }} />}
        {view === 'library' && <LibraryPage translations={t} sessionStories={sessionStories} savedStories={savedStories} isLoggedIn={isLoggedIn} onSelectStory={(s) => { setStory(s); setView('app'); }} onSaveStory={saveToAccount} onRateStory={async (id, rating) => { await apiRateStory(id, rating); setSavedStories(prev => prev.map(s => s.id === id ? { ...s, rating } : s)); }} onBack={() => setView('app')} onAuth={() => setView('auth')} />}
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
              {story && <StoryPlayer translations={t} story={story} isLoggedIn={isLoggedIn} onAuth={() => setView('auth')} onClose={() => { generationIdRef.current++; setStory(null); setView('app'); }} onSave={() => saveToAccount(story)} onRate={story.isSaved ? async (rating) => { await apiRateStory(story.id, rating); setSavedStories(prev => prev.map(s => s.id === story.id ? { ...s, rating } : s)); } : undefined} />}
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
            <div className="flex flex-col gap-1"><p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t.footer_region}</p><div className="relative"><select value={currentLang} onChange={(e) => { localStorage.setItem('storia_lang_user_explicit', '1'); setCurrentLang(e.target.value); }} className="bg-zinc-900 text-white text-xs font-bold py-3 pl-4 pr-10 rounded-xl border border-zinc-800 appearance-none cursor-pointer focus:outline-none focus:border-indigo-500">{SUPPORTED_LANGUAGES.map(lang => { const langKey = `lang_${lang.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '')}` as keyof typeof t; return (<option key={lang} value={lang}>{(t[langKey] as string) || lang}</option>); })}</select><div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></div></div></div>

            <button onClick={() => setView('public_library')} className="text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>{t.public_library_link}</button>
            <button onClick={() => setView('about')} className="text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{t.about_link}</button>
            <button onClick={() => setView('terms')} className="text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">{t.terms_link}</button>
            <button onClick={() => setView('privacy')} className="text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">{t.privacy_link}</button>
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
