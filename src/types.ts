export type EvolutionStage = 'seed' | 'refinement' | 'new_direction' | 'mature';

export type RelationshipType =
  | 'extends'
  | 'refines'
  | 'combines'
  | 'alternative_direction'
  | 'contradicts';

export interface IdeaConnection {
  connectedIdeaId: string;
  connectedIdeaTitle: string;
  relationshipType: RelationshipType;
  explanation: string;
}

export interface IdeaEvolution {
  hasEvolution: boolean;
  predecessorIdeaId?: string;
  stage: EvolutionStage;
  evolutionPath: string[];
  narrative: string;
}

export interface Idea {
  id: string;
  userId: string;
  title: string;
  description: string;
  content: string;
  topicTags: string[];
  keyConcepts: string[];
  evolutionStage: EvolutionStage;
  evolvedFromIdeaId?: string;
  connections: IdeaConnection[];
  evolution?: IdeaEvolution;
  originalConversationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}
