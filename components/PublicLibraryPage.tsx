
import React, { useState, useMemo, useEffect } from 'react';
import { StoryResult, UITranslations, Region, StoryMode } from '../types';
import { RAW_REGION_DATA } from './Form';
import { apiGetPublicStories } from '../services/api';

interface PublicLibraryPageProps {
  translations: UITranslations;
  onSelectStory: (s: StoryResult) => void;
  onGoToColoring: () => void;
  onBack: () => void;
}

// Region-themed gradient fallbacks when no illustration image is available
const REGION_GRADIENTS: Record<string, string> = {
  portugal: 'from-green-800 to-red-900',
  brazil: 'from-green-700 to-yellow-700',
  france: 'from-blue-800 to-red-800',
  japan: 'from-pink-800 to-red-900',
  india: 'from-orange-700 to-green-800',
  usa: 'from-blue-800 to-red-800',
  australia: 'from-yellow-700 to-red-800',
  china: 'from-red-800 to-yellow-700',
  mexico: 'from-green-700 to-red-800',
  italy: 'from-green-700 to-red-800',
  germany: 'from-zinc-800 to-red-900',
  default: 'from-indigo-900 to-purple-900',
};

function getGradient(regionKey: string) {
  return REGION_GRADIENTS[regionKey] || REGION_GRADIENTS.default;
}

const PublicLibraryPage: React.FC<PublicLibraryPageProps> = ({ translations: t, onSelectStory, onGoToColoring, onBack }) => {
  const [stories, setStories] = useState<StoryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMode, setActiveMode] = useState<StoryMode | 'all'>('all');

  useEffect(() => {
    apiGetPublicStories()
      .then(setStories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredStories = useMemo(() => {
    return stories.filter(s => {
      const matchesSearch = s.app_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.keywords_used?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesMode = activeMode === 'all' || s.story_mode === activeMode;
      return matchesSearch && matchesMode;
    });
  }, [stories, searchTerm, activeMode]);

  return (
    <div className="min-h-screen bg-black py-12 px-4 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header */}
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
            <button onClick={onGoToColoring} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all flex items-center gap-2 text-sm shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Coloring Pages
            </button>
            <button onClick={onBack} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.terms_back}
            </button>
          </div>
        </div>

        {/* Filters */}
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

        {/* Counter */}
        {!loading && (
          <div className="flex items-center gap-4 px-4">
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              {filteredStories.length} magical {filteredStories.length === 1 ? 'story' : 'stories'}
            </span>
            <div className="flex-1 h-px bg-zinc-900"></div>
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Story Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredStories.map(story => {
              // Use the first available illustration image from any scene
              const thumbUrl = story.episodes?.[0]?.visual_plan?.find(v => v.imageUrl)?.imageUrl;
              const regionKey = (story as any).region || 'default';
              const gradient = getGradient(regionKey);
              const regionFlag = RAW_REGION_DATA[regionKey as Region]?.flag || '🌍';

              return (
                <div key={story.id} className="bg-zinc-900/50 rounded-[3rem] border border-zinc-800 overflow-hidden group hover:border-indigo-500/50 transition-all flex flex-col shadow-2xl">
                  <div className="aspect-[16/10] relative overflow-hidden cursor-pointer" onClick={() => onSelectStory(story)}>
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={story.app_title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-3 group-hover:scale-105 transition-transform duration-1000`}>
                        <span className="text-5xl drop-shadow-lg">{regionFlag}</span>
                        <span className="text-white/50 text-[9px] font-black uppercase tracking-widest px-6 text-center leading-relaxed">
                          {story.app_title?.split(' ').slice(0, 5).join(' ')}
                        </span>
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                    {/* Badges */}
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
                        {story.keywords_used?.map(k => (
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
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredStories.length === 0 && (
          <div className="py-40 text-center space-y-6">
            <div className="text-6xl opacity-30">✨</div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
              {stories.length === 0
                ? 'No public stories yet — be the first to share!'
                : 'No stories match your filter'}
            </p>
            {stories.length > 0 && (
              <button
                onClick={() => { setSearchTerm(''); setActiveMode('all'); }}
                className="text-indigo-400 font-black text-xs uppercase tracking-[0.2em] underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicLibraryPage;
