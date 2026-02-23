
import React, { useState } from 'react';
import { StoryResult, UITranslations } from '../types';

interface LibraryPageProps {
  translations: UITranslations;
  sessionStories: StoryResult[];
  savedStories: StoryResult[];
  isLoggedIn: boolean;
  onSelectStory: (s: StoryResult) => void;
  onSaveStory: (s: StoryResult) => void;
  onBack: () => void;
  onAuth: () => void;
}

const LibraryPage: React.FC<LibraryPageProps> = ({
  translations: t,
  sessionStories,
  savedStories,
  isLoggedIn,
  onSelectStory,
  onSaveStory,
  onBack,
  onAuth
}) => {
  const [scriptStory, setScriptStory] = useState<StoryResult | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const allEmpty = sessionStories.length === 0 && savedStories.length === 0;

  const cleanSSML = (ssml: string) => {
    return ssml.replace(/<[^>]*>/g, '').trim();
  };

  /**
   * Helper to convert an image to an "outline" version using canvas filters.
   */
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

  const handleDownloadPDF = async (story: StoryResult) => {
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
            body { 
              font-family: 'Nunito', sans-serif; 
              margin: 0; padding: 0; 
              color: black; 
              background: white; 
            }
            .page { 
              page-break-after: always; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center;
              min-height: 90vh;
              text-align: center;
            }
            .cover h1 { font-family: 'Borel', cursive; font-size: 64pt; margin-bottom: 20pt; }
            .cover h2 { font-size: 24pt; color: #555; }
            .scene-img { 
              width: 100%; 
              max-height: 60vh; 
              object-fit: contain; 
              border: 1px solid #eee; 
              margin-bottom: 30pt;
            }
            .caption { font-size: 20pt; font-weight: 900; line-height: 1.4; max-width: 80%; }
            .footer { margin-top: 40pt; font-size: 10pt; color: #999; text-transform: uppercase; letter-spacing: 2pt; }
          </style>
        </head>
        <body>
          <div class="page cover">
             <h1>Storia©</h1>
             <h2>${story.app_title}</h2>
             <p class="footer">A Magical Coloring Adventure</p>
          </div>
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

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-8">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter">
              {t.library_title}
            </h2>
            <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest mt-2">
              {isLoggedIn ? t.lib_account_active : t.lib_guest_session}
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all flex items-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.terms_back}
          </button>
        </div>

        {/* ── Login banner for logged-out users ── */}
        {!isLoggedIn && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-6 bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="text-center sm:text-left">
              <p className="text-white font-black text-lg tracking-tight">✨ {t.library_account_required}</p>
              <p className="text-indigo-200/60 text-sm mt-1">{t.library_save_cta}</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={onAuth}
                className="px-6 py-3 bg-white text-black font-black text-sm rounded-2xl hover:bg-zinc-100 transition-all shadow-lg whitespace-nowrap"
              >
                {t.button_create_account}
              </button>
              <button
                onClick={onAuth}
                className="px-6 py-3 border border-indigo-500/40 text-indigo-300 font-bold text-sm rounded-2xl hover:bg-indigo-600/20 transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {isGeneratingPdf && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-white font-black tracking-widest uppercase text-sm animate-pulse">Creating your coloring book...</p>
          </div>
        )}

        {allEmpty ? (
          <div className="py-32 text-center space-y-6">
            <div className="text-8xl">📚</div>
            <p className="text-zinc-500 text-xl font-medium">{t.library_empty}</p>
            <button onClick={onBack} className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500">
              {t.landing_button}
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {sessionStories.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                    <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                    {t.library_recent}
                  </h3>
                  {!isLoggedIn && (
                    <button
                      onClick={onAuth}
                      className="text-indigo-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-300 transition-colors"
                    >
                      {t.library_save_cta}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sessionStories.map(story => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      t={t}
                      onPlay={() => onSelectStory(story)}
                      onSave={() => onSaveStory(story)}
                      onReadScript={() => setScriptStory(story)}
                      onDownloadPDF={() => handleDownloadPDF(story)}
                      isLoggedIn={isLoggedIn}
                    />
                  ))}
                </div>
              </section>
            )}

            {savedStories.length > 0 && (
              <section className="space-y-8">
                <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                  {t.library_saved}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {savedStories.map(story => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      t={t}
                      onPlay={() => onSelectStory(story)}
                      onReadScript={() => setScriptStory(story)}
                      onDownloadPDF={() => handleDownloadPDF(story)}
                      isLoggedIn={isLoggedIn}
                      saved
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {!isLoggedIn && sessionStories.length > 0 && (
          <div className="mt-20 p-10 bg-indigo-900/20 border border-indigo-500/30 rounded-[3rem] text-center space-y-6">
            <h4 className="text-2xl font-black text-white">{t.library_account_required}</h4>
            <p className="text-indigo-200/70">{t.library_save_cta}</p>
            <button
              onClick={onAuth}
              className="px-10 py-5 bg-white text-black font-black text-xl rounded-full hover:bg-zinc-200 transition-all shadow-xl"
            >
              {t.button_create_account}
            </button>
          </div>
        )}
      </div>

      {/* Script Modal */}
      {scriptStory && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="max-w-4xl w-full h-full max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <header className="p-8 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-1">{t.script_title}</h2>
                <h3 className="text-white text-3xl font-black tracking-tighter">{scriptStory.app_title}</h3>
              </div>
              <button
                onClick={() => setScriptStory(null)}
                className="p-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
              {scriptStory.episodes.map((ep, idx) => (
                <div key={idx} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">
                      Episode {idx + 1}
                    </span>
                    <h4 className="text-xl font-black text-white tracking-tight">{ep.episode_title}</h4>
                  </div>
                  <div className="bg-zinc-800/30 p-8 rounded-[2.5rem] border border-white/5">
                    <p className="text-zinc-300 text-lg md:text-xl font-medium leading-[1.8] italic font-serif">
                      {cleanSSML(ep.ssml_narration)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-8 text-center">
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest italic">{scriptStory.main_character_description}</p>
              </div>
            </div>
            <footer className="p-8 border-t border-zinc-800 flex justify-center shrink-0">
              <button
                onClick={() => setScriptStory(null)}
                className="px-10 py-4 bg-white text-black font-black text-lg rounded-2xl hover:bg-zinc-200 transition-all shadow-xl"
              >
                {t.close}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

const StoryCard: React.FC<{
  story: StoryResult,
  t: UITranslations,
  onPlay: () => void,
  onSave?: () => void,
  onReadScript: () => void,
  onDownloadPDF: () => void,
  isLoggedIn: boolean,
  saved?: boolean
}> = ({ story, t, onPlay, onSave, onReadScript, onDownloadPDF, isLoggedIn, saved }) => {
  const firstThumbnail = story.episodes[0]?.visual_plan?.[0]?.imageUrl;

  return (
    <div className="bg-zinc-900/50 rounded-[2.5rem] border border-zinc-800 overflow-hidden group hover:border-indigo-500/30 transition-all flex flex-col">
      <div className="aspect-video relative overflow-hidden bg-zinc-800 cursor-pointer" onClick={onPlay}>
        {firstThumbnail ? (
          <img src={firstThumbnail} alt={story.app_title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">📖</div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="text-white font-black text-lg tracking-tight line-clamp-1">{story.app_title}</h4>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
            {story.story_mode === 'toddler' ? '2-3' : '4-5'} {t.opt_years} • {story.language}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onPlay}
            className="col-span-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition-colors"
          >
            {t.lib_listen}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onReadScript(); }}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-colors flex items-center justify-center gap-2"
            title={t.library_read_script}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">{t.lib_script}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onDownloadPDF(); }}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-colors flex items-center justify-center gap-2"
            title={t.button_download_pdf}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">{t.lib_color}</span>
          </button>

          {!saved && onSave && (
            <button
              onClick={onSave}
              className={`col-span-2 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${story.isSaved ? 'bg-green-900/40 text-green-400' : 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={story.isSaved ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-widest">{story.isSaved ? t.player_saved : t.player_save_to_library}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;