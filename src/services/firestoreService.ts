import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Idea, Conversation } from '../types';

/**
 * Saves or updates an idea in the user's isolated subcollection:
 * users/{userId}/ideas/{ideaId}
 */
export async function saveIdeaToFirestore(userId: string, idea: Idea): Promise<void> {
  if (!userId) throw new Error('Authentication required to save idea.');
  if (!idea.id) throw new Error('Idea must have a valid ID.');

  const ideaRef = doc(db, 'users', userId, 'ideas', idea.id);

  const cleanData: any = {
    id: idea.id,
    userId,
    title: idea.title.slice(0, 300),
    description: (idea.description || '').slice(0, 1000),
    content: (idea.content || '').slice(0, 30000),
    topicTags: Array.isArray(idea.topicTags) ? idea.topicTags.slice(0, 10) : [],
    keyConcepts: Array.isArray(idea.keyConcepts) ? idea.keyConcepts.slice(0, 10) : [],
    evolutionStage: idea.evolutionStage || 'seed',
    connections: Array.isArray(idea.connections) ? idea.connections.slice(0, 10) : [],
    createdAt: idea.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _updatedAtServer: serverTimestamp()
  };

  if (idea.evolvedFromIdeaId) {
    cleanData.evolvedFromIdeaId = idea.evolvedFromIdeaId;
  }
  if (idea.evolution) {
    cleanData.evolution = idea.evolution;
  }
  if (idea.originalConversationId) {
    cleanData.originalConversationId = idea.originalConversationId;
  }

  await setDoc(ideaRef, cleanData, { merge: true });
}

/**
 * Fetches all ideas belonging strictly to the authenticated user.
 */
export async function fetchUserIdeas(userId: string): Promise<Idea[]> {
  if (!userId) throw new Error('Authentication required to fetch ideas.');

  const ideasRef = collection(db, 'users', userId, 'ideas');
  const q = query(ideasRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  const ideas: Idea[] = [];
  snapshot.forEach((d) => {
    const data = d.data();
    ideas.push({
      id: data.id || d.id,
      userId: data.userId || userId,
      title: data.title || 'Untitled Idea',
      description: data.description || '',
      content: data.content || '',
      topicTags: Array.isArray(data.topicTags) ? data.topicTags : [],
      keyConcepts: Array.isArray(data.keyConcepts) ? data.keyConcepts : [],
      evolutionStage: data.evolutionStage || 'seed',
      evolvedFromIdeaId: data.evolvedFromIdeaId,
      connections: Array.isArray(data.connections) ? data.connections : [],
      evolution: data.evolution,
      originalConversationId: data.originalConversationId,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    });
  });

  return ideas;
}

/**
 * Deletes an idea document belonging to the authenticated user.
 */
export async function deleteIdeaFromFirestore(userId: string, ideaId: string): Promise<void> {
  if (!userId || !ideaId) throw new Error('User ID and Idea ID are required.');
  const ideaRef = doc(db, 'users', userId, 'ideas', ideaId);
  await deleteDoc(ideaRef);
}

/**
 * Updates an idea in Firestore.
 */
export async function updateIdeaInFirestore(
  userId: string,
  ideaId: string,
  updates: Partial<Idea>
): Promise<void> {
  if (!userId || !ideaId) throw new Error('User ID and Idea ID are required.');
  const ideaRef = doc(db, 'users', userId, 'ideas', ideaId);

  const cleanUpdates: any = {
    ...updates,
    updatedAt: new Date().toISOString(),
    _updatedAtServer: serverTimestamp()
  };
  delete cleanUpdates.id;
  delete cleanUpdates.userId;

  await updateDoc(ideaRef, cleanUpdates);
}

/**
 * Saves a multi-turn conversation in users/{userId}/conversations/{conversationId}
 */
export async function saveConversationToFirestore(
  userId: string,
  conversation: Conversation
): Promise<void> {
  if (!userId) throw new Error('Authentication required.');
  const convoRef = doc(db, 'users', userId, 'conversations', conversation.id);

  const cleanData = {
    id: conversation.id,
    userId,
    title: (conversation.title || 'New Exploration').slice(0, 200),
    messages: conversation.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: (m.content || '').slice(0, 10000),
      timestamp: m.timestamp || new Date().toISOString()
    })),
    createdAt: conversation.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _updatedAtServer: serverTimestamp()
  };

  await setDoc(convoRef, cleanData, { merge: true });
}

/**
 * Fetches user conversations
 */
export async function fetchUserConversations(userId: string): Promise<Conversation[]> {
  if (!userId) return [];
  const convosRef = collection(db, 'users', userId, 'conversations');
  const q = query(convosRef, orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);

  const list: Conversation[] = [];
  snapshot.forEach((d) => {
    const data = d.data();
    list.push({
      id: data.id || d.id,
      userId: data.userId || userId,
      title: data.title || 'Exploration Session',
      messages: Array.isArray(data.messages) ? data.messages : [],
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    });
  });

  return list;
}
