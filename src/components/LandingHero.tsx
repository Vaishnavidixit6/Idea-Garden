import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import {
  BotanicalCornerVine,
  BotanicalBranchDivider,
  BotanicalSprout,
  PottedPlant,
  WateringCan,
  BotanicalFlower,
  HanddrawnWavyUnderline
} from './BotanicalArt';

interface LandingHeroProps {
  onSignIn: () => void;
  loading: boolean;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onSignIn, loading }) => {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between bg-[#F8F5EE] text-[#2D2522] relative overflow-hidden py-10 px-4 sm:px-6">
      {/* Botanical Book Cover Framing Outer Border */}
      <div className="max-w-4xl mx-auto w-full bg-[#FFFDF9] border-2 border-[#D8CEBC] rounded-3xl p-8 sm:p-14 relative shadow-[0_12px_40px_rgba(55,40,25,0.06)] paper-ruled sketch-border">
        {/* Decorative Corner Foliage */}
        <BotanicalCornerVine position="top-left" className="absolute top-2 left-2 w-20 h-20 opacity-40" />
        <BotanicalCornerVine position="top-right" className="absolute top-2 right-2 w-20 h-20 opacity-40" />
        <BotanicalCornerVine position="bottom-left" className="absolute bottom-2 left-2 w-20 h-20 opacity-40" />
        <BotanicalCornerVine position="bottom-right" className="absolute bottom-2 right-2 w-20 h-20 opacity-40" />

        {/* Centerpiece Book Cover Content */}
        <div className="text-center relative z-10 max-w-2xl mx-auto space-y-6">
          {/* Botanical Emblem */}
          <div className="w-16 h-16 rounded-full bg-[#EBF3EA] border border-[#BFD8BA] text-[#2C522E] flex items-center justify-center mx-auto shadow-2xs">
            <BotanicalSprout size={32} />
          </div>

          <div className="space-y-3">
            <span className="font-handwriting text-xl text-[#756858] tracking-wide block">
              Volume I &bull; A Private Creative Sanctuary
            </span>

            {/* Exact Requested Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#1E3621] font-normal tracking-tight leading-tight">
              A quiet garden for your ideas.
            </h1>

            {/* Exact Requested Subtitle */}
            <p className="font-serif italic text-lg sm:text-xl text-[#6B5E50] max-w-xl mx-auto leading-relaxed pt-1">
              Plant intuitions. Watch them branch. Discover the connections between what you think.
            </p>
          </div>

          <BotanicalBranchDivider className="opacity-80 my-4" />

          {/* Elegant Natural Google Sign-in Button */}
          <div className="pt-2 flex flex-col items-center gap-3">
            <button
              onClick={onSignIn}
              disabled={loading}
              className="px-8 py-3.5 rounded-full bg-[#2A4C2E] hover:bg-[#1E3922] text-[#FAF7F0] font-serif text-base font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 border border-[#1E3A21]"
            >
              <svg className="w-4 h-4 text-[#F3D78A]" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Opening garden gate...' : 'Enter Garden with Google'}</span>
              <ArrowRight className="w-4 h-4 text-[#F3D78A]" />
            </button>

            <span className="font-handwriting text-sm text-[#8A7E72] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4B7049]" />
              <span>Strict per-gardener privacy &bull; Owner-isolated Firestore soil</span>
            </span>
          </div>

          {/* Three Illustrated Botanical Vignettes */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left border-t border-[#EAE1CE] mt-8">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌱</span>
                <h3 className="font-serif font-bold text-sm text-[#1E3621]">
                  Greenhouse Dialogue
                </h3>
              </div>
              <p className="font-body text-xs text-[#6B5E50] leading-relaxed">
                Nurture fragile intuitions through reflective, multi-turn conversation with Gemini.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌿</span>
                <h3 className="font-serif font-bold text-sm text-[#1E3621]">
                  Living Tendrils
                </h3>
              </div>
              <p className="font-body text-xs text-[#6B5E50] leading-relaxed">
                Gemini automatically weaves relational bridges only among your own private thoughts.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌳</span>
                <h3 className="font-serif font-bold text-sm text-[#1E3621]">
                  Idea Evolution
                </h3>
              </div>
              <p className="font-body text-xs text-[#6B5E50] leading-relaxed">
                Trace how an initial seed sprouts into a refinement or branches into a new direction.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-[#8A7E72] font-handwriting text-base pt-6">
        Idea Garden &bull; Deployed on Google Cloud Run &bull; dev-tutorial=cloud-run-ai-challenge
      </div>
    </div>
  );
};
