import React from 'react';
import { Idea } from '../types';
import { Network, GitBranch, ArrowUpRight, Trash2, Calendar, Sparkles } from 'lucide-react';
import { BotanicalStageIcon, BotanicalCornerVine } from './BotanicalArt';

interface IdeaCardProps {
  idea: Idea;
  onSelect: (idea: Idea) => void;
  onDelete: (ideaId: string, e: React.MouseEvent) => void;
  onBrainstormFromIdea: (idea: Idea, e: React.MouseEvent) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  onSelect,
  onDelete,
  onBrainstormFromIdea
}) => {
  const getStageBadgeStyle = (stage: string) => {
    switch (stage) {
      case 'seed':
        return {
          label: 'Seed Idea',
          classes: 'bg-[#F9EED9] text-[#8C6225] border-[#E5CCA0]'
        };
      case 'refinement':
        return {
          label: 'Refinement',
          classes: 'bg-[#E7EFE4] text-[#2C522F] border-[#BED4B8]'
        };
      case 'new_direction':
        return {
          label: 'New Direction',
          classes: 'bg-[#FBECE6] text-[#A64F31] border-[#E8C2B3]'
        };
      case 'mature':
        return {
          label: 'Mature Concept',
          classes: 'bg-[#DEEADB] text-[#1E3E22] border-[#ADC7A6]'
        };
      default:
        return {
          label: stage,
          classes: 'bg-[#F2ECE1] text-[#6E6354] border-[#DDD3C2]'
        };
    }
  };

  const stageInfo = getStageBadgeStyle(idea.evolutionStage);
  const connectionsCount = idea.connections?.length || 0;
  const hasEvolution = Boolean(idea.evolution?.hasEvolution || idea.evolvedFromIdeaId);

  return (
    <div
      onClick={() => onSelect(idea)}
      className="group bg-[#FFFDF9] hover:bg-[#FFFEFC] border border-[#DDD3BF] hover:border-[#6B8E68] rounded-2xl p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-[0_12px_28px_-6px_rgba(40,65,35,0.12)] hover:-translate-y-1.5 hover:rotate-[0.6deg] relative overflow-hidden paper-ruled seed-packet-edge"
    >
      {/* Botanical Corner Vine */}
      <BotanicalCornerVine
        position="top-right"
        className="absolute top-0 right-0 w-14 h-14 opacity-20 group-hover:opacity-65 transition-opacity pointer-events-none"
      />

      <div>
        {/* Seed Packet Header Band */}
        <div className="flex items-center justify-between gap-2 mb-3 pt-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-serif font-bold tracking-wide px-2.5 py-0.5 rounded-md border shadow-2xs flex items-center gap-1.5 ${stageInfo.classes}`}
            >
              <BotanicalStageIcon stage={idea.evolutionStage} size={14} />
              <span>{stageInfo.label}</span>
            </span>
            <span className="font-handwriting text-xs text-[#8A7D6F] hidden sm:inline">
              pkt. #{idea.id.slice(-4)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {hasEvolution && (
              <span
                title="Evolving plant lineage"
                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#F4EBF7] text-[#6B3782] border border-[#DFC7E5] font-body font-medium shadow-2xs"
              >
                <GitBranch className="w-3 h-3 text-[#7B3F96]" />
                <span className="hidden sm:inline">Lineage</span>
              </span>
            )}

            {connectionsCount > 0 && (
              <span
                title={`${connectionsCount} living conceptual vines`}
                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#E5EFE4] text-[#2C522F] border border-[#C2D8C0] font-body font-medium shadow-2xs"
              >
                <Network className="w-3 h-3 text-[#3B663E]" />
                <span>{connectionsCount} {connectionsCount === 1 ? 'tendril' : 'tendrils'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Planted Specimen Title */}
        <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1E3621] group-hover:text-[#2A522C] transition-colors line-clamp-2 leading-snug">
          {idea.title}
        </h3>

        {/* Field Notes Description */}
        <p className="mt-2 text-[#5A4C3F] text-xs sm:text-sm line-clamp-3 leading-relaxed font-body">
          {idea.description || 'No botanical field notes recorded yet.'}
        </p>

        {/* Garden Stake Topic Tags */}
        {idea.topicTags && idea.topicTags.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {idea.topicTags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-sm bg-[#F5EDE1] text-[#4F4133] border border-[#D9CDBC] border-b-2 border-b-[#C9BCAB] font-mono shadow-2xs hover:border-[#8CA988] transition-colors"
              >
                🌱 {tag}
              </span>
            ))}
            {idea.topicTags.length > 4 && (
              <span className="text-[10px] px-1.5 py-0.5 text-[#8A7D6E] font-mono">
                +{idea.topicTags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Specimen Ledger */}
      <div className="mt-5 pt-3 border-t border-[#E8DFC9] flex items-center justify-between text-xs text-[#7A6E60]">
        <div className="flex items-center gap-1.5 font-handwriting text-sm text-[#786C5F]">
          <Calendar className="w-3.5 h-3.5 text-[#887867]" />
          <span>Planted {new Date(idea.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => onBrainstormFromIdea(idea, e)}
            title="Nurture in greenhouse notebook"
            className="px-2 py-1 text-[#2C522E] hover:text-[#18361A] hover:bg-[#EAE2D1] rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-medium text-[11px] border border-transparent hover:border-[#C6D8C4]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
            <span className="hidden sm:inline">Nurture</span>
          </button>

          <button
            onClick={(e) => onDelete(idea.id, e)}
            title="Prune Idea"
            className="p-1.5 text-[#8A7D6F] hover:text-[#C84A3B] hover:bg-[#FBECEB] rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="p-1 text-[#8A7D6F] group-hover:text-[#203622] group-hover:translate-x-0.5 transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

