import { ChatMessage, Idea, IdeaConnection, IdeaEvolution } from '../types';
import { getAuthToken } from '../lib/firebase';

export interface SynthesizeResponse {
  title: string;
  description: string;
  content: string;
  topicTags: string[];
  keyConcepts: string[];
  evolutionStage: 'seed' | 'refinement' | 'new_direction' | 'mature';
}

export interface ConnectionsResponse {
  connections: IdeaConnection[];
  evolution: IdeaEvolution;
}

/**
 * Sends a multi-turn conversation to the server-side Gemini endpoint with Firebase auth
 */
export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const token = await getAuthToken();
  const payload = {
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content
    }))
  };

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.reply;
}

/**
 * Calls Gemini server endpoint to distill structured idea metadata with Firebase auth
 */
export async function synthesizeIdea(
  rawContent: string,
  conversationContext?: ChatMessage[]
): Promise<SynthesizeResponse> {
  const token = await getAuthToken();
  const response = await fetch('/api/synthesize-idea', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      rawContent,
      conversationContext: conversationContext ? conversationContext.map((c) => ({
        role: c.role,
        content: c.content
      })) : []
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to synthesize idea with Gemini.');
  }

  const data = await response.json();
  return data.idea;
}

/**
 * Calls Gemini server endpoint to discover conceptual connections and evolution.
 * Server verifies authentication and retrieves the authenticated user's ideas directly from Firestore.
 */
export async function discoverConnections(
  currentIdea: {
    title: string;
    description: string;
    content: string;
    topicTags: string[];
    keyConcepts: string[];
    evolutionStage: string;
  },
  existingIdeas?: Idea[]
): Promise<ConnectionsResponse> {
  const token = await getAuthToken();
  const response = await fetch('/api/discover-connections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      currentIdea,
      // Optional client hint; server strictly retrieves verified Firestore ideas
      existingIdeas: (existingIdeas || []).map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        topicTags: i.topicTags,
        keyConcepts: i.keyConcepts,
        evolutionStage: i.evolutionStage
      }))
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to analyze connections with Gemini.');
  }

  return await response.json();
}
