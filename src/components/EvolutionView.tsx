import React, { useState, useMemo } from 'react';
import { ArrowUpRight, Sparkles, GitBranch } from 'lucide-react';
import { Idea } from '../types';
import {
  BotanicalBranchDivider,
  BotanicalCornerVine,
  BotanicalSprout,
  PottedPlant,
  WateringCan
} from './BotanicalArt';

interface EvolutionViewProps {
  ideas: Idea[];
  onSelectIdea: (idea: Idea) => void;
  onStartBrainstorm: () => void;
  onBrainstormFromIdea: (idea: Idea) => void;
}

export const EvolutionView: React.FC<EvolutionViewProps> = ({
  ideas,
  onSelectIdea,
  onStartBrainstorm,
  onBrainstormFromIdea
}) => {
  // Filter for ideas that have evolution metadata or evolvedFromIdeaId
  const evolvingIdeas = useMemo(() => {
    return ideas.filter(
      (i) =>
        i.evolution?.hasEvolution ||
        Boolean(i.evolvedFromIdeaId) ||
        (i.evolution?.evolutionPath && i.evolution.evolutionPath.length > 1)
    );
  }, [ideas]);

  const [selectedId, setSelectedId] = useState<string | null>(
    evolvingIdeas.length > 0 ? evolvingIdeas[0].id : ideas.length > 0 ? ideas[0].id : null
  );

  const selectedIdea = useMemo(() => {
    return ideas.find((i) => i.id === selectedId) || evolvingIdeas[0] || ideas[0] || null;
  }, [ideas, selectedId, evolvingIdeas]);

  // Stage mapping
  const stageIcons: Record<string, { icon: string; label: string; desc: string }> = {
    seed: { icon: '🌰', label: 'Seed', desc: 'Raw intuition planted in soil' },
    sprout: { icon: '🌱', label: 'Sprout', desc: 'First green leaf breaking surface' },
    refinement: { icon: '🌿', label: 'Growing Idea', desc: 'Strengthening stem & mechanisms' },
    new_direction: { icon: '🌳', label: 'New Direction', desc: 'Flowering into fresh paradigm' },
    mature: { icon: '🌳', label: 'Mature Canopy', desc: 'Full botanical arbor' }
  };

  if (ideas.length === 0 || evolvingIdeas.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-[#EBF3EA] border border-[#BED6BA] text-[#2C522E] flex items-center justify-center mx-auto shadow-2xs">
          <PottedPlant size={56} />
        </div>
        <div>
          <h2 className="font-serif text-3xl font-bold text-[#1E3621]">
            Some ideas need a little more time to grow.
          </h2>
          <p className="font-handwriting text-xl text-[#756858] mt-2 max-w-md mx-auto">
            As you continue conversing in the greenhouse notebook, Gemini tracks how your thoughts develop from initial seeds into mature branches.
          </p>
        </div>
        <div>
          <button
            onClick={onStartBrainstorm}
            className="px-6 py-3 bg-[#2A4C2E] hover:bg-[#1E3922] text-[#FAF7F0] rounded-full text-sm font-serif font-semibold inline-flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <span>🌱 Nurture an idea</span>
          </button>
        </div>
      </div>
    );
  }

  // Build the vertical growth sequence for selected idea
  const rawPath = selectedIdea?.evolution?.evolutionPath || [selectedIdea?.title || 'Initial Seed'];
  const stagesSequence = [
    { stage: 'seed', icon: '🌰', title: 'Seed' },
    { stage: 'sprout', icon: '🌱', title: 'Sprout' },
    { stage: 'growing', icon: '🌿', title: 'Growing Idea' },
    { stage: 'direction', icon: '🌳', title: 'New Direction' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="text-center space-y-1">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1E3621] font-normal">
          Idea Growth & Evolution
        </h1>
        <p className="font-handwriting text-xl text-[#756858]">
          "Watching an intuition sprout, branch, and transform over time."
        </p>
        <BotanicalBranchDivider className="opacity-70 my-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Evolving Plants Shelf */}
        <div className="lg:col-span-4 bg-[#FCFAF5] border border-[#DDD3BF] rounded-3xl p-5 shadow-2xs paper-ruled space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3DAC8]">
            <span className="font-serif text-sm font-bold text-[#1E3621]">
              Evolving Lineages ({evolvingIdeas.length})
            </span>
            <span className="font-handwriting text-xs text-[#8A7D6F]">
              Select to view stem
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {evolvingIdeas.map((idea) => {
              const isSelected = idea.id === selectedIdea?.id;

              return (
                <button
                  key={idea.id}
                  onClick={() => setSelectedId(idea.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EBF3E9] border-[#4B7049] shadow-xs'
                      : 'bg-[#FFFDF9] border-[#E5DEC9] hover:border-[#96B593]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-serif font-semibold text-[#1E3621] truncate">
                      {idea.title}
                    </span>
                    <span className="text-sm">
                      {idea.evolutionStage === 'new_direction'
                        ? '🌳'
                        : idea.evolutionStage === 'refinement'
                        ? '🌿'
                        : '🌱'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6E6152] line-clamp-1 font-body">
                    {idea.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Vertical Botanical Plant Growth Path */}
        <div className="lg:col-span-8 space-y-6">
          {selectedIdea && (
            <div className="bg-[#FFFDF9] border-2 border-[#DDD3BF] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden paper-ruled">
              <BotanicalCornerVine position="top-right" className="absolute top-0 right-0 w-16 h-16 opacity-30" />

              <div className="flex items-center justify-between pb-4 border-b border-[#E8DFC9]">
                <div>
                  <span className="font-handwriting text-base text-[#756858]">
                    Botanical Specimen Lineage
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#1E3621]">
                    {selectedIdea.title}
                  </h2>
                </div>
                <button
                  onClick={() => onBrainstormFromIdea(selectedIdea)}
                  className="px-4 py-2 rounded-full bg-[#2A4C2E] text-[#FAF7F0] text-xs font-serif font-semibold flex items-center gap-1.5 shadow-2xs hover:bg-[#1E3922] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F0D59A]" />
                  <span>Grow Further</span>
                </button>
              </div>

              {/* Vertical Growth Path */}
              <div className="my-8 relative pl-6 sm:pl-10 space-y-8">
                {/* Vertical Vine Stem line */}
                <div className="absolute left-[29px] sm:left-[45px] top-6 bottom-6 w-1 bg-gradient-to-b from-[#8CA888] via-[#5C8C59] to-[#2E5431] rounded-full" />

                {rawPath.map((step, idx) => {
                  const stageIcon =
                    idx === 0
                      ? '🌰'
                      : idx === 1
                      ? '🌱'
                      : idx === 2
                      ? '🌿'
                      : '🌳';

                  const stageTitle =
                    idx === 0
                      ? 'Seed'
                      : idx === 1
                      ? 'Sprout'
                      : idx === 2
                      ? 'Growing Idea'
                      : 'New Direction';

                  return (
                    <div key={idx} className="relative flex items-start gap-4 sm:gap-6 group">
                      {/* Illustrated Botanical Marker */}
                      <div className="w-12 h-12 rounded-full bg-[#FAF6EE] border-2 border-[#5C8C59] flex items-center justify-center text-xl shadow-xs shrink-0 z-10">
                        {stageIcon}
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 p-4 rounded-2xl bg-[#FCFAF6] border border-[#DDD3BF] shadow-2xs group-hover:border-[#5C8C59] transition-all">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-handwriting text-base text-[#7A6E5F]">
                            Step {idx + 1} • {stageTitle}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#1E3621]">
                          {step}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Evolution Narrative / Field Note */}
              {selectedIdea.evolution?.narrative && (
                <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#E3DAC8] shadow-2xs">
                  <span className="font-serif text-xs font-bold text-[#1E3621] uppercase tracking-wider block mb-1">
                    Evolution Narrative
                  </span>
                  <p className="font-handwriting text-lg text-[#3D3328] leading-relaxed">
                    &ldquo;{selectedIdea.evolution.narrative}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
