
import React, { useState, useEffect, useRef } from 'react';
import { UITranslations } from '../types';
import { StoryService } from '../services/gemini';
import { decodePCMToBuffer, getSharedAudioContext } from '../services/audio';

interface LandingPageProps {
  onStart: () => void;
  onJoinMembership: () => void;
  onExplorePublic: () => void;
  onGoToColoring: () => void;
  translations: UITranslations;
  currentLang: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onJoinMembership, onExplorePublic, onGoToColoring, translations: t, currentLang }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [revealedImages, setRevealedImages] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingAudioId, setLoadingAudioId] = useState<number | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [audioBuffers, setAudioBuffers] = useState<Record<number, AudioBuffer>>({});

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonialTimerRef = useRef<number | null>(null);

  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const featuredStories = [
    {
      id: 1,
      title: t.story_nico_title,
      region: t.story_nico_region,
      desc: t.story_nico_desc,
      icon: "🦖",
      subIcon: "🐕",
      color: "from-emerald-600 to-teal-900",
      tags: t.story_nico_tags?.split(',').map(s => s.trim()) || [],
      prompt: "A small boy named Nico and his loyal dog Taco watching mechanical dinosaurs race vintage cars in the misty Sintra hills.",
      styleRegion: "portugal" as const,
      charDesc: "A small boy with messy brown hair wearing a yellow rain jacket.",
      sampleText: t.story_nico_sample_text,
      voice: "Fenrir",
      lang: currentLang
    },
    {
      id: 2,
      title: t.story_lily_title,
      region: t.story_lily_region,
      desc: t.story_lily_desc,
      icon: "🦄",
      subIcon: "🩰",
      color: "from-pink-500 to-purple-800",
      tags: t.story_lily_tags?.split(',').map(s => s.trim()) || [],
      prompt: "A little girl named Lily dancing ballet with shimmering crystal unicorns on a starlight stage in the Balkan mountains.",
      styleRegion: "bulgaria" as const,
      charDesc: "A little girl with blonde braids wearing a shimmering white tutu.",
      sampleText: t.story_lily_sample_text,
      voice: "Kore",
      lang: currentLang
    },
    {
      id: 3,
      title: t.story_day_title,
      region: t.story_day_region,
      desc: t.story_day_desc,
      icon: "🎶",
      subIcon: "🏰",
      color: "from-orange-500 to-red-800",
      tags: t.story_day_tags?.split(',').map(s => s.trim()) || [],
      prompt: "A boy named Day singing in a Maharaja's garden, with golden birds appearing from his musical notes as he sings.",
      styleRegion: "india" as const,
      charDesc: "A young boy with dark curly hair wearing traditional colorful Indian silk clothes.",
      sampleText: t.story_day_sample_text,
      voice: "Puck",
      lang: currentLang
    }
  ];

  const testimonials = [
    {
      id: 1,
      names: t.testimonial_1_names,
      location: t.testimonial_1_loc,
      quote: t.testimonial_1_quote,
      icon: "🏔️"
    },
    {
      id: 2,
      names: t.testimonial_2_names,
      location: t.testimonial_2_loc,
      quote: t.testimonial_2_quote,
      icon: "🏠"
    },
    {
      id: 3,
      names: t.testimonial_3_names,
      location: t.testimonial_3_loc,
      quote: t.testimonial_3_quote,
      icon: "🇵🇹"
    }
  ];

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) { }
      audioSourceRef.current = null;
    }
    setPlayingAudioId(null);
  };

  const playBuffer = async (id: number, buffer: AudioBuffer) => {
    stopAudio();
    const ctx = getSharedAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      setPlayingAudioId(prev => (prev === id ? null : prev));
    };
    source.start(0);
    audioSourceRef.current = source;
    setPlayingAudioId(id);
  };

  const handleRevealMagic = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const service = new StoryService();

    try {
      const results = await Promise.all(
        featuredStories.map(async (story) => {
          const url = await service.generateSceneImage(
            story.prompt,
            'preschool',
            story.styleRegion,
            story.charDesc
          );
          return { id: story.id, url };
        })
      );

      const newImages: Record<number, string> = {};
      results.forEach(res => {
        newImages[res.id] = res.url;
      });
      setRevealedImages(newImages);
    } catch (error) {
      console.error("Failed to reveal magic", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlaySample = async (story: typeof featuredStories[0], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (playingAudioId === story.id) {
      stopAudio();
      return;
    }

    if (loadingAudioId === story.id) return;

    if (audioBuffers[story.id]) {
      playBuffer(story.id, audioBuffers[story.id]);
      return;
    }

    setLoadingAudioId(story.id);
    const service = new StoryService();
    try {
      const base64 = await service.generateTTS(
        story.sampleText || "",
        story.voice,
        'clear',
        story.lang,
        'preschool',
        'medium'
      );
      const buffer = await decodePCMToBuffer(base64);
      setLoadingAudioId(null);
      if (buffer) {
        setAudioBuffers(prev => ({ ...prev, [story.id]: buffer }));
        playBuffer(story.id, buffer);
      }
    } catch (error) {
      console.error("Audio sample failed", error);
      setLoadingAudioId(null);
    }
  };

  // Clear buffers and stop audio when language changes
  useEffect(() => {
    stopAudio();
    setAudioBuffers({});
  }, [currentLang]);

  // Testimonial auto-slide
  useEffect(() => {
    testimonialTimerRef.current = window.setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 7000);
    return () => {
      if (testimonialTimerRef.current) clearInterval(testimonialTimerRef.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center bg-slate-950 select-none overflow-x-hidden">
      {/* Isolated Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 opacity-60 animate-gradient-slow"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/30 rounded-full blur-[120px] animate-float-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-500/20 rounded-full blur-[120px] animate-float-slow [animation-delay:3s]"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-screen"></div>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
      </div>

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-4 md:px-8 py-6 flex justify-between items-center bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-[2px]">
        <div className="text-2xl font-black text-white tracking-tighter font-borel pt-1">
          Storia<sup className="text-[0.5em] ml-1">©</sup>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <a
            href="https://www.instagram.com/storia.land/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xs:flex p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-white"
            title="Follow us on Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.999 0h.001zm-.512 1.442c.859-.04 1.154-.047 3.333-.047 2.179 0 2.474.007 3.333.047.794.037 1.226.171 1.513.282.38.147.652.322.936.606.284.284.459.556.606.936.111.287.245.72.282 1.513.04.859.047 1.154.047 3.333 0 2.179-.007 2.474-.047 3.333-.037.794-.171 1.226-.282 1.513a2.389 2.389 0 0 1-.606.936 2.39 2.39 0 0 1-.936.606c-.287.111-.72.245-1.513.282-.859.04-1.154.047-3.333.047-2.179 0-2.474-.007-3.333-.047-.794-.037-1.226-.171-1.513-.282a2.389 2.389 0 0 1-.936-.606 2.389 2.389 0 0 1-.606-.936c-.111-.287-.245-.72-.282-1.513-.04-.859-.047-1.154-.047-3.333 0-2.179.007-2.474.047-3.333.037-.794.171-1.226.282-1.513.147-.38.322-.652.606-.936.284-.284.556-.459.936-.606.287-.111.72-.245 1.513-.282zM8 3.891a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334zm4.328-1.576a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92z" />
            </svg>
          </a>
          <button
            onClick={onStart}
            className="px-4 md:px-6 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all shadow-lg text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2"
          >
            ✨ {t.landing_button}
          </button>
          <button
            onClick={onExplorePublic}
            className="hidden sm:flex px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-white font-black uppercase tracking-[0.1em] text-[10px] md:text-xs items-center gap-2"
          >
            📚 {t.public_library_link}
          </button>
          <button
            onClick={onGoToColoring}
            className="hidden lg:flex px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-white font-black uppercase tracking-[0.1em] text-[10px] md:text-xs items-center gap-2"
          >
            🖍️ Coloring Lab
          </button>
          <button
            onClick={onJoinMembership}
            className="group relative px-6 py-2.5 rounded-full bg-indigo-600/20 hover:bg-indigo-600 transition-all border border-indigo-500/40 text-indigo-400 hover:text-white font-black uppercase tracking-[0.1em] text-[10px] md:text-xs flex items-center gap-2"
          >
            <span className="text-lg">💎</span>
            <span className="hidden xs:inline">{t.button_membership}</span>
          </button>
        </div>
      </nav>

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Hero Section */}
        <section className="min-h-screen w-full flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in zoom-in-95 duration-1000 px-4 pt-48 pb-24">
          <div className="relative group cursor-default">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 rounded-full blur-[70px] opacity-30 group-hover:opacity-60 transition-opacity duration-1000 animate-spin-slow pointer-events-none"></div>
            <div className="relative w-28 h-28 md:w-40 md:h-40 bg-white/10 backdrop-blur-3xl rounded-[3rem] border border-white/20 flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.15)] transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 ease-out">
              <span className="text-6xl md:text-[7.5rem] animate-bounce-slow leading-none">🌙</span>
              <div className="absolute -top-6 -right-6 text-4xl md:text-5xl animate-pulse drop-shadow-2xl filter blur-[0.3px]">✨</div>
              <div className="absolute -bottom-4 -left-4 text-3xl md:text-4xl animate-pulse [animation-delay:1s] drop-shadow-2xl filter blur-[0.3px]">⭐</div>
            </div>
          </div>

          <div className="space-y-4 pb-4 max-w-5xl">
            <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-black text-white tracking-tighter font-borel drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)] leading-[1.2] pt-2 flex items-center justify-center">
              Storia<sup className="text-[0.3em] mb-[1.2em] ml-2">©</sup>
            </h1>
            <p className="text-indigo-400 text-2xl md:text-4xl font-black uppercase tracking-[0.3em] animate-pulse">
              {t.landing_slogan}
            </p>
            <p className="text-indigo-100 text-lg md:text-2xl max-w-3xl mx-auto font-semibold leading-relaxed font-bold drop-shadow-2xl opacity-90 tracking-wide">
              {t.landing_subtitle}
            </p>
          </div>

          {/* Early-bird free tier notice */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <span className="text-base">🎁</span>
            <span>Early access: <strong>5 free stories/month</strong> until August 1st — then 2. Enjoy while it lasts!</span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button
              onClick={onStart}
              className="group relative px-10 py-5 md:px-16 md:py-7 rounded-[3.5rem] bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xl md:text-3xl tracking-tight transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(79,70,229,0.8)] active:scale-95 overflow-hidden border-2 border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative flex items-center gap-4">
                {t.landing_button}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <button
              onClick={onExplorePublic}
              className="px-10 py-5 md:px-12 md:py-7 rounded-[3.5rem] bg-white/5 border-2 border-white/10 text-white font-black text-lg md:text-2xl hover:bg-white/10 transition-all active:scale-95 flex items-center gap-3"
            >
              📚 {t.public_library_link}
            </button>
          </div>
        </section>

        {/* Example Stories Carousel */}
        <section className="w-full max-w-7xl px-6 py-16 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{t.landing_carousel_title}</h2>
            <p className="text-indigo-200/60 font-bold uppercase tracking-widest text-sm">{t.landing_carousel_subtitle}</p>
          </div>

          <div className="flex justify-center">
            <button
              disabled={isGenerating}
              onClick={handleRevealMagic}
              className={`px-12 py-5 rounded-full font-black uppercase tracking-widest text-sm transition-all flex items-center gap-4 border-2 ${isGenerating ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-wait' : 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400 hover:bg-indigo-600 hover:text-white hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] active:scale-95'}`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></div>
                  Painting Magic...
                </>
              ) : (
                <>
                  <span className="text-lg">✨</span>
                  Reveal Modern Technology Visuals
                </>
              )}
            </button>
          </div>

          <div className="relative h-[780px] lg:h-[840px] flex items-center justify-center overflow-hidden">
            {featuredStories.map((story, index) => {
              const isActive = activeSlide === index;
              const isPrev = (activeSlide - 1 + featuredStories.length) % featuredStories.length === index;
              const isNext = (activeSlide + 1) % featuredStories.length === index;
              const revealedUrl = revealedImages[story.id];

              let positionClass = "opacity-0 translate-x-full scale-50 pointer-events-none";
              if (isActive) positionClass = "opacity-100 translate-x-0 scale-100 z-30 cursor-default";
              if (isPrev) positionClass = "opacity-30 -translate-x-[75%] md:-translate-x-[90%] scale-75 z-20 cursor-pointer hover:opacity-50 transition-all rounded-[4rem] border-4 border-white/5";
              if (isNext) positionClass = "opacity-30 translate-x-[75%] md:translate-x-[90%] scale-75 z-20 cursor-pointer hover:opacity-50 transition-all rounded-[4rem] border-4 border-white/5";

              return (
                <div
                  key={story.id}
                  onClick={() => {
                    if (!isActive) {
                      stopAudio();
                      setActiveSlide(index);
                    }
                  }}
                  className={`absolute w-full max-w-[94%] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl p-8 md:p-14 lg:p-16 rounded-[4rem] md:rounded-[5rem] bg-gradient-to-br ${story.color} border border-white/20 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${positionClass} overflow-hidden`}
                >
                  <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start text-center md:text-left h-full relative">
                    <div className="relative shrink-0 group/img" onClick={(e) => isActive && handlePlaySample(story, e)}>
                      <div className="w-32 h-32 md:w-44 md:h-44 lg:w-56 lg:h-56 rounded-[2.5rem] md:rounded-[3.5rem] bg-black/30 backdrop-blur-xl flex items-center justify-center text-5xl md:text-6xl lg:text-7xl shadow-inner border border-white/10 group-hover:scale-105 transition-all overflow-hidden relative">
                        {revealedUrl ? (
                          <img src={revealedUrl} alt={story.title} className="w-full h-full object-cover animate-in fade-in duration-1000" />
                        ) : isGenerating && isActive ? (
                          <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
                            <span className="text-4xl md:text-5xl animate-bounce">🖌️</span>
                          </div>
                        ) : (
                          <>
                            {story.icon}
                          </>
                        )}

                        {isActive && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-16 h-16 md:w-24 md:h-24 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-black shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                              {loadingAudioId === story.id ? (
                                <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                              ) : playingAudioId === story.id ? (
                                <svg className="w-8 h-8 md:w-12 md:h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                              ) : (
                                <svg className="w-8 h-8 md:w-12 md:h-12 ml-1 md:ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col h-full min-w-0">
                      <div className="space-y-2 md:space-y-4 mb-4 md:mb-6">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                          <span className="text-white/60 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">{story.region}</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl break-words">
                          {story.title}
                        </h3>
                      </div>

                      <p className="text-white/95 text-base md:text-xl lg:text-2xl leading-relaxed font-bold mb-8 md:mb-12">
                        {story.desc}
                      </p>

                      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mt-auto">
                        {isActive && (
                          <button
                            onClick={(e) => handlePlaySample(story, e)}
                            className={`group/playbtn px-8 py-4 md:px-10 md:py-5 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm md:text-lg transition-all flex items-center gap-4 border-[3px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] active:scale-95 shrink-0 ${playingAudioId === story.id
                              ? 'bg-white text-black border-white hover:bg-zinc-100'
                              : 'bg-white/10 text-white border-white/40 hover:bg-white/20'
                              } ${loadingAudioId === story.id ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            {loadingAudioId === story.id ? (
                              <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : playingAudioId === story.id ? (
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                              <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            )}
                            <span className="relative">
                              {loadingAudioId === story.id ? "Loading..." : playingAudioId === story.id ? "Stop Sample" : "Play Sample"}
                            </span>
                          </button>
                        )}

                        <div className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start">
                          {story.tags.map(tag => (
                            <span key={tag} className="px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-white/15 border border-white/15 text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em]">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-4 md:gap-6 mt-4">
            {featuredStories.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  stopAudio();
                  setActiveSlide(i);
                }}
                className={`w-12 h-3 md:w-16 md:h-4 rounded-full transition-all duration-500 ${activeSlide === i ? 'bg-white w-24 md:w-32' : 'bg-white/15 hover:bg-white/40'}`}
              />
            ))}
          </div>
        </section>

        {/* Testimonials Carousel Section */}
        <section className="w-full bg-indigo-600/5 py-32 px-6">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">{t.landing_testimonials_title}</h2>
              <div className="w-24 h-1.5 bg-indigo-500 mx-auto rounded-full"></div>
            </div>

            <div className="relative h-[380px] md:h-[320px] flex items-center justify-center">
              {testimonials.map((test, idx) => {
                const isActive = activeTestimonial === idx;
                return (
                  <div
                    key={test.id}
                    className={`absolute inset-x-0 transition-all duration-1000 transform flex flex-col items-center text-center space-y-8 px-4 ${isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}
                  >
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center text-4xl shadow-inner border border-white/5">
                      {test.icon}
                    </div>
                    <blockquote className="max-w-3xl text-xl md:text-3xl font-black text-white italic leading-tight tracking-tight font-serif">
                      "{test.quote}"
                    </blockquote>
                    <div className="space-y-1">
                      <p className="text-white font-black uppercase tracking-widest text-sm">{test.names}</p>
                      <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest">{test.location}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-3">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${activeTestimonial === i ? 'bg-indigo-500 scale-125' : 'bg-zinc-800'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="w-full max-w-6xl px-6 py-32 space-y-24">
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">{t.landing_how_title}</h2>
            <div className="w-32 h-2 bg-indigo-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-24 left-1/2 -translate-x-1/2 w-[70%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            {[
              { num: "01", title: t.landing_how_step1_title, desc: t.landing_how_step1_desc, icon: "🌱" },
              { num: "02", title: t.landing_how_step2_title, desc: t.landing_how_step2_desc, icon: "⚡" },
              { num: "03", title: t.landing_how_step3_title, desc: t.landing_how_step3_desc, icon: "💤" }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-8 group">
                <div className="w-24 h-24 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 flex items-center justify-center text-5xl shadow-2xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 relative z-10">
                  {step.icon}
                  <span className="absolute -top-4 -left-4 bg-indigo-600 text-white text-xs font-black px-3 py-1.5 rounded-xl border border-white/20">{step.num}</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-white tracking-tight">{step.title}</h3>
                  <p className="text-indigo-100/60 text-base leading-relaxed font-semibold max-w-xs mx-auto">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature List Section */}
        <section className="w-full max-w-4xl px-6 py-20 space-y-12">
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">{t.landing_features_title}</h2>
            <div className="w-32 h-2 bg-indigo-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
            {[
              { icon: "🎙️", title: t.landing_feat_voice_title, desc: t.landing_feat_voice_desc },
              { icon: "🌍", title: t.landing_feat_culture_title, desc: t.landing_feat_culture_desc },
              { icon: "🎶", title: t.landing_feat_rhymes_title, desc: t.landing_feat_rhymes_desc },
              { icon: "🎨", title: t.landing_feat_styles_title, desc: t.landing_feat_styles_desc },
              { icon: "🤫", title: t.landing_feat_whisper_title, desc: t.landing_feat_whisper_desc },
              { icon: "🌙", title: t.landing_feat_sleep_title, desc: t.landing_feat_sleep_desc },
              { icon: "🧠", title: t.landing_feat_modes_title, desc: t.landing_feat_modes_desc },
              { icon: "🏃", title: t.landing_feat_pace_title, desc: t.landing_feat_pace_desc },
              { icon: "🗣️", title: t.landing_feat_lang_title, desc: t.landing_feat_lang_desc },
              { icon: "📚", title: t.landing_feat_replays_title, desc: t.landing_feat_replays_desc },
              { icon: "🛡️", title: t.landing_feat_moderation_title, desc: t.landing_feat_moderation_desc },
              { icon: "🖍️", title: t.landing_feat_pdf_title, desc: t.landing_feat_pdf_desc },
            ].map((feat, i) => (
              <div key={i} className="flex items-start gap-4 py-4 border-b border-white/5">
                <span className="text-2xl shrink-0 mt-0.5">{feat.icon}</span>
                <div>
                  <h4 className="text-white font-black text-sm tracking-tight">{feat.title}</h4>
                  <p className="text-indigo-100/50 text-xs leading-relaxed font-medium mt-0.5">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* Footer CTA */}
        <section className="w-full py-40 flex flex-col items-center justify-center px-4 bg-gradient-to-t from-black to-transparent">
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[5rem] p-16 md:p-24 max-w-5xl w-full text-center space-y-12 shadow-[0_0_100px_rgba(0,0,0,0.6)]">
            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-tight">{t.landing_cta_title}</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <button
                onClick={onStart}
                className="px-20 py-8 bg-white text-black font-black text-3xl rounded-full hover:bg-indigo-100 transition-all shadow-[0_20px_60px_rgba(255,255,255,0.2)] active:scale-95"
              >
                {t.landing_button}
              </button>
              <button
                onClick={onJoinMembership}
                className="px-12 py-8 bg-indigo-600/20 border-2 border-indigo-500/40 text-indigo-400 font-black text-xl rounded-full hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center gap-3"
              >
                <span>💎</span>
                {t.button_membership}
              </button>
            </div>
            <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.4em]">{t.landing_cta_subtitle} {t.paywall_monthly_price}</p>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-15px) rotate(4deg); } }
        @keyframes float-slow { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -30px); } }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
        @keyframes gradient-slow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-bounce-slow { animation: bounce-slow 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 18s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 5s ease-in-out infinite; }
        .animate-gradient-slow { background-size: 200% 200%; animation: gradient-slow 22s ease infinite; }
        .animate-spin-slow { animation: spin-slow 35s linear infinite; }
      `}</style>
    </div>
  );
};

export default LandingPage;
