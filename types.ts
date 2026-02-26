
export type StoryMode = 'toddler' | 'preschool';
export type VoiceGender = 'female' | 'male' | 'neutral';
export type VoiceStyle = 'clear' | 'whisper';
export type StoryLength = number; // Minutes
export type ScreenMode = 'dark' | 'visuals';
export type RepeatVariation = 'same_story' | 'remixed_story';
export type Soundscape = 'none' | 'rain' | 'forest' | 'ocean' | 'wind';
export type StoryPace = 'slow' | 'medium';
export type StoryStyle = 'regular' | 'rhymes';

export type Region = 'global' | 'mexico' | 'japan' | 'india' | 'nordic' | 'france' | 'brazil' | 'egypt' | 'china' | 'greece' | 'australia' | 'kenya' | 'usa' | 'italy' | 'germany' | 'portugal' | 'canada' | 'ireland' | 'korea' | 'morocco' | 'peru' | 'thailand' | 'ukraine' | 'custom' | 'finland' | 'bulgaria' | 'netherlands' | 'turkey' | 'vietnam' | 'israel' | 'poland' | 'indonesia' | 'russia' | 'sweden' | 'denmark' | 'norway' | 'argentina' | 'switzerland' | 'south_africa' | 'singapore' | 'romania' | 'hungary' | 'czech_republic' | 'philippines' | 'malaysia' | 'chile' | 'new_zealand' | 'colombia';

export interface VoiceProfile {
  matchedVoice: string;
  personalityDesc: string;
}

export interface UserStats {
  plan: 'free' | 'plus';
  monthlyUsed: number;
  monthlyLimit: number;
  bundlesRemaining: number;
  totalGenerated: number;
  nextResetDate: string;
}

export interface UITranslations {
  [key: string]: string | undefined; // Allow dynamic lookups for theme keys
  // About
  about_link: string;
  about_title: string;
  about_content: string;
  about_signature: string;

  // Safety
  error_safety_title: string;
  error_safety_desc: string;
  error_safety_button: string;

  // Landing
  landing_subtitle: string;
  landing_slogan: string;
  landing_button: string;
  feat1_title: string;
  feat1_desc: string;
  feat2_title: string;
  feat2_desc: string;
  feat3_title: string;
  feat3_desc: string;
  landing_how_title: string;
  landing_how_step1_title: string;
  landing_how_step1_desc: string;
  landing_how_step2_title: string;
  landing_how_step2_desc: string;
  landing_how_step3_title: string;
  landing_how_step3_desc: string;
  landing_features_title: string;
  landing_feat_voice_title: string;
  landing_feat_voice_desc: string;
  landing_feat_culture_title: string;
  landing_feat_culture_desc: string;
  landing_feat_sleep_title: string;
  landing_feat_sleep_desc: string;
  landing_feat_modes_title: string;
  landing_feat_modes_desc: string;
  landing_feat_lang_title: string;
  landing_feat_lang_desc: string;
  landing_feat_replays_title: string;
  landing_feat_replays_desc: string;
  landing_feat_whisper_title: string;
  landing_feat_whisper_desc: string;
  landing_feat_styles_title: string;
  landing_feat_styles_desc: string;
  landing_feat_rhymes_title: string;
  landing_feat_rhymes_desc: string;
  landing_feat_pace_title: string;
  landing_feat_pace_desc: string;
  landing_feat_moderation_title: string;
  landing_feat_moderation_desc: string;
  landing_feat_pdf_title: string;
  landing_feat_pdf_desc: string;
  landing_cta_title: string;
  landing_cta_subtitle: string;

  // Refinement Page
  refine_title: string;
  refine_subtitle: string;
  refine_visual_style: string;
  refine_sleepy_vis: string;
  refine_times: string;
  refine_button: string;
  refine_back: string;

  // Wizard Steps
  step_1_label: string;
  step_2_label: string;
  step_3_label: string;
  pers_header: string;
  pers_subtitle: string;
  seed_header: string;
  seed_subtitle: string;

  // Carousel Stories
  landing_carousel_title: string;
  landing_carousel_subtitle: string;
  story_nico_title: string;
  story_nico_region: string;
  story_nico_desc: string;
  story_nico_tags: string;
  story_nico_sample_text: string;
  story_lily_title: string;
  story_lily_region: string;
  story_lily_desc: string;
  story_lily_tags: string;
  story_lily_sample_text: string;
  story_day_title: string;
  story_day_region: string;
  story_day_desc: string;
  story_day_tags: string;
  story_day_sample_text: string;

  // Testimonials
  landing_testimonials_title: string;
  testimonial_1_names: string;
  testimonial_1_loc: string;
  testimonial_1_quote: string;
  testimonial_2_names: string;
  testimonial_2_loc: string;
  testimonial_2_quote: string;
  testimonial_3_names: string;
  testimonial_3_loc: string;
  testimonial_3_quote: string;

  // Form
  form_header: string;
  form_subtitle: string;
  label_region: string;
  label_theme: string;
  label_global_theme: string;
  label_child_name: string;
  placeholder_child_name: string;
  label_friend_names: string;
  placeholder_friend_names: string;
  label_keywords: string;
  placeholder_keywords: string;
  label_language: string;
  label_mode: string;
  label_voice: string;
  label_length: string;
  label_experience: string;
  label_soundscape: string;
  label_pace: string;
  label_rhyme_mode: string;
  label_sleep_fade: string;
  label_nightly_routine: string;
  label_repeats_remixes: string;
  label_repeat_count: string;
  label_variation_type: string;
  label_meditation: string;
  desc_meditation: string;
  voice_cloned: string;
  voice_record: string;
  voice_stop: string;
  voice_matching: string;
  voice_success: string;
  voice_matched: string;
  voice_lab_title: string;
  voice_lab_subtitle: string;
  voice_lab_desc: string;
  button_submit: string;
  loading_magic: string;
  loader_subtext: string;
  form_free_remaining: string;
  button_membership: string;

  // Themes
  gt_none: string;
  gt_animals: string;
  gt_biology: string;
  gt_diversity: string;
  gt_food: string;
  gt_nature: string;
  gt_people: string;
  gt_science: string;
  gt_social: string;
  gt_society: string;
  gt_technology: string;
  gt_transportation: string;
  gt_weather: string;

  // Player
  player_menu: string;
  player_now_playing: string;
  player_episode: string;
  player_painting: string;
  player_voicing: string;
  player_save_to_library: string;
  player_saved: string;
  cta_coloring_title: string;
  cta_coloring_desc: string;
  cta_coloring_button: string;
  cta_coloring_skip: string;

  // Library
  library_title: string;
  library_empty: string;
  library_recent: string;
  library_saved: string;
  library_save_cta: string;
  library_account_required: string;
  library_read_script: string;
  script_title: string;
  button_create_account: string;
  button_download_pdf: string;
  public_library_title: string;
  public_library_subtitle: string;
  public_library_link: string;
  public_library_explore_cta: string;

  // Coloring Book
  coloring_book_title: string;
  coloring_book_subtitle: string;
  coloring_book_download: string;

  // Account
  account_title: string;
  label_email: string;
  button_save_changes: string;
  section_danger_zone: string;
  delete_account_title: string;
  delete_account_desc: string;
  button_delete_confirm: string;
  delete_confirm_prompt: string;
  account_updated: string;
  account_deleted: string;
  account_child_section: string;
  account_child_optional: string;
  account_child_name: string;
  account_child_age: string;
  account_child_avatar: string;
  account_child_saved: string;
  account_billing: string;
  account_billing_desc: string;
  account_support: string;
  account_logout: string;
  account_logout_desc: string;

  // Setup
  setup_title: string;
  setup_desc: string;
  setup_button: string;

  // Options
  opt_visuals: string;
  opt_dark: string;
  opt_minutes: string;
  opt_years: string;
  opt_toddler: string;
  opt_preschool: string;
  opt_female: string;
  opt_male: string;
  opt_neutral: string;
  opt_clear: string;
  opt_whisper: string;
  opt_silent: string;
  opt_sounds: string;
  opt_none: string;
  opt_slow: string;
  opt_medium: string;
  opt_regular: string;
  opt_rhymes: string;
  opt_on: string;
  opt_off: string;
  opt_duration_short: string;
  opt_duration_medium: string;
  opt_duration_long: string;
  opt_exact_repeat: string;
  opt_magical_remix: string;
  desc_remix_magical: string;
  desc_remix_exact: string;

  // Sounds
  sound_rain: string;
  sound_forest: string;
  sound_ocean: string;
  sound_wind: string;

  // Shared
  cancel: string;
  close: string;
  detected_label: string;
  footer_region: string;
  footer_for_parents: string;
  footer_created_by: string;
  footer_built_with: string;
  error_story: string;

  // Terms & Privacy
  terms_link: string;
  terms_title: string;
  terms_ai_gen_title: string;
  terms_ai_gen_desc: string;
  terms_data_title: string;
  terms_data_desc: string;
  terms_moderation_title: string;
  terms_moderation_desc: string;
  terms_ownership_title: string;
  terms_ownership_desc: string;
  terms_back: string;
  privacy_link: string;
  privacy_title: string;
  privacy_intro: string;
  privacy_usage_title: string;
  privacy_usage_desc: string;
  privacy_audio_title: string;
  privacy_audio_desc: string;
  privacy_security_title: string;
  privacy_security_desc: string;

  // Paywall
  pw_continue: string;
  pw_intro_title: string;
  pw_intro_subtitle: string;
  pw_intro_feat1: string;
  pw_intro_feat2: string;
  pw_intro_feat3: string;
  pw_intro_feat4: string;
  pw_plus_title: string;
  pw_plus_body: string;
  pw_plus_feat1: string;
  pw_plus_feat2: string;
  pw_plus_feat3: string;
  pw_plus_feat4: string;
  pw_plus_feat5: string;
  pw_keep_exploring: string;
  pw_promo_label: string;
  pw_promo_desc: string;
  pw_subscribe_cta: string;
  pw_limit_title: string;
  pw_limit_body: string;
  pw_limit_replay: string;
  pw_limit_reset: string;
  pw_topup_title: string;
  pw_topup_subtitle: string;
  pw_bundle_5_title: string;
  pw_bundle_5_desc: string;
  pw_bundle_15_title: string;
  pw_bundle_15_desc: string;
  pw_bundle_30_title: string;
  pw_bundle_30_desc: string;
  pw_bundle_footer: string;
  pw_add_stories: string;
  pw_not_now: string;
  pw_plan_active: string;
  pw_plan_used: string;
  pw_plan_reset: string;
  pw_plan_extras: string;
  pw_plan_change: string;
  pw_plan_yearly: string;
  pw_plan_restore: string;
  pw_trust_tagline: string;
  paywall_monthly_title: string;
  paywall_monthly_price: string;
  paywall_yearly_title: string;
  paywall_yearly_price: string;
  paywall_yearly_discount: string;
  paywall_button: string;

  // Tester Disclaimer
  tester_badge: string;
  tester_title: string;
  tester_desc: string;
  tester_follow_title: string;
  tester_follow_desc: string;
  tester_instagram_cta: string;
  tester_feedback_cta: string;
  tester_cta: string;

  // Auth form
  auth_welcome_back: string;
  auth_sign_in_desc: string;
  auth_sign_in_button: string;
  auth_already_have: string;
  auth_new_here: string;
  auth_please_wait: string;
  auth_email_placeholder: string;
  auth_password_placeholder: string;

  // Checkout / Stripe
  checkout_redirecting: string;
  checkout_powered_by: string;

  // Library card actions
  lib_account_active: string;
  lib_guest_session: string;
  lib_listen: string;
  lib_script: string;
  lib_color: string;

  // Story player controls
  player_visuals_on: string;
  player_audio_only: string;
  player_fullscreen: string;
  player_pdf: string;

  // Filters
  filter_all_regions: string;
  filter_all_ages: string;

  // Settings
  settings_your_plan: string;
  settings_plus_plan: string;
  settings_basic_plan: string;
  settings_monthly: string;
  settings_yearly: string;
  settings_per_month: string;
  settings_per_year: string;
  settings_upgrade_title: string;
  settings_upgrade_desc: string;
  settings_redirecting: string;
  settings_plus_thanks: string;
  settings_remaining: string;
  settings_copyright: string;

  // Nav
  nav_home_label: string;

  // Landing/form banners
  landing_early_access: string;
  form_early_access: string;
  landing_reveal_button: string;
  landing_painting_magic: string;
  landing_promo_price: string;
  landing_promo_instagram: string;
}

/**
 * Interface representing a single visual scene within an episode.
 */
export interface VisualScene {
  scene: number;
  caption: string;
  image_prompt: string;
  imageUrl?: string;
  start_time_pct: number;
}

/**
 * Interface representing a chapter or episode of a story.
 */
export interface Episode {
  episode_title: string;
  logline: string;
  outline: string[];
  audio_direction: {
    voice_gender: string;
    voice_style: string;
    pace: string;
    tone: string;
  };
  visual_plan: VisualScene[];
  ssml_narration: string;
  closing_line: string;
  next_episode_hook?: string;
  audioBlobUrl?: string;
}

/**
 * Interface representing the full generated story result.
 */
export interface StoryResult {
  id: string;
  app_title: string;
  story_mode: StoryMode;
  language: string;
  keywords_used: string[];
  main_character_description: string;
  episodes: Episode[];
  autoplay_next?: boolean;
  soundscape?: Soundscape;
  screen_mode?: ScreenMode;
  sleep_fade?: boolean;
  timestamp: number;
  isSaved: boolean;
  soundscapeBlobUrl?: string;
}

/**
 * Interface representing the user's input configuration for a new story.
 */
export interface StoryConfig {
  keywords: string;
  childName?: string;
  friendNames?: string;
  region: Region;
  customRegionName?: string;
  storyMode: StoryMode;
  language: string;
  voiceGender: VoiceGender;
  voiceStyle: VoiceStyle;
  pace: StoryPace;
  rhymeMode: StoryStyle;
  storyLength: number;
  repeat: boolean;
  repeatCount: number;
  repeatVariation: RepeatVariation;
  autoplayNext: boolean;
  screenMode: ScreenMode;
  soundscape: Soundscape;
  sleepFade: boolean;
  parentVoiceEnabled: boolean;
  parentVoiceProfile?: VoiceProfile;
  theme: string;
  globalTheme: string;
  meditationEnabled: boolean;
}

declare global {
  interface Window {
    aistudio?: {
      openSelectKey: () => Promise<void>;
      hasSelectedApiKey: () => Promise<boolean>;
    };
  }
}
