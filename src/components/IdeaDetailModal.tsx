import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Network,
  GitBranch,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Loader2,
  Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Idea, IdeaConnection } from '../types';
import { discoverConnections } from '../services/geminiService';
import { saveIdeaToFirestore } from '../services/firestoreService';
import { BotanicalSprout, BotanicalStageIcon, BotanicalCornerVine } from './BotanicalArt';

interface IdeaDetailModalProps {
  idea: Idea;
  allIdeas: Idea[];
  onClose: () => void;
  onSelectConnectedIdea: (connectedIdeaId: string) => void;
  onBrainstormFromIdea: (idea: Idea) => void;
  onIdeaUpdated: (updatedIdea: Idea) => void;
  onDeleteIdea: (ideaId: string) => void;
}

export const IdeaDetailModal: React.FC<IdeaDetailModalProps> = ({
  idea,
  allIdeas,
  onClose,
  onSelectConnectedIdea,
  onBrainstormFromIdea,
  onIdeaUpdated,
  onDeleteIdea
}) => {
  const [activeTab, setActiveTab] = useState<'synthesis' | 'connections' | 'evolution'>('synthesis');
  const [refreshingConnections, setRefreshingConnections] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const getRelationshipBadge = (type: string) => {
    switch (type) {
      case 'extends':
        return {
          label: '🌿 Extends Concept',
          style: 'bg-[#EBF3E9] text-[#2C522F] border-[#BED6BB]'
        };
      case 'refines':
        return {
          label: '🌱 Refines Earlier Plant',
          style: 'bg-[#E8F2EF] text-[#245447] border-[#BCD8D0]'
        };
      case 'combines':
        return {
          label: '🪴 Cross-Pollinates Concepts',
          style: 'bg-[#F2EDF8] text-[#552D75] border-[#D6C4E6]'
        };
      case 'alternative_direction':
        return {
          label: '🌼 Alternative Branch',
          style: 'bg-[#FEF5E7] text-[#8C581E] border-[#EED0A4]'
        };
      case 'contradicts':
        return {
          label: '🍂 Challenges Assumption',
          style: 'bg-[#FDF0EE] text-[#9E3628] border-[#F2C5BD]'
        };
      default:
        return {
          label: 'Connected Tendril',
          style: 'bg-[#EFE8DA] text-[#44382D] border-[#DDD2BE]'
        };
    }
  };

  const handleRefreshConnections = async () => {
    setRefreshingConnections(true);
    setRefreshMessage('Comparing against all your ideas in Firestore...');
    try {
      const otherIdeas = allIdeas.filter((i) => i.id !== idea.id);
      const result = await discoverConnections(
        {
          title: idea.title,
          description: idea.description,
          content: idea.content,
          topicTags: idea.topicTags,
          keyConcepts: idea.keyConcepts,
          evolutionStage: idea.evolutionStage
        },
        otherIdeas
      );

      const updatedIdea: Idea = {
        ...idea,
        connections: result.connections,
        evolution: result.evolution,
        updatedAt: new Date().toISOString()
      };

      await saveIdeaToFirestore(idea.userId, updatedIdea);
      onIdeaUpdated(updatedIdea);
      setRefreshMessage(`Discovered ${result.connections.length} conceptual tendrils.`);
      setTimeout(() => setRefreshMessage(null), 3000);
    } catch (err: any) {
      setRefreshMessage(`Analysis failed: ${err.message || 'Unknown error'}`);
    } finally {
      setRefreshingConnections(false);
    }
  };

  const predecessorIdea = idea.evolvedFromIdeaId
    ? allIdeas.find((i) => i.id === idea.evolvedFromIdeaId)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-[#25201C]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FFFDF9] border border-[#DDD3BF] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl text-[#2D2522] animate-scaleIn overflow-hidden paper-ruled relative">
        <BotanicalCornerVine className="top-0 right-0 w-24 h-24 pointer-events-none opacity-30 text-[#3B663E]" />

        {/* Modal Header */}
        <div className="p-6 border-b border-[#E3DAC8] flex items-start justify-between gap-4 bg-[#FCFAF5]/90">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] px-3 py-1 rounded-full bg-[#EBF2EA] text-[#2E5431] border border-[#C5DBC3] font-semibold font-body inline-flex items-center gap-1.5 shadow-xs">
                <BotanicalStageIcon stage={idea.evolutionStage} size={13} />
                <span className="capitalize">{idea.evolutionStage.replace('_', ' ')}</span>
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#7A6E5F] font-body">
                <Calendar className="w-3.5 h-3.5 text-[#3B5B39]" />
                <span>Planted {new Date(idea.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
              </div>
            </div>

            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1E3621] leading-tight">
              {idea.title}
            </h2>

            <p className="text-sm text-[#5C5042] leading-relaxed max-w-2xl font-body">
              {idea.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onBrainstormFromIdea(idea)}
              className="px-3 py-2 text-[#2A4C2E] hover:bg-[#EAE2D1] rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-[#DDD3BF] bg-[#FFFDF9] shadow-xs"
              title="Nurture further in greenhouse"
            >
              <Sparkles className="w-4 h-4 text-[#C26749]" />
              <span className="hidden sm:inline">Brainstorm More</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to remove "${idea.title}" from your garden?`)) {
                  onDeleteIdea(idea.id);
                  onClose();
                }
              }}
              className="p-2 text-[#9A8D7E] hover:text-[#B94435] hover:bg-[#FDF0EE] rounded-xl transition-colors cursor-pointer border border-[#DDD3BF] bg-[#FFFDF9]"
              title="Remove from Garden"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#7A6E5F] hover:text-[#2D2522] hover:bg-[#EAE2D1] rounded-xl transition-colors cursor-pointer border border-[#DDD3BF] bg-[#FFFDF9]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 border-b border-[#E3DAC8] bg-[#FAF6EE]">
          <button
            onClick={() => setActiveTab('synthesis')}
            className={`flex items-center gap-2 py-3.5 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'synthesis'
                ? 'border-[#2A4C2E] text-[#1E3621]'
                : 'border-transparent text-[#7A6E5F] hover:text-[#2D2522]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#3B5B39]" />
            <span>Botanical Specimen</span>
          </button>

          <button
            onClick={() => setActiveTab('connections')}
            className={`flex items-center gap-2 py-3.5 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'connections'
                ? 'border-[#2A4C2E] text-[#1E3621]'
                : 'border-transparent text-[#7A6E5F] hover:text-[#2D2522]'
            }`}
          >
            <Network className="w-4 h-4 text-[#3B5B39]" />
            <span>Living Tendrils ({idea.connections?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('evolution')}
            className={`flex items-center gap-2 py-3.5 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'evolution'
                ? 'border-[#2A4C2E] text-[#1E3621]'
                : 'border-transparent text-[#7A6E5F] hover:text-[#2D2522]'
            }`}
          >
            <GitBranch className="w-4 h-4 text-[#3B5B39]" />
            <span>Growth & Lineage</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Structured Synthesis */}
          {activeTab === 'synthesis' && (
            <div className="space-y-6">
              {/* Tags and Concepts */}
              <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-[#FAF6EE] border border-[#DDD3BF] shadow-xs">
                {idea.topicTags?.length > 0 && (
                  <div>
                    <span className="block text-[11px] font-semibold text-[#665A4D] uppercase tracking-wider mb-2 font-body">
                      Specimen Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {idea.topicTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2.5 py-1 rounded-full bg-[#FCFAF5] border border-[#DDD3BF] text-[#2A4C2E] font-mono shadow-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {idea.keyConcepts?.length > 0 && (
                  <div>
                    <span className="block text-[11px] font-semibold text-[#665A4D] uppercase tracking-wider mb-2 font-body">
                      Key Intuitions
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {idea.keyConcepts.map((concept, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2.5 py-1 rounded-full bg-[#FCFAF5] border border-[#DDD3BF] text-[#44382D] font-body shadow-xs"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Markdown Content */}
              <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-[#1E3621] prose-p:text-[#2D2522] prose-p:leading-relaxed text-sm bg-[#FCFAF5] p-5 rounded-2xl border border-[#E3DAC8] shadow-xs">
                <ReactMarkdown>{idea.content}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* TAB 2: Connections */}
          {activeTab === 'connections' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1E3621]">
                    Living Tendrils & Conceptual Bridges
                  </h3>
                  <p className="text-xs text-[#6B5E50] font-body">
                    Gemini analyzes conceptual overlaps, contradictions, extensions, and cross-pollinations across your private ideas.
                  </p>
                </div>

                <button
                  onClick={handleRefreshConnections}
                  disabled={refreshingConnections}
                  className="px-3.5 py-2 rounded-xl bg-[#2A4C2E] hover:bg-[#203D24] text-[#FAF7F0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs border border-[#1E3A21]"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-[#F3D78A] ${refreshingConnections ? 'animate-spin' : ''}`}
                  />
                  <span>Re-discover Tendrils</span>
                </button>
              </div>

              {refreshMessage && (
                <div className="p-3 bg-[#EAF2E8] border border-[#C5DBC3] rounded-xl text-xs text-[#2C522E] font-body">
                  {refreshMessage}
                </div>
              )}

              {idea.connections && idea.connections.length > 0 ? (
                <div className="space-y-3.5">
                  {idea.connections.map((conn: IdeaConnection, idx: number) => {
                    const badge = getRelationshipBadge(conn.relationshipType);
                    const targetIdea = allIdeas.find((i) => i.id === conn.connectedIdeaId);

                    return (
                      <div
                        key={idx}
                        className="bg-[#FCFAF5] border border-[#DDD3BF] rounded-2xl p-4.5 hover:border-[#8CA988] transition-colors shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.style}`}
                          >
                            {badge.label}
                          </span>

                          {targetIdea && (
                            <button
                              onClick={() => onSelectConnectedIdea(conn.connectedIdeaId)}
                              className="text-xs text-[#2A4C2E] hover:text-[#19331B] flex items-center gap-1 cursor-pointer font-semibold"
                            >
                              <span>Inspect Linked Plant</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <h4 className="font-serif font-bold text-[#1E3621] text-base">
                          {conn.connectedIdeaTitle || targetIdea?.title || 'Connected Concept'}
                        </h4>

                        <p className="mt-2 text-xs text-[#5C5042] leading-relaxed pl-3 border-l-2 border-[#3B663E] font-body">
                          {conn.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 px-4 bg-[#FCFAF5] rounded-2xl border border-[#DDD3BF] shadow-xs">
                  <Network className="w-10 h-10 text-[#8C8071] mx-auto mb-3" />
                  <h4 className="font-serif text-lg font-bold text-[#1E3621]">
                    No Tendrils Sprouted Yet
                  </h4>
                  <p className="text-xs text-[#665A4D] mt-1 max-w-sm mx-auto font-body leading-relaxed">
                    As you plant more thoughts in your Idea Garden, Gemini will automatically detect meaningful conceptual tendrils and bridges.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Evolution */}
          {activeTab === 'evolution' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1E3621]">
                  Plant Growth & Lineage
                </h3>
                <p className="text-xs text-[#6B5E50] font-body">
                  Tracking how your ideas mature from initial seeds, pivot, and branch into new creative directions.
                </p>
              </div>

              {/* Vertical Organic Evolution Progression Path */}
              {idea.evolution?.evolutionPath && idea.evolution.evolutionPath.length > 0 ? (
                <div className="p-6 bg-[#FAF6EE] border border-[#DDD3BF] rounded-2xl space-y-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E3DAC8]">
                    <span className="text-xs font-semibold text-[#2C522E] uppercase tracking-wider font-body flex items-center gap-1.5">
                      <BotanicalSprout size={16} />
                      <span>Growth & Branching Lineage</span>
                    </span>
                    <span className="text-[11px] text-[#7A6E5F] font-body">
                      Natural progression from seed to bloom
                    </span>
                  </div>

                  {/* Vertical Botanical Path */}
                  <div className="relative pl-6 space-y-6 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-[#D69F4A] before:via-[#5C8C59] before:to-[#C26749]">
                    {idea.evolution.evolutionPath.map((step, idx) => {
                      // Map stages visually
                      const isFirst = idx === 0;
                      const isLast = idx === idea.evolution!.evolutionPath!.length - 1;
                      const stageIcon = isFirst ? '🌱' : isLast ? '🌼' : '🌿';
                      const stageName = isFirst ? 'Original Seed' : isLast ? 'New Direction' : 'Refinement';

                      return (
                        <div key={idx} className="relative flex items-start gap-4">
                          {/* Node Icon on vine */}
                          <div className="absolute -left-[30px] top-1 w-6 h-6 rounded-full bg-[#FFFDF9] border-2 border-[#5C8C59] flex items-center justify-center text-xs shadow-2xs z-10">
                            <span>{stageIcon}</span>
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 p-4 rounded-xl bg-[#FFFDF9] border border-[#DDD3BF] shadow-2xs">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A6E5F] font-mono">
                                Stage 0{idx + 1} &bull; {stageName}
                              </span>
                            </div>
                            <h5 className="font-serif font-bold text-sm text-[#1E3621]">
                              {step}
                            </h5>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {idea.evolution.narrative && (
                    <div className="mt-4 p-4 rounded-xl bg-[#FFFDF9] border border-[#E3DAC8] text-xs text-[#5C5042] leading-relaxed font-body shadow-2xs">
                      <span className="font-semibold text-[#1E3621] block mb-1 font-serif text-sm">
                        Botanical Narrative:
                      </span>
                      <p className="pl-3 border-l-2 border-[#5C8C59]">
                        {idea.evolution.narrative}
                      </p>
                    </div>
                  )}
                </div>
              ) : predecessorIdea ? (
                <div className="p-6 bg-[#FAF6EE] border border-[#DDD3BF] rounded-2xl space-y-4 shadow-xs">
                  <span className="text-xs font-semibold text-[#552D75] uppercase tracking-wider block font-body">
                    Direct Predecessor Seedling
                  </span>
                  <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#DDD3BF] flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-xs font-semibold text-[#1E3621] font-serif">{predecessorIdea.title}</span>
                      <p className="text-xs text-[#6A5D4F] mt-1 line-clamp-1 font-body">{predecessorIdea.description}</p>
                    </div>
                    <button
                      onClick={() => onSelectConnectedIdea(predecessorIdea.id)}
                      className="text-xs text-[#2A4C2E] hover:text-[#19331B] flex items-center gap-1 ml-4 shrink-0 font-semibold cursor-pointer"
                    >
                      <span>Inspect Predecessor</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 px-4 bg-[#FCFAF5] rounded-2xl border border-[#DDD3BF] shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-[#EAF2E7] border border-[#C6DBC5] text-[#31562F] flex items-center justify-center mx-auto mb-3">
                    <BotanicalSprout size={32} />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-[#1E3621]">
                    Seed State (Original Thought)
                  </h4>
                  <p className="text-xs sm:text-sm text-[#665A4D] mt-1.5 max-w-md mx-auto font-body leading-relaxed">
                    This idea was planted as an initial seed. As you explore refinements, question assumptions, or branch into new directions with Gemini, its growth lineage will blossom here.
                  </p>
                  <button
                    onClick={() => onBrainstormFromIdea(idea)}
                    className="mt-5 px-5 py-2.5 bg-[#2A4C2E] hover:bg-[#203D24] text-[#FAF7F0] rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer border border-[#1E3A21]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F3D78A]" />
                    <span>Nurture & Evolve with Gemini</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

