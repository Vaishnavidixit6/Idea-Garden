import React, { useState } from 'react';
import { UserProfile } from '../types';
import { BotanicalSprout, BotanicalLeafFlourish, WateringCan } from './BotanicalArt';
import { LogOut, Menu, X, Sparkles, Sprout, Network, GitBranch, BookOpen, Compass } from 'lucide-react';

interface GardenSidebarProps {
  user: UserProfile | null;
  activeView: 'dashboard' | 'brainstorm' | 'connections' | 'evolution';
  setActiveView: (view: 'dashboard' | 'brainstorm' | 'connections' | 'evolution') => void;
  ideasCount: number;
  connectionsCount: number;
  onSignOut: () => void;
}

export const GardenSidebar: React.FC<GardenSidebarProps> = ({
  user,
  activeView,
  setActiveView,
  ideasCount,
  connectionsCount,
  onSignOut
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const gardenPaths = [
    {
      id: 'brainstorm' as const,
      label: 'Plant an Idea',
      sublabel: 'The open greenhouse notebook',
      icon: '🌱',
      color: 'text-[#2E5431]'
    },
    {
      id: 'dashboard' as const,
      label: 'My Garden',
      sublabel: `${ideasCount} planted thoughts`,
      icon: '🌿',
      color: 'text-[#2C522E]'
    },
    {
      id: 'connections' as const,
      label: 'Connections',
      sublabel: `${connectionsCount} living tendrils`,
      icon: '🪻',
      color: 'text-[#5A3875]'
    },
    {
      id: 'evolution' as const,
      label: 'Evolution',
      sublabel: 'Growth paths & lineages',
      icon: '🌳',
      color: 'text-[#8C581E]'
    }
  ];

  return (
    <>
      {/* Mobile Garden Header Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#FAF6EE]/95 backdrop-blur-xs border-b border-[#E3DAC8] px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E8EFE5] border border-[#BED6BA] flex items-center justify-center text-sm shadow-2xs">
            🌱
          </div>
          <div>
            <h1 className="font-serif font-bold text-base text-[#1E3621] leading-none tracking-tight">
              Idea Garden
            </h1>
            <p className="font-handwriting text-xs text-[#7A6E5F] leading-none mt-0.5">
              where thoughts take root
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveView('brainstorm');
              setMobileDrawerOpen(false);
            }}
            className="px-3 py-1.5 rounded-full bg-[#2A4C2E] text-[#FAF7F0] text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <span>🌱</span>
            <span>Plant</span>
          </button>
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2 rounded-xl text-[#5A4D40] hover:bg-[#EFE7D8] border border-[#DDD3BF] cursor-pointer"
            aria-label="Open garden navigation"
          >
            {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-[#1E3621]/40 backdrop-blur-2xs z-40"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Garden Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-[#FBF8F2] border-r border-[#E0D7C4] z-50 p-5 flex flex-col justify-between transition-transform duration-300 shadow-xl paper-ruled ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E3DAC8]">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <div>
                <h2 className="font-serif font-bold text-lg text-[#1E3621]">Idea Garden</h2>
                <span className="font-handwriting text-xs text-[#6B5E50] block">
                  "Where thoughts take root."
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="p-1 rounded-lg text-[#7A6E5F] hover:bg-[#EFE8D9]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Paths */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A6E5F] px-2 block">
              Garden Paths
            </span>
            {gardenPaths.map((path) => {
              const isActive = activeView === path.id;
              return (
                <button
                  key={path.id}
                  onClick={() => {
                    setActiveView(path.id);
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                    isActive
                      ? 'bg-[#EBF3E9] border-[#4B7049] text-[#1E3621] font-semibold shadow-xs'
                      : 'bg-[#FFFDF9] border-[#E8E0CE] text-[#4A3E31] hover:border-[#8CA988]'
                  }`}
                >
                  <span className="text-xl">{path.icon}</span>
                  <div>
                    <div className="text-sm font-serif">{path.label}</div>
                    <div className="text-[11px] font-body text-[#7A6E5F]">{path.sublabel}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="pt-4 border-t border-[#E3DAC8] space-y-3">
            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#FFFDF9] border border-[#DDD3BF]">
              <div className="w-8 h-8 rounded-full bg-[#E5EFE4] text-[#2E5431] flex items-center justify-center font-serif font-bold text-xs border border-[#C5DBC3]">
                {user.displayName ? user.displayName[0].toUpperCase() : 'G'}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="text-xs font-serif font-bold text-[#1E3621] truncate">
                  {user.displayName || 'Gardener'}
                </div>
                <div className="text-[10px] text-[#7A6E5F] truncate">{user.email}</div>
              </div>
              <button
                onClick={onSignOut}
                title="Leave Garden"
                className="p-1.5 text-[#8C7A68] hover:text-[#B84030] rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Garden Journal Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 bg-[#FCFAF5] border-r border-[#E3DAC8] flex-col justify-between p-6 shadow-xs sticky top-0 h-screen overflow-y-auto paper-ruled select-none">
        <div className="space-y-7">
          {/* Top Journal Header */}
          <div className="space-y-1.5 pb-5 border-b border-[#E3DAC8]">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl animate-gentle-sway">🌱</span>
              <h2 className="font-serif font-bold text-xl text-[#1E3621] tracking-tight">
                IDEA GARDEN
              </h2>
            </div>
            <p className="font-handwriting text-base text-[#6B5E50] pl-8">
              "Where thoughts take root."
            </p>
          </div>

          {/* Garden Paths (Navigation) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 text-[11px] font-mono uppercase tracking-wider text-[#7A6E5F] mb-1">
              <span>Garden Paths</span>
              <BotanicalLeafFlourish className="scale-75 opacity-70" />
            </div>

            {gardenPaths.map((path) => {
              const isActive = activeView === path.id;
              return (
                <button
                  key={path.id}
                  onClick={() => setActiveView(path.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer group ${
                    isActive
                      ? 'bg-[#EBF3E9] border-[#4B7049] ring-2 ring-[#4B7049]/20 shadow-xs'
                      : 'bg-[#FFFDF9] border-[#E8DFCE] hover:border-[#8CA988] hover:bg-[#FFFEFC]'
                  }`}
                >
                  <span className={`text-xl transition-transform group-hover:scale-110 ${path.color}`}>
                    {path.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-serif ${
                        isActive ? 'text-[#1E3621] font-bold' : 'text-[#3E342B]'
                      }`}
                    >
                      {path.label}
                    </div>
                    <div className="text-[11px] font-body text-[#7A6E5F] truncate">
                      {path.sublabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Illustrated Garden Ledger Note */}
          <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E0D7C4] relative overflow-hidden shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#1E3621] mb-2">
              <span>📖</span>
              <span>Garden Ledger</span>
            </div>
            <div className="space-y-1.5 text-xs text-[#5D5042] font-body">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#5C8C59]" />
                  <span>Planted Seeds:</span>
                </span>
                <span className="font-mono font-semibold text-[#1E3621]">{ideasCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#5A3875]" />
                  <span>Living Tendrils:</span>
                </span>
                <span className="font-mono font-semibold text-[#1E3621]">{connectionsCount}</span>
              </div>
            </div>
            <p className="font-handwriting text-xs text-[#8A7D6F] mt-2.5 pt-2 border-t border-[#E8DFCE]">
              Cultivated in private Firestore soil.
            </p>
          </div>
        </div>

        {/* Bottom Gardener Profile Card */}
        {user && (
          <div className="pt-4 border-t border-[#E3DAC8]">
            <div className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#DDD3BF] shadow-2xs flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Gardener'}
                    className="w-9 h-9 rounded-full border border-[#C6D8C4] object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#E5EFE4] text-[#2E5431] flex items-center justify-center font-serif font-bold text-sm border border-[#C5DBC3] shrink-0">
                    {user.displayName ? user.displayName[0].toUpperCase() : 'G'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-serif font-bold text-[#1E3621] truncate">
                    {user.displayName || 'Head Gardener'}
                  </div>
                  <div className="text-[10px] text-[#7A6E5F] truncate font-body">
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={onSignOut}
                title="Leave the Garden (Sign Out)"
                className="p-2 text-[#8C7B6A] hover:text-[#B84030] hover:bg-[#FDF2F0] rounded-xl transition-all cursor-pointer shrink-0"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
