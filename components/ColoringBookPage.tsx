
import React, { useState, useMemo } from 'react';
import { StoryResult, UITranslations, Region, StoryMode } from '../types';
import { RAW_REGION_DATA } from './Form';

interface ColoringBookPageProps {
  translations: UITranslations;
  onBack: () => void;
}

const STORY_THEMES = [
  { title: "The Magic Forest", keywords: ["magic", "forest", "owl"], icon: "🦉", char: "A wise little owl named Oliver who can grant wishes." },
  { title: "Rocket to the Moon", keywords: ["space", "moon", "stars"], icon: "🚀", char: "A small astronaut bunny named Luna in a silver spacesuit." },
  { title: "A Day at the Beach", keywords: ["ocean", "sand", "crab"], icon: "🦀", char: "A cheerful crab named Sandy with rosy claws." },
  { title: "The Sleepy Panda", keywords: ["panda", "bamboo", "nap"], icon: "🐼", char: "A fluffy panda named Mochi who loves sleeping in bamboo groves." },
  { title: "Robot's New Friend", keywords: ["robot", "friendship", "gears"], icon: "🤖", char: "A small friendly robot named Bolt with bright blue eyes." },
  { title: "Unicorn Ballet", keywords: ["unicorn", "dance", "rainbow"], icon: "🦄", char: "A graceful unicorn named Star with a flowing rainbow mane." },
  { title: "Dinosaur Picnic", keywords: ["dino", "food", "adventure"], icon: "🦕", char: "A gentle brachiosaurus named Benny who loves sandwiches." },
  { title: "The Secret Garden", keywords: ["flowers", "mystery", "birds"], icon: "🌸", char: "A curious sparrow named Pip with golden feathers." },
  { title: "Snowy Mountain Trip", keywords: ["snow", "mountain", "sled"], icon: "⛄", char: "A cheerful snowman named Flurry with a carrot nose." },
  { title: "The Flying Teapot", keywords: ["magic", "tea", "clouds"], icon: "☁️", char: "A magical teapot named Earl who soars through candy clouds." },
];

const REGION_GRADIENTS: Record<string, string> = {
  portugal: 'from-green-900 to-red-950',
  brazil: 'from-green-800 to-yellow-950',
  france: 'from-blue-900 to-red-950',
  japan: 'from-pink-900 to-red-950',
  india: 'from-orange-800 to-green-950',
  usa: 'from-blue-900 to-red-950',
  australia: 'from-yellow-800 to-red-950',
  china: 'from-red-900 to-yellow-950',
  mexico: 'from-green-900 to-red-950',
  italy: 'from-green-900 to-red-950',
  germany: 'from-zinc-800 to-red-950',
  default: 'from-indigo-900 to-purple-950',
};

const generateColoringStories = (): StoryResult[] => {
  const regions = Object.keys(RAW_REGION_DATA) as Region[];
  const modes: StoryMode[] = ['toddler', 'preschool'];

  return Array.from({ length: 50 }).map((_, i) => {
    const regionKey = regions[i % regions.length];
    const regionData = RAW_REGION_DATA[regionKey];
    const theme = STORY_THEMES[i % STORY_THEMES.length];
    const mode = modes[i % modes.length];

    return {
      id: `cb_${i + 1}`,
      app_title: `${theme.title} in ${regionData.label}`,
      story_mode: mode,
      language: regionData.lang,
      keywords_used: theme.keywords,
      main_character_description: theme.char,
      timestamp: Date.now() - (i * 86400000),
      isSaved: false,
      episodes: [{
        episode_title: `Chapter 1: The Beginning`,
        logline: `A wonderful adventure begins in the heart of ${regionData.label}.`,
        outline: ["Exploring the surroundings", "Meeting a new friend"],
        audio_direction: { voice_gender: 'female', voice_style: 'clear', pace: 'medium', tone: 'warm' },
        ssml_narration: `Once upon a time, in ${regionData.label}...`,
        closing_line: "And they all slept soundly.",
        // No imageUrl — coloring pages show a stylised sketch preview card
        visual_plan: [{ scene: 1, caption: `${theme.char.split(' who')[0]} in ${regionData.label}`, image_prompt: `Children's coloring book outline, ${theme.title}`, start_time_pct: 0 }]
      }]
    };
  });
};

const COLORING_EXAMPLES = generateColoringStories();

const ColoringBookPage: React.FC<ColoringBookPageProps> = ({ translations: t, onBack }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMode, setActiveMode] = useState<StoryMode | 'all'>('all');

  const filtered = useMemo(() => {
    return COLORING_EXAMPLES.filter(s => {
      const matchesSearch = s.app_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.keywords_used.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesMode = activeMode === 'all' || s.story_mode === activeMode;
      return matchesSearch && matchesMode;
    });
  }, [searchTerm, activeMode]);

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
            body { font-family: 'Nunito', sans-serif; margin: 0; padding: 0; color: black; background: white; }
            .page { page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 90vh; text-align: center; }
            .cover h1 { font-family: 'Borel', cursive; font-size: 64pt; margin-bottom: 20pt; }
            .cover h2 { font-size: 24pt; color: #555; }
            .scene-img { width: 100%; max-height: 60vh; object-fit: contain; border: 1px solid #eee; margin-bottom: 30pt; }
            .color-placeholder { width: 80%; height: 300pt; border: 3px dashed #ccc; border-radius: 20pt; display:flex; align-items:center; justify-content:center; margin-bottom: 30pt; }
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
          const sceneDiv = doc.createElement('div');
          sceneDiv.className = 'page';
          if (scene.imageUrl) {
            const outlineUrl = await convertToOutline(scene.imageUrl);
            sceneDiv.innerHTML = `<img src="${outlineUrl}" class="scene-img" /><p class="caption">${scene.caption}</p><p class="footer">Chapter: ${ep.episode_title}</p>`;
          } else {
            sceneDiv.innerHTML = `<div class="color-placeholder"><p style="color:#ddd;font-size:14pt;font-weight:900;text-transform:uppercase;letter-spacing:2pt">${scene.caption}</p></div><p class="caption">${scene.caption}</p><p class="footer">Chapter: ${ep.episode_title} · Color this scene!</p>`;
          }
          doc.body.appendChild(sceneDiv);
        }
      }
    }
    doc.close();
    setIsGeneratingPdf(false);
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-800 pb-8">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter">{t.coloring_book_title || "Magic Coloring Lab"}</h2>
            <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest mt-2">{t.coloring_book_subtitle || "Printable masterpieces from your favorite tales"}</p>
          </div>
          <button onClick={onBack} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.terms_back}
          </button>
        </header>

        {/* Filters */}
        <div className="bg-zinc-900/40 p-5 rounded-[2rem] border border-zinc-800/50 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search stories or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-3 pl-12 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex bg-zinc-800 rounded-2xl p-1 border border-zinc-700 shrink-0">
            {(['all', 'toddler', 'preschool'] as const).map(mode => (
              <button key={mode} onClick={() => setActiveMode(mode)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeMode === mode ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {mode === 'all' ? 'All Ages' : mode === 'toddler' ? '2-3' : '4-5'}
              </button>
            ))}
          </div>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-4 px-2">
          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{filtered.length} coloring {filtered.length === 1 ? 'book' : 'books'}</span>
          <div className="flex-1 h-px bg-zinc-900" />
        </div>

        {/* Loading overlay */}
        {isGeneratingPdf && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-white font-black tracking-widest uppercase text-sm animate-pulse">Sketching Outlines...</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((story, idx) => {
            const thumb = story.episodes[0]?.visual_plan?.[0]?.imageUrl;
            const matchedRegion = Object.entries(RAW_REGION_DATA).find(([, d]) => story.app_title.includes(d.label));
            const regionKey = matchedRegion?.[0] || 'default';
            const gradient = REGION_GRADIENTS[regionKey] || REGION_GRADIENTS.default;
            const flag = RAW_REGION_DATA[regionKey as Region]?.flag || '🌍';
            const icon = STORY_THEMES[idx % STORY_THEMES.length].icon;

            return (
              <div key={story.id} className="bg-zinc-900/40 rounded-[3rem] border border-zinc-800/50 p-8 space-y-8 flex flex-col hover:border-indigo-500/30 transition-all group shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 text-8xl group-hover:opacity-10 transition-opacity">✏️</div>

                {/* Thumbnail / sketch preview */}
                <div className="aspect-[4/3] relative rounded-[2rem] overflow-hidden border-2 border-white/5 bg-white">
                  {thumb ? (
                    <img src={thumb} alt={story.app_title} className="w-full h-full object-cover grayscale opacity-20" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} opacity-30`} />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <span className="text-5xl drop-shadow-lg">{icon}</span>
                    <div className="w-[70%] h-[45%] border-2 border-zinc-300/60 rounded-2xl flex items-center justify-center border-dashed">
                      <span className="text-zinc-400 font-black text-[9px] uppercase tracking-[0.2em] -rotate-6">Colour me!</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  <h3 className="text-xl font-black text-white tracking-tight">{story.app_title}</h3>
                  <p className="text-zinc-500 text-xs font-medium leading-relaxed">{flag} Featuring {story.main_character_description.split(' who')[0]}</p>
                  <div className="flex flex-wrap gap-1">
                    {story.keywords_used.map(k => (
                      <span key={k} className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest bg-zinc-800/50 px-2 py-0.5 rounded-md">#{k}</span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadPDF(story)}
                  className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t.coloring_book_download || "Download Coloring Book"}
                </button>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-32 text-center space-y-4">
            <div className="text-6xl opacity-30">✏️</div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No coloring books match your search</p>
            <button onClick={() => { setSearchTerm(''); setActiveMode('all'); }} className="text-indigo-400 font-black text-xs uppercase tracking-widest underline">Clear filters</button>
          </div>
        )}

        {/* CTA */}
        <div className="p-12 bg-indigo-900/10 border border-indigo-500/20 rounded-[4rem] text-center space-y-6">
          <div className="text-5xl">🖍️</div>
          <h3 className="text-2xl font-black text-white">Every Story is a Canvas</h3>
          <p className="text-zinc-400 max-w-2xl mx-auto font-medium">When you generate a new audiobook in Storia, you can download its unique scenes as a coloring book. Print them out to keep the magic alive even after the story ends.</p>
          <button onClick={onBack} className="px-10 py-4 bg-indigo-600 text-white font-black rounded-full hover:bg-indigo-500 transition-all shadow-xl">Start Creating</button>
        </div>
      </div>
    </div>
  );
};

export default ColoringBookPage;
