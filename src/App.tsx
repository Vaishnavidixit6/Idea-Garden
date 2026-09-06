/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GardenSidebar } from './components/GardenSidebar';
import { LandingHero } from './components/LandingHero';
import { Dashboard } from './components/Dashboard';
import { BrainstormChat } from './components/BrainstormChat';
import { ConnectionsGraphView } from './components/ConnectionsGraphView';
import { EvolutionView } from './components/EvolutionView';
import { IdeaDetailModal } from './components/IdeaDetailModal';
import { UserProfile, Idea } from './types';
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signOutUser,
  testFirestoreConnection
} from './lib/firebase';
import { fetchUserIdeas, deleteIdeaFromFirestore } from './services/firestoreService';
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'brainstorm' | 'connections' | 'evolution'>('dashboard');

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);

  const [selectedIdeaForModal, setSelectedIdeaForModal] = useState<Idea | null>(null);
  const [ideaContextForBrainstorm, setIdeaContextForBrainstorm] = useState<Idea | null>(null);
  const [plantedThought, setPlantedThought] = useState<string | null>(null);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Test Firestore connectivity on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'user@example.com',
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
      } else {
        setUser(null);
        setIdeas([]);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Load ideas when user logs in
  const loadIdeas = useCallback(async (userId: string) => {
    setLoadingIdeas(true);
    try {
      const userIdeas = await fetchUserIdeas(userId);
      setIdeas(userIdeas);
    } catch (err: any) {
      console.error('Failed to load user ideas:', err);
      showNotification('error', `Could not load ideas: ${err.message || 'Check connection'}`);
    } finally {
      setLoadingIdeas(false);
    }
  }, []);

  useEffect(() => {
    if (user?.uid) {
      loadIdeas(user.uid);
    }
  }, [user?.uid, loadIdeas]);

  const handleSignIn = async () => {
    try {
      setLoadingAuth(true);
      const loggedUser = await signInWithGoogle();
      showNotification('success', `Welcome back to your Idea Garden, ${loggedUser.email}`);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      showNotification(
        'error',
        err.message || 'Google Sign-In was cancelled or could not be completed.'
      );
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setIdeas([]);
      setActiveView('dashboard');
      showNotification('info', 'Garden gates locked safely. See you soon!');
    } catch (err: any) {
      showNotification('error', 'Failed to sign out.');
    }
  };

  const handleIdeaSaved = (newIdea: Idea) => {
    setIdeas((prev) => {
      const filtered = prev.filter((i) => i.id !== newIdea.id);
      return [newIdea, ...filtered];
    });
    showNotification(
      'success',
      `🌱 Planted "${newIdea.title}" into your Idea Garden.`
    );
  };

  const handleDeleteIdea = async (ideaId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) return;

    try {
      await deleteIdeaFromFirestore(user.uid, ideaId);
      setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
      if (selectedIdeaForModal?.id === ideaId) {
        setSelectedIdeaForModal(null);
      }
      showNotification('info', 'Plant removed from your garden bed.');
    } catch (err: any) {
      showNotification('error', `Failed to remove plant: ${err.message}`);
    }
  };

  const handleBrainstormFromIdea = (idea: Idea, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIdeaContextForBrainstorm(idea);
    setPlantedThought(null);
    setSelectedIdeaForModal(null);
    setActiveView('brainstorm');
  };

  const handleSelectConnectedIdea = (connectedIdeaId: string) => {
    const target = ideas.find((i) => i.id === connectedIdeaId);
    if (target) {
      setSelectedIdeaForModal(target);
    }
  };

  const totalConnectionsCount = ideas.reduce(
    (acc, i) => acc + (i.connections?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#2D2522] flex flex-col font-body selection:bg-[#D4E5D1] selection:text-[#1E3621]">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-sm max-w-md ${
              notification.type === 'success'
                ? 'bg-[#FFFDF9] border-[#BED6BB] text-[#224A25]'
                : notification.type === 'error'
                ? 'bg-[#FFF8F7] border-[#F2C5BD] text-[#9E3628]'
                : 'bg-[#FFFDF9] border-[#DDD3BF] text-[#44382D]'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#2E5431] shrink-0" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#C84A3B] shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#C26749] shrink-0" />
            )}
            <span className="leading-snug font-medium font-body">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-xs opacity-60 hover:opacity-100 font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main App Container */}
      {loadingAuth ? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-[#6A5D4F]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2E5431]" />
          <span className="text-sm font-serif font-semibold text-[#1E3621]">
            Opening your Idea Garden sanctuary...
          </span>
        </div>
      ) : !user ? (
        <LandingHero onSignIn={handleSignIn} loading={loadingAuth} />
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row min-h-screen">
          {/* Garden Journal Navigation Sidebar */}
          <GardenSidebar
            user={user}
            activeView={activeView}
            setActiveView={setActiveView}
            ideasCount={ideas.length}
            connectionsCount={totalConnectionsCount}
            onSignOut={handleSignOut}
          />

          {/* Main Stage View Area */}
          <main className="flex-1 min-w-0 overflow-y-auto">
            {activeView === 'dashboard' && (
              <Dashboard
                user={user}
                ideas={ideas}
                onSelectIdea={(idea) => setSelectedIdeaForModal(idea)}
                onDeleteIdea={handleDeleteIdea}
                onBrainstormFromIdea={handleBrainstormFromIdea}
                onStartBrainstorm={(initialThought) => {
                  setIdeaContextForBrainstorm(null);
                  setPlantedThought(initialThought || null);
                  setActiveView('brainstorm');
                }}
              />
            )}

            {activeView === 'brainstorm' && (
              <BrainstormChat
                user={user}
                existingIdeas={ideas}
                initialIdeaContext={ideaContextForBrainstorm}
                initialPlantedThought={plantedThought}
                onIdeaSaved={handleIdeaSaved}
                onViewIdeaDetail={(idea) => setSelectedIdeaForModal(idea)}
              />
            )}

            {activeView === 'connections' && (
              <ConnectionsGraphView
                ideas={ideas}
                onSelectIdea={(idea) => setSelectedIdeaForModal(idea)}
                onStartBrainstorm={() => {
                  setIdeaContextForBrainstorm(null);
                  setPlantedThought(null);
                  setActiveView('brainstorm');
                }}
              />
            )}

            {activeView === 'evolution' && (
              <EvolutionView
                ideas={ideas}
                onSelectIdea={(idea) => setSelectedIdeaForModal(idea)}
                onStartBrainstorm={() => {
                  setIdeaContextForBrainstorm(null);
                  setPlantedThought(null);
                  setActiveView('brainstorm');
                }}
                onBrainstormFromIdea={handleBrainstormFromIdea}
              />
            )}
          </main>
        </div>
      )}

      {/* Idea Detail Modal */}
      {selectedIdeaForModal && user && (
        <IdeaDetailModal
          idea={selectedIdeaForModal}
          allIdeas={ideas}
          onClose={() => setSelectedIdeaForModal(null)}
          onSelectConnectedIdea={handleSelectConnectedIdea}
          onBrainstormFromIdea={(idea) => handleBrainstormFromIdea(idea)}
          onIdeaUpdated={(updated) => {
            setIdeas((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
            setSelectedIdeaForModal(updated);
          }}
          onDeleteIdea={(id) => handleDeleteIdea(id)}
        />
      )}
    </div>
  );
}
