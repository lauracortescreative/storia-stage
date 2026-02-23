
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StoryResult, Episode, VisualScene, UITranslations, Soundscape } from '../types';

interface StoryPlayerProps {
  story: StoryResult;
  onClose: () => void;
  onSave: () => void;
  onAuth: () => void;
  isLoggedIn: boolean;
  translations: UITranslations;
}

const StoryPlayer: React.FC<StoryPlayerProps> = ({ story, onClose, onSave, onAuth, isLoggedIn, translations: t }) => {
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScriptOpen, setIsScriptOpen] = useState(false);
  const [subtitlesVisible, setSubtitlesVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showCloseCTA, setShowCloseCTA] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // --- Fullscreen state ---
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const playerRootRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const ambientRef = useRef<HTMLAudioElement>(null);

  const currentEpisode = story.episodes[currentEpisodeIndex];

  // Scene selection: Find the active scene based on audio progress.
  const currentScene = currentEpisode.visual_plan?.slice().reverse().find(scene => progress >= scene.start_time_pct)
    || currentEpisode.visual_plan?.[0]
    || null;

  const activeImageUrl = currentScene?.imageUrl || null;

  // ─── Fullscreen helpers ────────────────────────────────────────────────────

  const enterFullscreen = useCallback(async () => {
    try {
      const el = playerRootRef.current || document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
    } catch (_) { }
    // Lock orientation on mobile if supported
    try {
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape');
      }
    } catch (_) { }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
      }
    } catch (_) { }
    try {
      if (screen.orientation && (screen.orientation as any).unlock) {
        (screen.orientation as any).unlock();
      }
    } catch (_) { }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Sync isFullscreen state with the browser's actual fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      const isFsNow = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement;
      setIsFullscreen(isFsNow);
      if (isFsNow) scheduleHideControls();
      else {
        setControlsVisible(true);
        if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Auto-enter fullscreen when device rotates to landscape
  useEffect(() => {
    const mql = window.matchMedia('(orientation: landscape)');
    const handleOrientationChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches && !document.fullscreenElement) {
        enterFullscreen();
      } else if (!e.matches && document.fullscreenElement) {
        exitFullscreen();
      }
    };
    mql.addEventListener('change', handleOrientationChange as (e: MediaQueryListEvent) => void);
    // Also check on mount in case we're already landscape
    if (mql.matches && !document.fullscreenElement) {
      enterFullscreen();
    }
    return () => {
      mql.removeEventListener('change', handleOrientationChange as (e: MediaQueryListEvent) => void);
    };
  }, [enterFullscreen, exitFullscreen]);

  // Exit fullscreen when player unmounts
  useEffect(() => {
    return () => {
      exitFullscreen();
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    };
  }, [exitFullscreen]);

  // ─── Auto-hide controls in fullscreen ─────────────────────────────────────

  const scheduleHideControls = useCallback(() => {
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    setControlsVisible(true);
    hideControlsTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);

  const handleUserActivity = useCallback(() => {
    if (!isFullscreen) return;
    scheduleHideControls();
  }, [isFullscreen, scheduleHideControls]);

  // ─── Audio / playback ─────────────────────────────────────────────────────

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.duration && isFinite(audio.duration)) {
      const p = Math.max(0, Math.min(1, audio.currentTime / audio.duration));
      setProgress(p);

      // --- FADE OUT LOGIC ---
      const isLastEpisode = currentEpisodeIndex === story.episodes.length - 1;
      const fadeThreshold = 8;
      const timeLeft = audio.duration - audio.currentTime;

      if (story.sleep_fade && isLastEpisode && timeLeft < fadeThreshold && timeLeft > 0) {
        const fadeFactor = Math.max(0, timeLeft / fadeThreshold);
        audio.volume = fadeFactor;
        if (ambientRef.current) ambientRef.current.volume = fadeFactor * 0.5;
      } else {
        if (audio.volume !== 1) audio.volume = 1;
        if (ambientRef.current && ambientRef.current.volume !== 0.5) ambientRef.current.volume = 0.5;
      }
    }
  };

  const handleEnded = () => {
    if (story.autoplay_next && currentEpisodeIndex < story.episodes.length - 1) {
      setCurrentEpisodeIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setProgress(1.0);
    }
  };

  const togglePlay = (e?: any) => {
    if (e) e.stopPropagation();
    if (!currentEpisode.audioBlobUrl || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      if (ambientRef.current) ambientRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        if (ambientRef.current && story.soundscape !== 'none' && (ambientRef.current.src || story.soundscapeBlobUrl)) {
          if (!ambientRef.current.src && story.soundscapeBlobUrl) ambientRef.current.src = story.soundscapeBlobUrl;
          ambientRef.current.play().catch(e => { if (e.name !== 'AbortError') console.error("Ambient playback interrupted", e); });
        }
      }).catch(() => setIsPlaying(false));
    }
  };

  const handleSave = () => {
    if (story.isSaved) return;
    onSave();
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const cleanSSML = (ssml: string) => ssml.replace(/<[^>]*>/g, '').trim();

  const convertToOutline = (src: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(src);
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.filter = 'grayscale(1) contrast(500%) brightness(1.2) invert(1)';
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        const fctx = finalCanvas.getContext("2d");
        if (!fctx) return resolve(dataUrl);
        fctx.filter = 'invert(1)';
        fctx.drawImage(canvas, 0, 0);
        resolve(finalCanvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to download the coloring book.");
      setIsGeneratingPdf(false);
      return;
    }
    const doc = printWindow.document;
    doc.write(`
      <html>
        <head>
          <title>${story.app_title} - Coloring Book</title>
          <link href="https://fonts.googleapis.com/css2?family=Borel&family=Nunito:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            @page { margin: 20mm; }
            body { font-family: 'Nunito', sans-serif; margin: 0; padding: 0; color: black; background: white; }
            .page { page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 90vh; text-align: center; }
            .cover h1 { font-family: 'Borel', cursive; font-size: 64pt; margin-bottom: 20pt; }
            .cover h2 { font-size: 24pt; color: #555; }
            .scene-img { width: 100%; max-height: 60vh; object-fit: contain; border: 1px solid #eee; margin-bottom: 30pt; }
            .caption { font-size: 20pt; font-weight: 900; line-height: 1.4; max-width: 80%; }
            .footer { margin-top: 40pt; font-size: 10pt; color: #999; text-transform: uppercase; letter-spacing: 2pt; }
          </style>
        </head>
        <body>
          <div class="page cover"><h1>Storia©</h1><h2>${story.app_title}</h2><p class="footer">A Magical Coloring Adventure</p></div>
        </body>
      </html>
    `);

    for (const ep of story.episodes) {
      if (ep.visual_plan) {
        for (const scene of ep.visual_plan) {
          if (scene.imageUrl) {
            const outlineUrl = await convertToOutline(scene.imageUrl);
            const sceneDiv = doc.createElement('div');
            sceneDiv.className = 'page';
            sceneDiv.innerHTML = `
              <img src="${outlineUrl}" class="scene-img" />
              <p class="caption">${scene.caption}</p>
              <p class="footer">Chapter: ${ep.episode_title}</p>
            `;
            doc.body.appendChild(sceneDiv);
          }
        }
      }
    }
    doc.close();
    setIsGeneratingPdf(false);
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
  };

  const handleCloseAttempt = () => {
    exitFullscreen();
    const hasVisuals = story.episodes.some(ep => ep.visual_plan && ep.visual_plan.length > 0);
    if (hasVisuals) {
      if (isPlaying) {
        audioRef.current?.pause();
        ambientRef.current?.pause();
        setIsPlaying(false);
      }
      setShowCloseCTA(true);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode.audioBlobUrl) return;
    if (audio.src !== currentEpisode.audioBlobUrl) {
      audio.src = currentEpisode.audioBlobUrl;
      audio.load();
      audio.volume = 1;
      if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentEpisode.audioBlobUrl, currentEpisodeIndex]);

  useEffect(() => {
    const ambient = ambientRef.current;
    if (ambient) {
      if (story.soundscape !== 'none' && story.soundscapeBlobUrl) {
        if (ambient.src !== story.soundscapeBlobUrl) {
          ambient.src = story.soundscapeBlobUrl;
          ambient.load();
        }
        ambient.loop = true;
        ambient.volume = 0.5;
        if (isPlaying) ambient.play().catch(() => { });
      } else {
        ambient.pause();
        ambient.removeAttribute('src');
        ambient.load();
      }
    }
  }, [story.soundscape, story.soundscapeBlobUrl, isPlaying]);

  useEffect(() => {
    setProgress(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, [currentEpisodeIndex]);

  // ─── Render ───────────────────────────────────────────────────────────────

  const isDarkMode = story.screen_mode === 'dark' || !subtitlesVisible;

  // Controls visibility class for the HUD in fullscreen
  const hudClass = isFullscreen
    ? `transition-opacity duration-500 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
    : '';

  return (
    <div
      ref={playerRootRef}
      className={`fixed inset-0 z-50 bg-black select-none overflow-hidden ${isFullscreen ? 'cursor-none' : 'flex flex-col items-center justify-center p-4 md:p-10'}`}
      onMouseMove={handleUserActivity}
      onTouchStart={handleUserActivity}
      onClick={isFullscreen ? handleUserActivity : undefined}
    >
      {/* Audio elements — always rendered here so refs are always valid */}
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} crossOrigin="anonymous" preload="auto" className="hidden" />
      <audio ref={ambientRef} crossOrigin="anonymous" preload="auto" className="hidden" />
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-white font-black tracking-widest uppercase text-sm animate-pulse">Creating your coloring book...</p>
        </div>
      )}

      {/* Save Success Toast */}
      {showSaveToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-green-500 text-white px-8 py-4 rounded-full font-black shadow-[0_0_40px_rgba(34,197,94,0.4)] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="text-xl">✨</span>
          {t.player_saved || "Saved to your Library!"}
        </div>
      )}

      {showCloseCTA && (
        <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-[3rem] p-10 text-center space-y-6 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x"></div>

            {/* ── Auth prompt for logged-out users ── */}
            {!isLoggedIn && !story.isSaved && (
              <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-3xl p-6 space-y-4">
                <div className="text-3xl">✨</div>
                <div className="space-y-1">
                  <p className="text-white font-black text-lg tracking-tight">{t.library_account_required || 'Save this story?'}</p>
                  <p className="text-indigo-200/60 text-sm">{t.library_save_cta || 'Create a free account to keep this story in your library forever.'}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setShowCloseCTA(false); onAuth(); }}
                    className="w-full py-4 bg-white text-black font-black text-base rounded-2xl hover:bg-zinc-100 transition-all shadow-xl"
                  >
                    {t.button_create_account || 'Create Free Account'} →
                  </button>
                  <button
                    onClick={() => { setShowCloseCTA(false); onAuth(); }}
                    className="w-full py-3 text-indigo-400 font-bold text-sm hover:text-indigo-300 transition-colors"
                  >
                    {t.auth_already_have}
                  </button>
                </div>
              </div>
            )}

            {/* ── Coloring book CTA ── */}
            <div className="text-5xl animate-bounce-slow">🖍️</div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-white tracking-tight leading-tight font-borel">
                {t.cta_coloring_title || 'Finish with some magic?'}
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {t.cta_coloring_desc || 'Would you like to print a custom coloring book featuring the scenes from this story?'}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { handleDownloadPDF(); setShowCloseCTA(false); }}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base rounded-2xl transition-all shadow-xl active:scale-95"
              >
                {t.cta_coloring_button || 'Print Coloring Book 🖍️'}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 text-zinc-500 hover:text-zinc-300 font-bold transition-colors text-sm"
              >
                {t.cta_coloring_skip || 'No thanks, just close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FULLSCREEN CINEMATIC LAYOUT ── */}
      {isFullscreen ? (
        <div className="absolute inset-0 w-full h-full">
          {/* Full-bleed image */}
          <div className="absolute inset-0 w-full h-full" onClick={togglePlay}>
            {isDarkMode ? (
              <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
                <div className={`text-[16rem] opacity-10 transition-all duration-1000 ${isPlaying ? 'scale-110 blur-[2px]' : 'scale-100'}`}>🌙</div>
              </div>
            ) : activeImageUrl ? (
              <img
                key={activeImageUrl}
                src={activeImageUrl}
                alt="Story scene"
                className={`w-full h-full object-cover transition-opacity duration-1000 ${isPlaying ? 'animate-ken-burns' : ''}`}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                <div className="text-8xl mb-4 animate-bounce">✨</div>
                <p className="text-zinc-500 text-[10px] font-black tracking-[0.4em] uppercase animate-pulse">{t.player_painting}</p>
              </div>
            )}
            {/* Gradient scrim for controls legibility */}
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
          </div>

          {/* ── TOP HUD (action buttons) ── */}
          <div className={`absolute top-0 left-0 right-0 flex items-center justify-between p-5 md:p-8 z-20 ${hudClass}`}>
            {/* Exit fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-2xl bg-black/40 text-white hover:bg-black/70 transition-all backdrop-blur-md border border-white/10"
              title="Exit fullscreen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            </button>

            {/* Right-side action buttons */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={handleSave}
                disabled={story.isSaved}
                className={`p-3 rounded-2xl transition-all backdrop-blur-md border border-white/10 flex items-center gap-2 font-bold text-sm ${story.isSaved ? 'bg-green-900/50 text-green-400 cursor-default' : 'bg-black/40 text-white hover:bg-indigo-600/80'}`}
              >
                {story.isSaved
                  ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                }
                <span className="hidden md:inline">{story.isSaved ? t.player_saved : t.player_save_to_library}</span>
              </button>

              <button onClick={() => setIsScriptOpen(true)} className="p-3 rounded-2xl bg-black/40 text-white hover:bg-black/70 transition-all backdrop-blur-md border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </button>

              <button onClick={() => setIsMenuOpen(true)} className="p-3 rounded-2xl bg-black/40 text-white hover:bg-black/70 transition-all backdrop-blur-md border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>

              <button onClick={handleCloseAttempt} className="p-3 rounded-2xl bg-red-900/40 text-red-400 hover:bg-red-800 transition-all backdrop-blur-md border border-red-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* ── BOTTOM HUD (play bar) ── */}
          <div className={`absolute bottom-0 left-0 right-0 p-5 md:p-8 z-20 ${hudClass}`}>
            <div className="flex items-center gap-6">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                disabled={!currentEpisode.audioBlobUrl}
                className="p-5 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/20 backdrop-blur-md disabled:opacity-20 flex-shrink-0"
              >
                {isPlaying
                  ? <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  : <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                }
              </button>

              {/* Episode info + progress */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-white/50 text-[10px] font-black uppercase tracking-widest flex-shrink-0">{t.player_episode} {currentEpisodeIndex + 1}</span>
                  <span className="text-white font-black text-lg md:text-xl tracking-tight truncate">{currentEpisode.episode_title}</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 transition-all duration-200 rounded-full" style={{ width: `${progress * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Audio loading overlay in fullscreen */}
          {!currentEpisode.audioBlobUrl && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-6 text-center">
              <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
              <p className="text-white font-bold tracking-wide animate-pulse mb-8">{t.player_voicing}</p>
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="px-8 py-3 bg-white/5 rounded-full text-zinc-400 text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5"
              >
                {t.cancel}
              </button>
            </div>
          )}
        </div>

      ) : (
        /* ── NORMAL PORTRAIT LAYOUT ── */
        <div className="w-full max-w-5xl flex flex-col gap-8 h-full">
          {/* Top action bar */}
          <div className="absolute top-6 right-6 flex flex-wrap justify-end gap-3 z-50">
            <button
              onClick={handleSave}
              disabled={story.isSaved}
              className={`p-4 rounded-3xl transition-all shadow-2xl backdrop-blur-md flex items-center gap-2 font-bold ${story.isSaved ? 'bg-green-900/40 text-green-400 cursor-default scale-100' : 'bg-indigo-600/80 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95'}`}
            >
              {story.isSaved
                ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-in zoom-in duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              }
              <span className="hidden md:inline">{story.isSaved ? t.player_saved : t.player_save_to_library}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="p-4 rounded-3xl bg-zinc-800/80 text-white hover:bg-zinc-700 transition-all shadow-2xl backdrop-blur-md flex items-center gap-2 font-bold border border-white/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden md:inline">{t.player_pdf}</span>
            </button>

            <button
              onClick={() => setIsScriptOpen(true)}
              className="p-4 rounded-3xl bg-zinc-800/80 text-white hover:bg-zinc-700 transition-all shadow-2xl backdrop-blur-md flex items-center gap-2 font-bold border border-white/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden md:inline">{t.library_read_script}</span>
            </button>

            {story.screen_mode !== 'dark' && (
              <button
                onClick={() => setSubtitlesVisible(!subtitlesVisible)}
                className={`p-4 rounded-3xl transition-all shadow-2xl backdrop-blur-md flex items-center gap-2 font-bold ${!subtitlesVisible ? 'bg-indigo-900/60 text-indigo-400 border border-indigo-500/40' : 'bg-zinc-800/80 text-white hover:bg-zinc-700 border border-white/5'}`}
                title={subtitlesVisible ? "Switch to Audio Only" : "Switch to Visuals"}
              >
                {subtitlesVisible ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    <span className="hidden lg:inline">{t.player_visuals_on}</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    <span className="hidden lg:inline">{t.player_audio_only}</span>
                  </>
                )}
              </button>
            )}

            {/* Fullscreen toggle button */}
            <button
              onClick={toggleFullscreen}
              className="p-4 rounded-3xl bg-zinc-800/80 text-white hover:bg-indigo-600 transition-all shadow-2xl backdrop-blur-md flex items-center gap-2 font-bold border border-white/5"
              title="Enter fullscreen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span className="hidden md:inline">{t.player_fullscreen}</span>
            </button>

            <button onClick={() => setIsMenuOpen(true)} className="text-white bg-zinc-800/80 hover:bg-indigo-600 p-4 rounded-3xl transition-all shadow-2xl flex items-center gap-2 font-bold backdrop-blur-md border border-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              <span className="hidden md:inline">{t.player_menu}</span>
            </button>

            <button onClick={handleCloseAttempt} className="text-white bg-red-900/30 hover:bg-red-800 p-4 rounded-3xl transition-all shadow-2xl backdrop-blur-md border border-red-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Visual stage */}
          <div onClick={togglePlay} className="flex-1 relative rounded-[3rem] overflow-hidden bg-zinc-900 shadow-2xl border border-zinc-800 flex items-center justify-center group cursor-pointer">
            <div className="relative w-full h-full overflow-hidden">
              {isDarkMode ? (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center animate-in fade-in duration-700">
                  <div className={`text-[12rem] opacity-20 transition-all duration-1000 ${isPlaying ? 'scale-110 blur-[2px]' : 'scale-100'}`}>🌙</div>
                </div>
              ) : activeImageUrl ? (
                <img key={activeImageUrl} src={activeImageUrl} alt="Story scene" className={`w-full h-full object-cover transition-opacity duration-1000 ${isPlaying ? 'animate-ken-burns' : ''}`} />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                  <div className="text-8xl mb-4 animate-bounce">✨</div>
                  <p className="text-zinc-500 text-[10px] font-black tracking-[0.4em] uppercase animate-pulse">{t.player_painting}</p>
                </div>
              )}

              {!currentEpisode.audioBlobUrl && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-[70] p-6 text-center">
                  <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                  <p className="text-white font-bold tracking-wide animate-pulse mb-8">{t.player_voicing}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="px-8 py-3 bg-white/5 rounded-full text-zinc-400 text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5"
                  >
                    {t.cancel}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Controls panel */}
          <div className="w-full bg-zinc-900/90 backdrop-blur-2xl p-8 rounded-[3.5rem] border border-white/10 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between gap-6">
              <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-1">{t.player_episode} {currentEpisodeIndex + 1}</span>
                <span className="text-white font-black text-2xl md:text-3xl tracking-tight leading-tight">{currentEpisode.episode_title}</span>
              </div>
              <button onClick={togglePlay} disabled={!currentEpisode.audioBlobUrl} className="p-8 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-all hover:scale-110 shadow-2xl disabled:opacity-20 flex items-center justify-center">
                {isPlaying
                  ? <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  : <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                }
              </button>
            </div>
            <div className="space-y-3">
              <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-indigo-500 transition-all duration-200" style={{ width: `${progress * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS (shared between both layouts) ── */}
      {isScriptOpen && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="max-w-4xl w-full h-full max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <header className="p-8 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-1">{t.script_title}</h2>
                <h3 className="text-white text-3xl font-black tracking-tighter">{story.app_title}</h3>
              </div>
              <button onClick={() => setIsScriptOpen(false)} className="p-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
              {story.episodes.map((ep, idx) => (
                <div key={idx} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">Episode {idx + 1}</span>
                    <h4 className="text-xl font-black text-white tracking-tight">{ep.episode_title}</h4>
                  </div>
                  <div className="bg-zinc-800/30 p-8 rounded-[2.5rem] border border-white/5">
                    <p className="text-zinc-300 text-lg md:text-xl font-medium leading-[1.8] italic font-serif">{cleanSSML(ep.ssml_narration)}</p>
                  </div>
                </div>
              ))}
              <div className="pt-8 text-center">
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest italic">{story.main_character_description}</p>
              </div>
            </div>
            <footer className="p-8 border-t border-zinc-800 flex justify-center shrink-0">
              <button onClick={() => setIsScriptOpen(false)} className="px-10 py-4 bg-white text-black font-black text-lg rounded-2xl hover:bg-zinc-200 transition-all shadow-xl">{t.close}</button>
            </footer>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl p-4 md:p-8 overflow-y-auto animate-in slide-in-from-bottom duration-500">
          <div className="max-w-6xl mx-auto py-12">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-5xl font-black text-white tracking-tighter">{t.player_menu}</h2>
              <button onClick={() => setIsMenuOpen(false)} className="bg-zinc-800 p-4 rounded-full text-white hover:bg-zinc-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-12">
              {story.episodes.map((ep, eIdx) => (
                <div key={eIdx} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 flex items-center justify-center bg-indigo-600 rounded-2xl text-lg font-black">{eIdx + 1}</span>
                    <h3 className="text-3xl font-black text-white tracking-tight">{ep.episode_title}</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {ep.visual_plan?.map((scene, sIdx) => {
                      const isActive = currentEpisodeIndex === eIdx && currentScene?.scene === scene.scene;
                      const sceneIsDark = story.screen_mode === 'dark' || !subtitlesVisible;
                      return (
                        <button
                          key={sIdx}
                          onClick={() => {
                            setCurrentEpisodeIndex(eIdx);
                            const tryJump = () => {
                              if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
                                audioRef.current.currentTime = scene.start_time_pct * audioRef.current.duration;
                                setIsMenuOpen(false);
                                setIsPlaying(true);
                                audioRef.current.play().catch(() => { });
                                if (ambientRef.current && story.soundscape !== 'none') ambientRef.current.play().catch(() => { });
                              } else { setTimeout(tryJump, 100); }
                            };
                            tryJump();
                          }}
                          className={`group relative aspect-video rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-4 transition-all ${isActive ? 'border-indigo-500 scale-105 shadow-[0_0_30px_rgba(79,70,229,0.5)]' : 'border-zinc-800 hover:border-zinc-600'}`}
                        >
                          {sceneIsDark ? (
                            <div className="absolute inset-0 bg-black flex items-center justify-center"><div className="text-3xl opacity-20">🌙</div></div>
                          ) : scene.imageUrl ? (
                            <img src={scene.imageUrl} className="w-full h-full object-cover" alt="Thumbnail" />
                          ) : (
                            <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center"><div className="text-xl animate-pulse">🖌️</div></div>
                          )}
                          <div className={`absolute inset-0 bg-black/40 flex flex-col justify-end p-2 md:p-4 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {isActive && <span className="absolute top-1 md:top-2 right-1 md:right-2 bg-indigo-600 text-[6px] md:text-[8px] px-2 py-0.5 rounded-full font-black animate-pulse">{t.player_now_playing}</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ken-burns { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
        .animate-ken-burns { animation: ken-burns 40s linear infinite alternate; }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-gradient-x { background-size: 200% 100%; animation: gradient-x 3s linear infinite; }
        @keyframes gradient-x { 0% { background-position: 0% 0%; } 100% { background-position: -200% 0%; } }
        :fullscreen { background: black; }
        :-webkit-full-screen { background: black; }
      `}</style>
    </div>
  );
};

export default StoryPlayer;
