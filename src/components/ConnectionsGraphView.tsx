import React, { useState, useMemo } from 'react';
import { Sparkles, ArrowRight, ArrowUpRight, Filter, Info, HeartHandshake } from 'lucide-react';
import { Idea, IdeaConnection } from '../types';
import {
  BotanicalSprout,
  BotanicalStageIcon,
  WateringCan,
  BotanicalBranchDivider,
  BotanicalCornerVine,
  HanddrawnWavyUnderline
} from './BotanicalArt';

interface ConnectionsGraphViewProps {
  ideas: Idea[];
  onSelectIdea: (idea: Idea) => void;
  onStartBrainstorm: () => void;
}

export const ConnectionsGraphView: React.FC<ConnectionsGraphViewProps> = ({
  ideas,
  onSelectIdea,
  onStartBrainstorm
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    ideas.length > 0 ? ideas[0].id : null
  );
  const [selectedConnectionIdx, setSelectedConnectionIdx] = useState<number>(0);

  // Collect all ideas that have at least one connection
  const connectedIdeas = useMemo(() => {
    return ideas.filter((i) => i.connections && i.connections.length > 0);
  }, [ideas]);

  const totalConnectionsCount = useMemo(() => {
    return ideas.reduce((acc, i) => acc + (i.connections?.length || 0), 0);
  }, [ideas]);

  const selectedIdea = useMemo(() => {
    if (selectedNodeId) {
      return ideas.find((i) => i.id === selectedNodeId) || null;
    }
    return connectedIdeas.length > 0 ? connectedIdeas[0] : ideas[0] || null;
  }, [ideas, selectedNodeId, connectedIdeas]);

  const activeConnection: IdeaConnection | null = useMemo(() => {
    if (!selectedIdea || !selectedIdea.connections || selectedIdea.connections.length === 0) {
      return null;
    }
    const idx = Math.min(selectedConnectionIdx, selectedIdea.connections.length - 1);
    return selectedIdea.connections[idx];
  }, [selectedIdea, selectedConnectionIdx]);

  const connectedTargetIdea: Idea | null = useMemo(() => {
    if (!activeConnection) return null;
    return ideas.find((i) => i.id === activeConnection.connectedIdeaId) || null;
  }, [ideas, activeConnection]);

  // If no connections in the entire garden yet
  if (totalConnectionsCount === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-[#EBF3EA] border border-[#BED6BA] text-[#2C522E] flex items-center justify-center mx-auto shadow-2xs">
          <WateringCan size={56} />
        </div>
        <div>
          <h2 className="font-serif text-3xl font-bold text-[#1E3621]">
            No ideas have crossed paths yet.
          </h2>
          <p className="font-handwriting text-xl text-[#756858] mt-2 max-w-md mx-auto">
            When you plant multiple thoughts into your garden, Gemini will detect when their roots touch and weave conceptual vines between them.
          </p>
        </div>
        <div>
          <button
            onClick={onStartBrainstorm}
            className="px-6 py-3 bg-[#2A4C2E] hover:bg-[#1E3922] text-[#FAF7F0] rounded-full text-sm font-serif font-semibold inline-flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <span>🌱 Plant another idea</span>
          </button>
        </div>
      </div>
    );
  }

  const getRelationshipTag = (type: string) => {
    switch (type) {
      case 'extends':
        return { label: 'Extends Concept', icon: '🌿', color: 'bg-[#EAF3E8] text-[#28502B] border-[#BFD6BC]' };
      case 'refines':
        return { label: 'Refines Premise', icon: '🌱', color: 'bg-[#EBF1F5] text-[#204961] border-[#BCD1DE]' };
      case 'combines':
        return { label: 'Cross-Pollinates', icon: '🪴', color: 'bg-[#F2EDF8] text-[#552D75] border-[#D6C4E6]' };
      case 'alternative_direction':
        return { label: 'Alternative Branch', icon: '🌼', color: 'bg-[#FEF5E7] text-[#8C581E] border-[#EED0A4]' };
      case 'contradicts':
        return { label: 'Challenges Assumption', icon: '🍂', color: 'bg-[#FDF0EE] text-[#9E3628] border-[#F2C5BD]' };
      default:
        return { label: 'Living Tendril', icon: '🌿', color: 'bg-[#EFE8DA] text-[#44382D] border-[#DDD2BE]' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="text-center space-y-1">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1E3621] font-normal">
          Living Conceptual Vines
        </h1>
        <p className="font-handwriting text-xl text-[#756858]">
          "Where separate thoughts intertwine and cross-pollinate."
        </p>
        <BotanicalBranchDivider className="opacity-70 my-2" />
      </div>

      {/* Main Tendril Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Plant Selection Shelf */}
        <div className="lg:col-span-4 bg-[#FCFAF5] border border-[#DDD3BF] rounded-3xl p-5 shadow-2xs paper-ruled space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3DAC8]">
            <span className="font-serif text-sm font-bold text-[#1E3621]">
              Planted Specimens ({connectedIdeas.length})
            </span>
            <span className="font-handwriting text-xs text-[#8A7D6F]">
              Click to trace vines
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {ideas.map((idea) => {
              const isSelected = idea.id === selectedIdea?.id;
              const tendrilCount = idea.connections?.length || 0;

              return (
                <button
                  key={idea.id}
                  onClick={() => {
                    setSelectedNodeId(idea.id);
                    setSelectedConnectionIdx(0);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EBF3E9] border-[#4B7049] shadow-xs'
                      : 'bg-[#FFFDF9] border-[#E5DEC9] hover:border-[#96B593]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-serif font-semibold text-[#1E3621] truncate">
                      🌱 {idea.title}
                    </span>
                    {tendrilCount > 0 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E5EFE4] text-[#28502B] border border-[#C5DBC3] font-mono shrink-0">
                        {tendrilCount} {tendrilCount === 1 ? 'tendril' : 'tendrils'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#A69988] font-mono shrink-0">
                        solo seed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6E6152] line-clamp-1 font-body">
                    {idea.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: The Organic Stem & Vine Representation */}
        <div className="lg:col-span-8 space-y-6">
          {selectedIdea && activeConnection ? (
            <div className="bg-[#FFFDF9] border-2 border-[#DDD3BF] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden paper-ruled">
              <BotanicalCornerVine position="top-right" className="absolute top-0 right-0 w-16 h-16 opacity-30" />

              {/* Multiple Tendril Tabs if Idea connects to multiple */}
              {selectedIdea.connections && selectedIdea.connections.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-[#EAE1CF]">
                  <span className="font-handwriting text-sm text-[#756858] shrink-0">
                    Vines from this plant:
                  </span>
                  {selectedIdea.connections.map((conn, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedConnectionIdx(idx)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer font-serif shrink-0 ${
                        selectedConnectionIdx === idx
                          ? 'bg-[#2A4C2E] text-[#FAF7F0] border-[#1E3A21]'
                          : 'bg-[#FCFAF5] text-[#55493C] border-[#DDD3BF] hover:border-[#8CA988]'
                      }`}
                    >
                      Vine #{idx + 1}: {conn.connectedIdeaTitle?.slice(0, 18)}...
                    </button>
                  ))}
                </div>
              )}

              {/* The Illustrated Vine Diagram (Plant A -> Curved Stem -> Plant B) */}
              <div className="my-6 relative py-4">
                <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                  {/* Plant A */}
                  <div
                    onClick={() => onSelectIdea(selectedIdea)}
                    className="md:col-span-5 p-4 rounded-2xl bg-[#FCFAF5] border border-[#DDD3BF] shadow-2xs hover:border-[#5A8257] cursor-pointer transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-handwriting text-sm text-[#8A7D6F]">Plant A (Origin)</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#5A7E56]" />
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#1E3621] line-clamp-2">
                      🌱 {selectedIdea.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#6B5E50] line-clamp-2 font-body">
                      {selectedIdea.description}
                    </p>
                  </div>

                  {/* Organic Vine Stems SVG Diagram */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center py-2">
                    <svg
                      width="50"
                      height="70"
                      viewBox="0 0 50 70"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="hidden md:block"
                    >
                      <path
                        d="M5 15C25 15 25 55 45 55"
                        stroke="#5A8257"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="3 3"
                      />
                      <path
                        d="M5 55C25 55 25 15 45 15"
                        stroke="#7CA479"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="3 3"
                      />
                      <circle cx="25" cy="35" r="7" fill="#C26749" />
                      <circle cx="25" cy="35" r="3.5" fill="#FAF6EE" />
                    </svg>
                    <div className="md:hidden flex items-center justify-center text-[#5A8257] font-bold text-lg">
                      ↕ 🌿
                    </div>
                  </div>

                  {/* Plant B */}
                  <div
                    onClick={() => connectedTargetIdea && onSelectIdea(connectedTargetIdea)}
                    className="md:col-span-5 p-4 rounded-2xl bg-[#FCFAF5] border border-[#DDD3BF] shadow-2xs hover:border-[#5A8257] cursor-pointer transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-handwriting text-sm text-[#8A7D6F]">Plant B (Cross-Pollinated)</span>
                      {connectedTargetIdea && <ArrowUpRight className="w-3.5 h-3.5 text-[#5A7E56]" />}
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#1E3621] line-clamp-2">
                      🌿 {connectedTargetIdea?.title || activeConnection.connectedIdeaTitle}
                    </h3>
                    <p className="mt-1 text-xs text-[#6B5E50] line-clamp-2 font-body">
                      {connectedTargetIdea?.description || 'Connected botanical record.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Handwritten Garden Note: The Connection Explanation */}
              <div className="mt-6 p-5 rounded-2xl bg-[#FFFDF7] border border-[#E3DAC8] shadow-2xs relative">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-serif font-medium flex items-center gap-1 ${
                      getRelationshipTag(activeConnection.relationshipType).color
                    }`}
                  >
                    <span>{getRelationshipTag(activeConnection.relationshipType).icon}</span>
                    <span>{getRelationshipTag(activeConnection.relationshipType).label}</span>
                  </span>
                  <span className="font-handwriting text-base text-[#8A7D6F]">
                    — Gardener&apos;s Field Note
                  </span>
                </div>

                <div className="text-base sm:text-lg font-handwriting text-[#3D3328] leading-relaxed pl-2 border-l-2 border-[#C26749]">
                  &ldquo;{activeConnection.explanation}&rdquo;
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFDF9] border border-[#DDD3BF] rounded-3xl p-10 text-center space-y-3 paper-ruled">
              <BotanicalSprout size={36} className="mx-auto text-[#5A7E56]" />
              <h3 className="font-serif text-xl font-bold text-[#1E3621]">
                Solo Seed in Garden Bed
              </h3>
              <p className="font-handwriting text-lg text-[#6E6152] max-w-md mx-auto">
                &ldquo;{selectedIdea?.title}&rdquo; hasn&apos;t intertwined with another idea yet. Plant more thoughts to cultivate connections!
              </p>
              <button
                onClick={onStartBrainstorm}
                className="mt-3 px-5 py-2 rounded-full bg-[#2A4C2E] text-[#FAF7F0] text-xs font-serif font-semibold cursor-pointer"
              >
                Plant Next Idea
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
