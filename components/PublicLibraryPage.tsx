
import React, { useState, useMemo } from 'react';
import { StoryResult, UITranslations, Region, StoryMode } from '../types';
import { RAW_REGION_DATA } from './Form';

interface PublicLibraryPageProps {
  translations: UITranslations;
  onSelectStory: (s: StoryResult) => void;
  onGoToColoring: () => void;
  onBack: () => void;
}

// Generate 50 mock stories for the public library
const generatePublicStories = (): StoryResult[] => {
  const regions = Object.keys(RAW_REGION_DATA) as Region[];
  const modes: StoryMode[] = ['toddler', 'preschool'];
  const storyThemes = [
    { title: "The Magic Forest", keywords: ["magic", "forest", "owl"] },
    { title: "Rocket to the Moon", keywords: ["space", "moon", "stars"] },
    { title: "A Day at the Beach", keywords: ["ocean", "sand", "crab"] },
    { title: "The Sleepy Panda", keywords: ["panda", "bamboo", "nap"] },
    { title: "Robot's New Friend", keywords: ["robot", "friend", "gears"] },
    { title: "Unicorn Ballet", keywords: ["unicorn", "dance", "rainbow"] },
    { title: "Dinosaur Picnic", keywords: ["dino", "food", "park"] },
    { title: "The Secret Garden", keywords: ["flowers", "key", "birds"] },
    { title: "Snowy Mountain Trip", keywords: ["snow", "mountain", "ski"] },
    { title: "Flying Teapot", keywords: ["magic", "tea", "clouds"] }
  ];

  const placeholderImages = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1550684848-86a5d8727436?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000"
  ];

  return Array.from({ length: 50 }).map((_, i) => {
    const regionKey = regions[i % regions.length];
    const regionData = RAW_REGION_DATA[regionKey];
    const theme = storyThemes[i % storyThemes.length];
    const mode = modes[i % modes.length];
    const imgUrl = placeholderImages[i % placeholderImages.length];

    return {
      id: `pub_${i + 1}`,
      app_title: `${theme.title} in ${regionData.label}`,
      story_mode: mode,
      language: regionData.lang,
      keywords_used: theme.keywords,
      main_character_description: `A curious little adventurer from ${regionData.label}.`,
      timestamp: Date.now() - (i * 86400000),
      isSaved: false,
      episodes: [
        {
          episode_title: `Chapter 1: The Beginning`,
          logline: `A wonderful adventure begins in the heart of ${regionData.label}.`,
          outline: ["Exploring the surroundings", "Meeting a new friend"],
          audio_direction: { voice_gender: 'female', voice_style: 'clear', pace: 'medium', tone: 'warm' },
          ssml_narration: `Once upon a time, in ${regionData.label}, there was a magical ${theme.keywords[0]}. It was a beautiful day for a story.`,
          closing_line: "And they all slept soundly.",
          visual_plan: [
            { 
              scene: 1, 
              caption: `An illustration of the ${theme.keywords[0]}`, 
              image_prompt: `Children's storybook illustration in ${regionKey} style, ${theme.title}`, 
              start_time_pct: 0, 
              imageUrl: imgUrl 
            }
          ]
        }
      ]
    };
  });
};

const PUBLIC_STORIES = generatePublicStories();

const PublicLibraryPage: React.FC<PublicLibraryPageProps> = ({ translations: t, onSelectStory, onGoToColoring, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRegion, setActiveRegion] = useState<Region | 'all'>('all');
  const [activeMode, setActiveMode] = useState<StoryMode | 'all'>('all');

  const filteredStories = useMemo(() => {
    return PUBLIC_STORIES.filter(s => {
      const matchesSearch = s.app_title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.keywords_used.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRegion = activeRegion === 'all' || s.app_title.includes(RAW_REGION_DATA[activeRegion].label);
      const matchesMode = activeMode === 'all' || s.story_mode === activeMode;
      return matchesSearch && matchesRegion && matchesMode;
    });
  }, [searchTerm, activeRegion, activeMode]);

  return (
    <div className="min-h-screen bg-black py-12 px-4 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-zinc-800 pb-12">
          <div className="text-center md:text-left">
            <h2 className="text-5xl font-black text-white tracking-tighter">
              {t.public_library_title || "Community Gems"}
            </h2>
            <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest mt-2">
              {t.public_library_subtitle || "Explore stories shared by families worldwide"}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={onGoToColoring}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all flex items-center gap-2 text-sm shadow-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Coloring Pages
            </button>
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
        </div>

        {/* Filter Bar */}
        <div className="bg-zinc-900/40 p-6 rounded-[2.5rem] border border-zinc-800/50 flex flex-col lg:flex-row items-center gap-6">
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

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <select 
              value={activeRegion}
              onChange={(e) => setActiveRegion(e.target.value as any)}
              className="bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none pr-10 relative min-w-[160px]"
            >
              <option value="all">All Regions</option>
              {Object.entries(RAW_REGION_DATA).map(([key, data]) => (
                <option key={key} value={key}>{data.flag} {data.label}</option>
              ))}
            </select>

            <div className="flex bg-zinc-800 rounded-2xl p-1 border border-zinc-700">
              {(['all', 'toddler', 'preschool'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setActiveMode(mode)}
                  className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeMode === mode ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {mode === 'all' ? 'All Ages' : mode === 'toddler' ? '2-3' : '4-5'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center gap-4 px-4">
           <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
             Found {filteredStories.length} magical stories
           </span>
           <div className="flex-1 h-px bg-zinc-900"></div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredStories.map(story => (
            <div 
              key={story.id} 
              className="bg-zinc-900/50 rounded-[3rem] border border-zinc-800 overflow-hidden group hover:border-indigo-500/50 transition-all flex flex-col shadow-2xl relative"
            >
              <div className="aspect-[16/10] relative overflow-hidden bg-zinc-800 cursor-pointer" onClick={() => onSelectStory(story)}>
                <img 
                  src={story.episodes[0].visual_plan?.[0].imageUrl} 
                  alt={story.app_title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-indigo-600 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20">
                    {story.story_mode === 'toddler' ? '2-3' : '4-5'}
                  </span>
                  <span className="bg-black/60 backdrop-blur-md text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
                    {story.language}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-white tracking-tight leading-tight group-hover:text-indigo-400 transition-colors">{story.app_title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {story.keywords_used.map(k => (
                      <span key={k} className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-2 py-1 rounded-md">#{k}</span>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => onSelectStory(story)}
                  className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-xl active:scale-95 text-sm"
                >
                  {t.public_library_explore_cta || "Watch Now"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredStories.length === 0 && (
          <div className="py-40 text-center space-y-6">
            <div className="text-6xl opacity-30">✨</div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest">No stories match your filter</p>
            <button 
              onClick={() => { setSearchTerm(''); setActiveRegion('all'); setActiveMode('all'); }}
              className="text-indigo-400 font-black text-xs uppercase tracking-[0.2em] underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicLibraryPage;
