import React from 'react';
import { Sparkles, Network, BookOpen, LogOut, LogIn } from 'lucide-react';
import { UserProfile } from '../types';
import { BotanicalSprout, BotanicalFlower } from './BotanicalArt';

interface NavbarProps {
  user: UserProfile | null;
  activeView: 'dashboard' | 'brainstorm' | 'graph';
  setActiveView: (view: 'dashboard' | 'brainstorm' | 'graph') => void;
  onSignIn: () => void;
  onSignOut: () => void;
  ideasCount: number;
  connectionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  setActiveView,
  onSignIn,
  onSignOut,
  ideasCount,
  connectionsCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF6EE]/95 backdrop-blur-md border-b border-[#E6DDCC] text-[#2D2522] shadow-[0_2px_12px_rgba(74,58,42,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#EBE3D3] border border-[#D5C9B3] p-1 shadow-sm flex items-center justify-center group-hover:bg-[#E3DAC8] transition-colors group-hover:rotate-3 transition-transform duration-300">
              <BotanicalSprout size={28} className="group-hover:scale-105 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl tracking-tight text-[#243E26]">
                  Idea Garden
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#E5ECE3] text-[#365839] border border-[#C6D8C4]">
                  Digital Greenhouse
                </span>
              </div>
              <p className="text-[11px] text-[#7A6F62] hidden sm:block font-body">
                Plant an idea &bull; Give it room to grow
              </p>
            </div>
          </button>
        </div>

        {/* Center Nav (Authenticated only) */}
        {user && (
          <nav className="hidden md:flex items-center gap-1.5 bg-[#EFE9DC]/90 p-1.5 rounded-2xl border border-[#DED4C0] shadow-inner">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-[#FCFAF6] text-[#243E26] shadow-sm border border-[#D8CCB8]'
                  : 'text-[#6E6457] hover:text-[#243E26] hover:bg-[#F7F3EA]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#4E704D]" />
              <span>My Garden</span>
              {ideasCount > 0 && (
                <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-[#E4ECDF] text-[#2F5332] font-mono font-medium">
                  {ideasCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('brainstorm')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeView === 'brainstorm'
                  ? 'bg-[#2E5434] text-[#FAF7F0] shadow-md shadow-[#2E5434]/20'
                  : 'text-[#6E6457] hover:text-[#243E26] hover:bg-[#F7F3EA]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F2D07A]" />
              <span>Brainstorm Plot</span>
            </button>

            <button
              onClick={() => setActiveView('graph')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeView === 'graph'
                  ? 'bg-[#FCFAF6] text-[#243E26] shadow-sm border border-[#D8CCB8]'
                  : 'text-[#6E6457] hover:text-[#243E26] hover:bg-[#F7F3EA]'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-[#B85C38]" />
              <span>Connections Web</span>
              {connectionsCount > 0 && (
                <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-[#FCEEE8] text-[#B85C38] font-mono font-medium">
                  {connectionsCount}
                </span>
              )}
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-semibold text-[#2D2522] flex items-center gap-1.5">
                  <span>{user.displayName || user.email.split('@')[0]}</span>
                  <BotanicalFlower size={14} className="opacity-80" />
                </span>
                <span className="text-[11px] text-[#7A6F62] line-clamp-1">{user.email}</span>
              </div>

              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-9 h-9 rounded-full border-2 border-[#D5C9B3] object-cover shadow-sm ring-2 ring-[#EBE2CF]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#3B5B39] text-[#FAF6EE] flex items-center justify-center font-bold text-xs border border-[#2D482B] shadow-sm">
                  {(user.displayName || user.email)[0].toUpperCase()}
                </div>
              )}

              <button
                onClick={onSignOut}
                title="Leave Garden (Sign Out)"
                className="p-2 text-[#7A6F62] hover:text-[#C84A3B] hover:bg-[#EFE9DD] rounded-xl transition-colors cursor-pointer"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 px-4 py-2 bg-[#2D4E30] hover:bg-[#254228] text-[#FAF6EE] rounded-xl text-xs font-semibold shadow-md shadow-[#2D4E30]/20 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#F3D78A]" />
              <span>Enter Idea Garden</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {user && (
        <div className="md:hidden flex items-center justify-around border-t border-[#E6DDCC] bg-[#F7F2E6]/95 py-2 px-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-lg ${
              activeView === 'dashboard' ? 'text-[#2D4E30] font-bold bg-[#EAE2D0]' : 'text-[#7A6F62]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>My Garden ({ideasCount})</span>
          </button>
          <button
            onClick={() => setActiveView('brainstorm')}
            className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-lg ${
              activeView === 'brainstorm' ? 'text-[#2D4E30] font-bold bg-[#EAE2D0]' : 'text-[#7A6F62]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Brainstorm</span>
          </button>
          <button
            onClick={() => setActiveView('graph')}
            className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-lg ${
              activeView === 'graph' ? 'text-[#2D4E30] font-bold bg-[#EAE2D0]' : 'text-[#7A6F62]'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Vines ({connectionsCount})</span>
          </button>
        </div>
      )}
    </header>
  );
};
