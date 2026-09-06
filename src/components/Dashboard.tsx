import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowRight,
  Sprout
} from 'lucide-react';
import { Idea, UserProfile } from '../types';
import { IdeaCard } from './IdeaCard';
import {
  PottedPlant,
  WateringCan,
  BotanicalBranchDivider,
  BotanicalCornerVine,
  HanddrawnWavyUnderline
} from './BotanicalArt';

interface DashboardProps {
  user: UserProfile;
  ideas: Idea[];
  onSelectIdea: (idea: Idea) => void;
  onDeleteIdea: (ideaId: string, e: React.MouseEvent) => void;
  onBrainstormFromIdea: (idea: Idea, e: React.MouseEvent) => void;
  onStartBrainstorm: (initialThought?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  ideas,
  onSelectIdea,
  onDeleteIdea,
  onBrainstormFromIdea,
  onStartBrainstorm
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [quickThought, setQuickThought] = useState('');

  // Compute all available tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    ideas.forEach((i) => i.topicTags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [ideas]);

  // Filter ideas
  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const matchesSearch =
        !searchQuery.trim() ||
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.topicTags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        idea.keyConcepts?.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = !selectedTag || idea.topicTags?.includes(selectedTag);
      const matchesStage = stageFilter === 'all' || idea.evolutionStage === stageFilter;

      return matchesSearch && matchesTag && matchesStage;
    });
  }, [ideas, searchQuery, selectedTag, stageFilter]);

  const handlePlantThought = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickThought.trim()) {
      onStartBrainstorm(quickThought.trim());
      setQuickThought('');
    } else {
      onStartBrainstorm();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Large Editorial / Handwritten Greeting */}
      <div className="text-center pt-2 pb-1">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1E3621] tracking-tight font-normal">
          What&apos;s growing in your mind today?
        </h1>
        <p className="font-handwriting text-lg sm:text-xl text-[#756655] mt-1">
          A quiet space for half-formed thoughts, curious questions, and ideas ready to take root.
        </p>

        {/* Small Botanical Divider */}
        <BotanicalBranchDivider className="my-3 opacity-80" />
      </div>

      {/* 2. Visual Centerpiece: The Large Open "Garden Notebook" Area */}
      <div className="relative mx-auto max-w-3xl">
        {/* Soft botanical shadow & paper texture */}
        <div className="bg-[#FFFDF8] border-2 border-[#D8CEBC] rounded-3xl p-6 sm:p-9 shadow-[0_8px_30px_rgba(55,40,25,0.06)] relative overflow-hidden paper-ruled sketch-border">
          {/* Decorative Corner Vines */}
          <BotanicalCornerVine position="top-left" className="absolute top-0 left-0 w-16 h-16 opacity-35" />
          <BotanicalCornerVine position="bottom-right" className="absolute bottom-0 right-0 w-16 h-16 opacity-35" />

          <form onSubmit={handlePlantThought} className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm sm:text-base font-serif font-bold text-[#1E3621]">
                <span className="text-xl">🌱</span>
                <span>Plant a thought...</span>
              </div>
              <span className="font-handwriting text-xs text-[#8A7D6F]">
                Field Notebook • Spring
              </span>
            </div>

            <div className="relative">
              <textarea
                value={quickThought}
                onChange={(e) => setQuickThought(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    handlePlantThought(e);
                  }
                }}
                rows={4}
                placeholder="I've been wondering whether we could combine vertical urban gardens with local composting micro-grids..."
                className="w-full bg-transparent border-0 text-[#2D2522] placeholder-[#9E9182] focus:ring-0 focus:outline-none resize-none text-base sm:text-lg font-serif leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#EAE1CF]">
              <div className="flex items-center gap-2 text-xs text-[#7A6D5E] font-handwriting text-base">
                <span>Press ⌘+Enter or click to cultivate with Gemini</span>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#2A4C2E] hover:bg-[#1E3922] text-[#FAF7F0] rounded-full text-sm font-serif font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Let it grow</span>
                <ArrowRight className="w-4 h-4 text-[#F0D59A]" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. Garden Bed / Planted Ideas Section */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E3D9C7]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <h2 className="font-serif text-2xl font-bold text-[#1E3621]">
                Planted Ideas in Soil
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#E5EFE4] text-[#2C522F] border border-[#C5DBC3]">
                {ideas.length}
              </span>
            </div>
            <p className="font-handwriting text-base text-[#756858] mt-0.5">
              Specimens collected and cross-pollinated over time
            </p>
          </div>

          {/* Organic Search & Stage Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8A7D6F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search garden notes..."
                className="pl-9 pr-7 py-1.5 bg-[#FFFDF9] border border-[#DDD3BF] focus:border-[#4B7049] rounded-xl text-xs sm:text-sm text-[#2D2522] placeholder-[#8A7E70] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A7E70] hover:text-[#2D2522] text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Stage filter pills */}
            <div className="flex items-center gap-1 bg-[#F5EDE1] p-1 rounded-xl border border-[#DDD1BE]">
              {[
                { id: 'all', label: 'All' },
                { id: 'seed', label: '🌱 Seed' },
                { id: 'refinement', label: '🌿 Refined' },
                { id: 'new_direction', label: '🌼 Branch' },
                { id: 'mature', label: '🌳 Mature' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStageFilter(st.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    stageFilter === st.id
                      ? 'bg-[#2E5230] text-[#FAF7F0] font-semibold shadow-2xs'
                      : 'text-[#6B5E4E] hover:text-[#203622]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Specimen Tags Row */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="font-handwriting text-base text-[#756858] mr-1">Specimen tags:</span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="px-2 py-0.5 rounded-sm bg-[#EFE8DA] text-[#342D26] border border-[#D5C9B3] font-mono flex items-center gap-1 cursor-pointer"
              >
                <span>Clear (#{selectedTag})</span>
                <span className="font-bold">×</span>
              </button>
            )}
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded-sm border font-mono transition-colors cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-[#2E5230] text-[#FAF7F0] border-[#224024] shadow-2xs'
                    : 'bg-[#FFFDF9] text-[#63574A] border-[#E0D7C5] hover:border-[#8CA988]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Ideas Grid: Rendered as Seed Packets / Garden Folios */}
        {filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onSelect={onSelectIdea}
                onDelete={onDeleteIdea}
                onBrainstormFromIdea={onBrainstormFromIdea}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-[#FCFAF5] border-2 border-dashed border-[#DDD3BF] rounded-3xl paper-ruled">
            {ideas.length === 0 ? (
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#EBF3EA] border border-[#BED6BA] text-[#2C522E] flex items-center justify-center mx-auto shadow-2xs">
                  <WateringCan size={46} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1E3621]">
                  Your garden is waiting for its first seed.
                </h3>
                <p className="font-handwriting text-lg text-[#6B5E50] leading-relaxed">
                  Plant a thought above or open the greenhouse notebook to let your first idea sprout.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onStartBrainstorm()}
                    className="px-6 py-2.5 bg-[#2A4C2E] hover:bg-[#1E3922] text-[#FAF7F0] rounded-full text-sm font-serif font-semibold inline-flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>🌱 Plant your first idea</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EBE5D8] flex items-center justify-center mx-auto text-[#735F48]">
                  <PottedPlant size={28} />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#203622]">
                  No matching plants found in this soil
                </h3>
                <p className="text-xs text-[#7A6E5F] font-body">
                  Try clearing your search or resetting the selected stage filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag(null);
                    setStageFilter('all');
                  }}
                  className="text-xs px-3 py-1 rounded-md bg-[#EAE2D1] text-[#342D26] hover:bg-[#DFD5C2] font-semibold cursor-pointer"
                >
                  Reset Garden Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
