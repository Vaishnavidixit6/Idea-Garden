import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Sprout,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Idea, UserProfile } from '../types';
import { sendChatMessage, synthesizeIdea, discoverConnections } from '../services/geminiService';
import { saveIdeaToFirestore, saveConversationToFirestore } from '../services/firestoreService';
import { BotanicalLeafFlourish } from './BotanicalArt';

interface BrainstormChatProps {
  user: UserProfile;
  existingIdeas: Idea[];
  initialIdeaContext?: Idea | null;
  initialPlantedThought?: string | null;
  onIdeaSaved: (savedIdea: Idea) => void;
  onViewIdeaDetail: (idea: Idea) => void;
}

const PROMPT_SUGGESTIONS = [
  'Explore a contrarian angle on this problem',
  'What are the non-obvious failure modes?',
  'Find an analogy in biology or evolutionary theory',
  'Synthesize this into a minimum viable experiment'
];

export const BrainstormChat: React.FC<BrainstormChatProps> = ({
  user,
  existingIdeas,
  initialIdeaContext,
  initialPlantedThought,
  onIdeaSaved,
  onViewIdeaDetail
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialIdeaContext) {
      return [
        {
          id: 'init-1',
          role: 'user',
          content: `I want to evolve and explore this idea further: "${initialIdeaContext.title}".\n\nSummary: ${initialIdeaContext.description}\n\nWhat are the next conceptual frontiers or blind spots?`,
          timestamp: new Date().toISOString()
        }
      ];
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Welcome to your private **Idea Garden** greenhouse notebook.\n\nShare a raw thought, half-baked intuition, or complex challenge. We will stress-test assumptions, explore analogous domains, and nurture it into a structured concept ready for your idea garden.`,
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [input, setInput] = useState(() => initialPlantedThought || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synthesis modal state
  const [synthesizing, setSynthesizing] = useState(false);
  const [isSynthesizeOpen, setIsSynthesizeOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [draftConcepts, setDraftConcepts] = useState<string[]>([]);
  const [draftStage, setDraftStage] = useState<'seed' | 'refinement' | 'new_direction' | 'mature'>('seed');

  // Saving state
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [savedResult, setSavedResult] = useState<Idea | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Initial call if seeded with an existing idea
  useEffect(() => {
    if (initialIdeaContext && messages.length === 1 && messages[0].role === 'user') {
      const runInitialTurn = async () => {
        setLoading(true);
        try {
          const reply = await sendChatMessage(messages);
          setMessages((prev) => [
            ...prev,
            {
              id: 'init-reply',
              role: 'assistant',
              content: reply,
              timestamp: new Date().toISOString()
            }
          ]);
        } catch (err: any) {
          setError(err.message || 'Failed to initialize brainstorm.');
        } finally {
          setLoading(false);
        }
      };
      runInitialTurn();
    }
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || input).trim();
    if (!content || loading) return;

    setError(null);
    setInput('');

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setLoading(true);

    try {
      const reply = await sendChatMessage(newHistory);
      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString()
      };
      const finalHistory = [...newHistory, assistantMessage];
      setMessages(finalHistory);

      // Persist conversation to user's isolated subcollection in background
      saveConversationToFirestore(user.uid, {
        id: `conv-${Date.now()}`,
        userId: user.uid,
        title: userMessage.content.slice(0, 50) || 'Exploration Session',
        messages: finalHistory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }).catch((e) => console.warn('Could not auto-save conversation history:', e));
    } catch (err: any) {
      setError(err.message || 'Failed to receive response from Gemini. Your input has been saved.');
      // Restore user text in input box if failed so they never lose work
      setInput(content);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Trigger Gemini structured synthesis
  const handleStartCultivate = async () => {
    setSynthesizing(true);
    setError(null);
    try {
      // Collect user contributions and conversation flow
      const userText = messages
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .join('\n\n');

      const synthesis = await synthesizeIdea(userText, messages);

      setDraftTitle(synthesis.title);
      setDraftDescription(synthesis.description);
      setDraftContent(synthesis.content);
      setDraftTags(synthesis.topicTags || []);
      setDraftConcepts(synthesis.keyConcepts || []);
      setDraftStage(synthesis.evolutionStage || 'seed');
      setIsSynthesizeOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to synthesize idea with Gemini.');
    } finally {
      setSynthesizing(false);
    }
  };

  // Save the structured idea to Firestore and run connections engine
  const handleConfirmSaveIdea = async () => {
    if (!draftTitle.trim()) {
      setError('Idea title cannot be empty.');
      return;
    }

    setSaving(true);
    setSaveStatus('Cultivating seed in Firestore...');
    setError(null);

    const ideaId = `idea-${Date.now()}`;
    const newIdea: Idea = {
      id: ideaId,
      userId: user.uid,
      title: draftTitle.trim(),
      description: draftDescription.trim(),
      content: draftContent.trim(),
      topicTags: draftTags,
      keyConcepts: draftConcepts,
      evolutionStage: draftStage,
      evolvedFromIdeaId: initialIdeaContext?.id,
      connections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // Step 1: Save base idea to Firestore first (ensure data persistence)
      await saveIdeaToFirestore(user.uid, newIdea);

      // Step 2: Compare strictly against authenticated user's existing ideas
      setSaveStatus('Discovering conceptual connections with Gemini...');
      let finalIdea = { ...newIdea };

      try {
        const relationalResult = await discoverConnections(
          {
            title: newIdea.title,
            description: newIdea.description,
            content: newIdea.content,
            topicTags: newIdea.topicTags,
            keyConcepts: newIdea.keyConcepts,
            evolutionStage: newIdea.evolutionStage
          },
          existingIdeas.filter((i) => i.id !== ideaId)
        );

        if (relationalResult.connections?.length > 0) {
          finalIdea.connections = relationalResult.connections;
        }

        if (relationalResult.evolution) {
          finalIdea.evolution = relationalResult.evolution;
          if (relationalResult.evolution.stage) {
            finalIdea.evolutionStage = relationalResult.evolution.stage;
          }
          if (relationalResult.evolution.predecessorIdeaId) {
            finalIdea.evolvedFromIdeaId = relationalResult.evolution.predecessorIdeaId;
          }
        }

        // Update Firestore with discovered connections & evolution
        await saveIdeaToFirestore(user.uid, finalIdea);
      } catch (connErr: any) {
        console.warn('Connection discovery non-blocking warning:', connErr);
        // If connections engine failed, base idea was still securely persisted!
      }

      setSavedResult(finalIdea);
      onIdeaSaved(finalIdea);
    } catch (err: any) {
      setError(
        `Gemini generated the idea, but Firestore persistence failed: ${
          err.message || 'Unknown error'
        }. Please check permissions.`
      );
    } finally {
      setSaving(false);
      setSaveStatus(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E3DAC8]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1E3621]">Brainstorming Plot</h2>
            <BotanicalLeafFlourish />
            <span className="text-[11px] px-3 py-0.5 rounded-full bg-[#EBF2EA] text-[#2E5431] border border-[#C5DBC3] font-mono">
              gemini-3.8-flash
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6A5D4F] mt-0.5 font-body">
            A quiet greenhouse notebook to test intuitions, explore metaphors, and cultivate branching thoughts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartCultivate}
            disabled={synthesizing || loading || messages.length < 2}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2A4C2E] hover:bg-[#203D24] text-[#FAF7F0] text-xs sm:text-sm font-semibold shadow-xs transition-all disabled:opacity-40 cursor-pointer border border-[#1E3A21]"
          >
            {synthesizing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sprout className="w-4 h-4 text-[#F3D78A]" />
            )}
            <span>Cultivate into Saved Idea</span>
          </button>
        </div>
      </div>

      {/* Error notification banner */}
      {error && (
        <div className="mt-3 p-3 bg-[#FDF0EE] border border-[#F2C5BD] rounded-xl text-xs text-[#9E3628] flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-[#C84A3B] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Notice: </span>
            {error}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-[#C84A3B] hover:text-[#9E3628] font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Messages list - Field Notebook format */}
      <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-full bg-[#E8EFE5] border border-[#C6D8C4] text-[#2C502D] flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                  <span className="text-sm">🍃</span>
                </div>
              )}

              {/* Note container */}
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4.5 text-sm leading-relaxed shadow-2xs transition-all ${
                  isAssistant
                    ? 'bg-[#FFFDF9] border border-[#E0D7C4] text-[#2D2522] paper-ruled'
                    : 'bg-[#F9F3E8] border border-[#E5DAC6] text-[#2D2522] rounded-br-xs relative'
                }`}
              >
                {!isAssistant && (
                  <div className="flex items-center gap-1 mb-1 text-[11px] font-handwriting text-[#8A7D6E]">
                    <span>🌱 Your Thought</span>
                  </div>
                )}

                {isAssistant ? (
                  <div className="prose prose-stone max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-[#1E3621] text-[#2D2522] text-xs sm:text-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-xs sm:text-sm font-body text-[#382E26] leading-relaxed">
                    {msg.content}
                  </p>
                )}

                <div
                  className={`mt-2 text-[10px] font-mono ${
                    isAssistant ? 'text-[#8C8071]' : 'text-[#8F8171]'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start items-center text-xs text-[#6B5E50] pl-1">
            <div className="w-8 h-8 rounded-full bg-[#E8EFE5] border border-[#C6D8C4] text-[#2C502D] flex items-center justify-center shadow-2xs">
              <span className="text-sm animate-gentle-sway">🌱</span>
            </div>
            <div className="bg-[#FFFDF9] border border-[#E3DAC8] px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-xs paper-ruled font-handwriting text-base">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2E5431]" />
              <span className="text-[#4A3E31]">Nurturing the seedling with Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested thought starters styled like creative seed packets */}
      {messages.length < 5 && (
        <div className="py-2 flex flex-wrap gap-2">
          {PROMPT_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(sug)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full bg-[#FCFAF5] border border-[#DDD3BF] text-[#55493C] hover:text-[#1E3621] hover:border-[#8CA988] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 font-serif shadow-2xs"
            >
              <span>🌱</span>
              <span>{sug}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Form - Writing Surface */}
      <div className="pt-2 border-t border-[#E3DAC8]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2 bg-[#FFFDF8] border-2 border-[#DDD3BF] focus-within:border-[#4B7049] rounded-2xl p-2.5 transition-colors shadow-2xs paper-ruled"
        >
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Plant a thought, question, or wild possibility..."
            className="flex-1 bg-transparent border-0 resize-none text-[#2D2522] placeholder-[#948777] text-xs sm:text-sm focus:outline-none p-2 font-serif text-base leading-relaxed"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-[#2A4C2E] hover:bg-[#1E3922] text-[#FAF7F0] rounded-xl disabled:opacity-40 transition-all cursor-pointer shadow-xs border border-[#1E3A21]"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[11px] text-[#7A6E60]">
          <span className="flex items-center gap-1.5 font-handwriting text-sm text-[#786B5D]">
            <span>🌱 Private garden notebook &bull; Rooted in secure Firestore soil</span>
          </span>
          <span className="font-mono text-[10px] hidden sm:inline text-[#8A7D6F]">
            Shift + Enter for new line
          </span>
        </div>
      </div>

      {/* Modal: Gemini Structured Synthesis & Save Confirmation */}
      {isSynthesizeOpen && (
        <div className="fixed inset-0 z-50 bg-[#25201C]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] border border-[#DDD3BF] rounded-3xl max-w-2xl w-full p-6 text-[#2D2522] shadow-xl animate-scaleIn relative paper-ruled">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3DAC8]">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#2C522E]" />
                <h3 className="font-serif font-bold text-xl text-[#1E3621]">Plant into Idea Garden</h3>
              </div>
              <button
                onClick={() => {
                  setIsSynthesizeOpen(false);
                  setSavedResult(null);
                }}
                className="text-[#8C8071] hover:text-[#2D2522] text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            {savedResult ? (
              /* Success State */
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E8EFE5] border border-[#BED4B8] text-[#2C522E] flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-2xl text-[#1E3621]">
                  Idea Planted in Garden! 🌱
                </h4>
                <p className="text-sm text-[#5C5043] max-w-md mx-auto leading-relaxed">
                  &ldquo;{savedResult.title}&rdquo; has taken root in your private Firestore plot.
                  {savedResult.connections?.length > 0 && (
                    <span className="block mt-2 text-[#2C522E] font-medium">
                      🌿 Gemini discovered {savedResult.connections.length} conceptual vines linking to your previous ideas!
                    </span>
                  )}
                  {savedResult.evolution?.hasEvolution && (
                    <span className="block mt-1 text-[#783D94] font-medium">
                      🌳 Evolution branch recorded: {savedResult.evolution.evolutionPath?.join(' → ')}
                    </span>
                  )}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsSynthesizeOpen(false);
                      onViewIdeaDetail(savedResult);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#2A4C2E] hover:bg-[#203D24] text-[#FAF7F0] rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>View Idea Details & Living Vines</span>
                    <ArrowRight className="w-4 h-4 text-[#F3D78A]" />
                  </button>
                  <button
                    onClick={() => {
                      setIsSynthesizeOpen(false);
                      setSavedResult(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#EAE2D1] hover:bg-[#DFD6C3] text-[#3B3229] rounded-xl text-xs sm:text-sm font-medium cursor-pointer"
                  >
                    Continue Brainstorming
                  </button>
                </div>
              </div>
            ) : (
              /* Form State */
              <div className="mt-4 space-y-4">
                <p className="text-xs text-[#6A5D4F]">
                  Gemini analyzed your brainstorm and generated this structured plant specimen. You can review or tailor before planting into your private garden.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D40] uppercase tracking-wider mb-1 font-body">
                    Idea Title
                  </label>
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="w-full bg-[#FCFAF5] border border-[#DDD3BF] focus:border-[#4B7049] rounded-xl px-3.5 py-2 text-sm text-[#2D2522] focus:outline-none"
                    placeholder="Concise botanical title"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D40] uppercase tracking-wider mb-1 font-body">
                    Executive Summary
                  </label>
                  <textarea
                    rows={2}
                    value={draftDescription}
                    onChange={(e) => setDraftDescription(e.target.value)}
                    className="w-full bg-[#FCFAF5] border border-[#DDD3BF] focus:border-[#4B7049] rounded-xl px-3.5 py-2 text-sm text-[#2D2522] focus:outline-none"
                    placeholder="1-2 sentence essence of the thought"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5A4D40] uppercase tracking-wider mb-1 font-body">
                      Evolution Stage
                    </label>
                    <select
                      value={draftStage}
                      onChange={(e) => setDraftStage(e.target.value as any)}
                      className="w-full bg-[#FCFAF5] border border-[#DDD3BF] focus:border-[#4B7049] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2D2522] focus:outline-none"
                    >
                      <option value="seed">🌱 Seed (Initial raw intuition)</option>
                      <option value="refinement">🌿 Refinement (Developing architecture)</option>
                      <option value="new_direction">🌼 New Direction (Pivot or breakthrough)</option>
                      <option value="mature">🌳 Mature (Tested hypothesis)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A4D40] uppercase tracking-wider mb-1 font-body">
                      Specimen Tags
                    </label>
                    <input
                      type="text"
                      value={draftTags.join(', ')}
                      onChange={(e) =>
                        setDraftTags(
                          e.target.value
                            .split(',')
                            .map((t) => t.trim().toLowerCase().replace(/\s+/g, '-'))
                            .filter(Boolean)
                        )
                      }
                      className="w-full bg-[#FCFAF5] border border-[#DDD3BF] focus:border-[#4B7049] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#2D2522] focus:outline-none font-mono"
                      placeholder="e.g. machine-learning, ecology"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D40] uppercase tracking-wider mb-1 font-body">
                    Structured Synthesis (Markdown)
                  </label>
                  <textarea
                    rows={5}
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    className="w-full bg-[#FCFAF5] border border-[#DDD3BF] focus:border-[#4B7049] rounded-xl px-3 py-2 text-xs font-mono text-[#2D2522] focus:outline-none"
                  />
                </div>

                {saveStatus && (
                  <div className="flex items-center gap-2 text-xs text-[#2C522E] bg-[#EAF2E8] p-2.5 rounded-xl border border-[#C5DBC3]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="font-body">{saveStatus}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-[#E3DAC8] flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsSynthesizeOpen(false)}
                    disabled={saving}
                    className="px-4 py-2 text-[#7A6E60] hover:text-[#2D2522] text-xs sm:text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSaveIdea}
                    disabled={saving || !draftTitle.trim()}
                    className="px-5 py-2.5 bg-[#2A4C2E] hover:bg-[#203D24] text-[#FAF7F0] rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer border border-[#1E3A21]"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sprout className="w-4 h-4 text-[#F3D78A]" />
                    )}
                    <span>Save to Garden & Discover Vines</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
