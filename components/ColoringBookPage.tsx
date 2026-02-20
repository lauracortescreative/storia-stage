
import React, { useState } from 'react';
import { StoryResult, UITranslations } from '../types';

interface ColoringBookPageProps {
  translations: UITranslations;
  onBack: () => void;
}

// Curated public stories used for coloring book examples
const COLORING_EXAMPLES: StoryResult[] = [
  {
    id: 'cb_1',
    app_title: "The Moon-Cheese Mystery",
    story_mode: 'preschool',
    language: 'English',
    keywords_used: ['moon', 'cheese', 'mouse', 'rocket'],
    main_character_description: "A small adventurous mouse named Barnaby wearing a silver astronaut suit.",
    timestamp: Date.now(),
    isSaved: false,
    episodes: [
      {
        episode_title: "Blast Off to the Big Round Cheese",
        logline: "Barnaby builds a rocket out of a soda can and heads to the moon.",
        outline: ["Building the rocket", "The long journey", "The first bite of moon cheese"],
        audio_direction: { voice_gender: 'male', voice_style: 'clear', pace: 'medium', tone: 'excited' },
        ssml_narration: "Barnaby the mouse looked at the big, yellow moon.",
        closing_line: "The moon was tasty.",
        visual_plan: [
          { 
            scene: 1, 
            caption: "Barnaby looking at the moon through a telescope", 
            image_prompt: "mouse in space suit with telescope", 
            start_time_pct: 0, 
            imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000" 
          }
        ]
      }
    ]
  },
  {
    id: 'cb_2',
    app_title: "The Kyoto Crystal Dragon",
    story_mode: 'toddler',
    language: 'English',
    keywords_used: ['dragon', 'Japan', 'tea', 'garden'],
    main_character_description: "A gentle emerald green dragon with paper-thin wings.",
    timestamp: Date.now(),
    isSaved: false,
    episodes: [
      {
        episode_title: "Tea Time at the Golden Pavilion",
        logline: "Yuki the dragon invites the town to a magical tea party.",
        outline: ["Brewing magic tea"],
        audio_direction: { voice_gender: 'female', voice_style: 'whisper', pace: 'slow', tone: 'calm' },
        ssml_narration: "High in the misty mountains lives Yuki.",
        closing_line: "Peaceful and warm.",
        visual_plan: [
          { 
            scene: 1, 
            caption: "Yuki the dragon brewing tea in a Zen garden", 
            image_prompt: "emerald dragon zen garden", 
            start_time_pct: 0, 
            imageUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=1000" 
          }
        ]
      }
    ]
  },
  {
    id: 'cb_3',
    app_title: "Coco & The Jungle Rhythm",
    story_mode: 'preschool',
    language: 'English',
    keywords_used: ['chocolate', 'Brazil', 'fairy', 'rainforest'],
    main_character_description: "A tiny fairy with wings made of cocoa leaves.",
    timestamp: Date.now(),
    isSaved: false,
    episodes: [
      {
        episode_title: "The Great Amazon Chocolate Hunt",
        logline: "Coco helps find the lost golden cocoa bean.",
        outline: ["Finding the Golden Bean"],
        audio_direction: { voice_gender: 'neutral', voice_style: 'clear', pace: 'medium', tone: 'playful' },
        ssml_narration: "Deep in the green Amazon rainforest...",
        closing_line: "Smelled like chocolate.",
        visual_plan: [
          { 
            scene: 1, 
            caption: "Coco the leaf-winged fairy finding a glowing cocoa bean", 
            image_prompt: "leaf fairy rainforest", 
            start_time_pct: 0, 
            imageUrl: "https://images.unsplash.com/photo-1550684848-86a5d8727436?auto=format&fit=crop&q=80&w=1000" 
          }
        ]
      }
    ]
  }
];

const ColoringBookPage: React.FC<ColoringBookPageProps> = ({ translations: t, onBack }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  return (
    <div className="min-h-screen bg-black py-12 px-4 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
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

        {isGeneratingPdf && (
           <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-white font-black tracking-widest uppercase text-sm animate-pulse">Sketching Outlines...</p>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {COLORING_EXAMPLES.map(story => (
            <div key={story.id} className="bg-zinc-900/40 rounded-[3rem] border border-zinc-800/50 p-8 space-y-8 flex flex-col hover:border-indigo-500/30 transition-all group shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 text-8xl group-hover:opacity-10 transition-opacity">✏️</div>
              <div className="aspect-[4/3] relative rounded-[2rem] overflow-hidden border-2 border-white/5 bg-white">
                <img 
                  src={story.episodes[0].visual_plan?.[0].imageUrl} 
                  alt={story.app_title} 
                  className="w-full h-full object-cover grayscale opacity-20"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-[80%] h-[80%] border-4 border-zinc-200 rounded-[1.5rem] flex items-center justify-center bg-transparent border-dashed">
                      <span className="text-zinc-300 font-black text-xs uppercase tracking-[0.2em] -rotate-12">Outline Preview</span>
                   </div>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                 <h3 className="text-2xl font-black text-white tracking-tight">{story.app_title}</h3>
                 <p className="text-zinc-500 text-sm font-medium leading-relaxed">Featuring ${story.main_character_description}</p>
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
          ))}
        </div>
        
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
