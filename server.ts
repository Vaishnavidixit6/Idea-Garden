import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import { initializeApp as initAdminApp, getApps as getAdminApps } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security & Body parsing
app.use(express.json({ limit: '2mb' }));

// Load Firebase configuration
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = {};
try {
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch (err) {
  console.warn('[Firebase Admin] Warning: could not load firebase-applet-config.json:', err);
}

// Initialize Firebase Admin singleton for server-side ID token verification
const adminApp = getAdminApps().length === 0
  ? initAdminApp({ projectId: firebaseConfig.projectId || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT })
  : getAdminApps()[0];

const adminAuth = getAdminAuth(adminApp);
let adminFirestore: FirebaseFirestore.Firestore | null = null;
try {
  adminFirestore = firebaseConfig.firestoreDatabaseId
    ? getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId)
    : getAdminFirestore(adminApp);
} catch (fsErr) {
  console.warn('[Firebase Admin] Admin Firestore initialization note:', fsErr);
}

export interface AuthenticatedRequest extends express.Request {
  user?: {
    uid: string;
    email?: string;
  };
  token?: string;
}

// Authentication middleware verifying Firebase ID token
async function requireAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Missing or malformed Authorization header. Expected Bearer <token>.'
    });
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();
  if (!idToken) {
    return res.status(401).json({
      error: 'Unauthorized: Missing ID token in Authorization header.'
    });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({
        error: 'Unauthorized: Invalid token payload.'
      });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    req.token = idToken;
    return next();
  } catch (err: any) {
    const errCode = err?.code || 'AUTH_TOKEN_INVALID';
    console.warn(`[Auth] ID token verification failed: ${errCode}`);
    return res.status(401).json({
      error: 'Unauthorized: Authentication token is invalid or expired. Please sign in again.'
    });
  }
}

// Firestore REST document field parser helper
function parseFirestoreRestValue(val: any): any {
  if (!val || typeof val !== 'object') return val;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) {
    return (val.arrayValue.values || []).map(parseFirestoreRestValue);
  }
  if ('mapValue' in val) {
    const res: any = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      res[k] = parseFirestoreRestValue(v);
    }
    return res;
  }
  return val;
}

// Securely retrieves ideas belonging strictly to the authenticated user UID from Firestore
async function fetchUserIdeasFromFirestore(userId: string, idToken: string): Promise<any[]> {
  // 1. Attempt Admin SDK read first if available
  try {
    if (adminFirestore) {
      const snap = await adminFirestore
        .collection('users')
        .doc(userId)
        .collection('ideas')
        .get();
      if (snap && !snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      if (snap && snap.empty) {
        return [];
      }
    }
  } catch (adminErr: any) {
    // In sandboxed dev environments without ADC Firestore IAM roles, fall back to authenticated REST API
    console.warn('[Firestore] Admin SDK read bypassed, querying user-authenticated REST API:', adminErr?.message || adminErr);
  }

  // 2. User-authenticated REST API fetch using the verified user ID token
  try {
    const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
    const projectId = firebaseConfig.projectId;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/users/${userId}/ideas`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      if (res.status === 404) return [];
      console.warn(`[Firestore REST] Failed to fetch ideas for user: HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!data.documents || !Array.isArray(data.documents)) {
      return [];
    }

    return data.documents.map((docItem: any) => {
      const fields = docItem.fields || {};
      const parsed: any = {
        id: docItem.name ? docItem.name.split('/').pop() : ''
      };
      for (const [key, val] of Object.entries(fields)) {
        parsed[key] = parseFirestoreRestValue(val);
      }
      return parsed;
    });
  } catch (restErr: any) {
    console.error('[Firestore REST] Error retrieving user ideas:', restErr?.message || restErr);
    return [];
  }
}

// Lazy Gemini client helper
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing. Please configure it in your environment settings.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Supported Flash models list in priority order
// gemini-2.5-flash is stable and supported for text & structured JSON schemas
const FLASH_MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash'
];

function isTemporaryOrDemandError(error: any): boolean {
  const status = error?.status || error?.statusCode;
  if (status === 503 || status === 429 || status === 504 || status === 500) {
    return true;
  }
  const msg = String(error?.message || '').toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('504') ||
    msg.includes('high demand') ||
    msg.includes('unavailable') ||
    msg.includes('resource exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('overloaded') ||
    msg.includes('temporary') ||
    msg.includes('spikes in demand')
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Resilient helper that retries on temporary 503/429 errors and falls back across supported Flash models
async function generateContentWithRetryAndFallback(params: {
  contents: any;
  config?: any;
  models?: string[];
}): Promise<{ text?: string | null }> {
  const ai = getGeminiClient();
  const candidateModels = params.models || FLASH_MODELS;
  let lastError: any = null;

  for (const model of candidateModels) {
    // Up to 2 attempts per model (attempt 1 + 1 retry on 503/429 with backoff)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config
        });
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini] Attempt ${attempt} on model "${model}" encountered error:`, err?.status || err?.message || err);

        if (isTemporaryOrDemandError(err)) {
          if (attempt === 1) {
            // Short backoff before retrying once on the same model
            await delay(600);
            continue;
          }
          // After retry fails with demand error, break out of inner loop to try next fallback model
          break;
        }

        // If it is not a temporary error (e.g. fatal bad request), don't retry same model
        break;
      }
    }
  }

  throw lastError;
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'idea-garden',
    timestamp: new Date().toISOString()
  });
});

// 2. Multi-turn Brainstorming Chat
app.post('/api/chat', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (messages.length > 50) {
      return res.status(400).json({ error: 'Conversation history exceeds maximum turn limit.' });
    }

    const ai = getGeminiClient();

    // Map conversation to Gemini contents format
    // System instruction separates developer security boundary from untrusted user messages
    const systemInstruction = `You are the Idea Garden AI Collaborator.
Your mission is to help the user cultivate, test, refine, and deepen their raw, incomplete, or messy ideas.
Guidelines:
1. Be thoughtful, constructive, and intellectually rigorous.
2. Ask probing questions to uncover unspoken assumptions or blind spots.
3. Help the user bridge concepts across disciplines or practical angles.
4. When uncertain, explicitly state that you are exploring hypotheses rather than stating authoritative facts.
5. If the user presents a developing idea, suggest concrete dimensions: core problem, target audience/mechanism, risks, and evolutionary directions.
6. When the user asks to save or finalize, synthesize their thoughts cleanly so they can save it to their Idea Garden.`;

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(m.content || '').slice(0, 10000) }]
    }));

    const response = await generateContentWithRetryAndFallback({
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || 'I could not generate a response. Please refine your query.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/chat:', error?.message || error);
    const isMissingKey = error?.message?.includes('GEMINI_API_KEY');
    const isDemandOrRateLimit = isTemporaryOrDemandError(error);
    return res.status(isMissingKey ? 503 : isDemandOrRateLimit ? 503 : 500).json({
      error: isMissingKey
        ? 'Gemini API key is not configured on the server. Please add GEMINI_API_KEY in the environment.'
        : isDemandOrRateLimit
        ? 'Gemini is currently experiencing high demand across models. Please try again in a few moments.'
        : 'Failed to generate response from Gemini. Please try again.'
    });
  }
});

// 3. Structured Idea Synthesis
app.post('/api/synthesize-idea', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { rawContent, conversationContext } = req.body;

    if (!rawContent && (!conversationContext || conversationContext.length === 0)) {
      return res.status(400).json({ error: 'Either rawContent or conversationContext is required.' });
    }

    const ai = getGeminiClient();

    let contextSnippet = '';
    if (Array.isArray(conversationContext) && conversationContext.length > 0) {
      contextSnippet = conversationContext
        .slice(-10)
        .map((m: any) => `${m.role.toUpperCase()}: ${String(m.content || '').slice(0, 1000)}`)
        .join('\n');
    }

    const prompt = `Analyze the following idea input and brainstorm context, and distill it into a structured, mature idea record.

Context from conversation:
"""
${contextSnippet}
"""

Raw Idea/Notes:
"""
${String(rawContent || '').slice(0, 8000)}
"""

Extract:
1. title: A crisp, evocative title (under 80 characters) capturing the core idea.
2. description: A clear 1-2 sentence executive summary (under 250 characters).
3. content: A structured breakdown in clean Markdown formatting, including sections:
   - ## The Core Hypothesis / Problem
   - ## Proposed Solution & Mechanism
   - ## Potential Impact & Practical Applications
   - ## Key Challenges or Next Experiments
4. topicTags: 3 to 6 normalized tags (lowercase, hyphenated if multi-word, e.g. "machine-learning", "healthcare-data").
5. keyConcepts: 3 to 6 key conceptual pillars or mental models involved.
6. evolutionStage: Choose one of ["seed", "refinement", "new_direction", "mature"].`;

    const response = await generateContentWithRetryAndFallback({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Crisp, evocative title' },
            description: { type: Type.STRING, description: 'Short 1-2 sentence summary' },
            content: { type: Type.STRING, description: 'Structured markdown synthesis' },
            topicTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 6 topic tags'
            },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 6 conceptual pillars'
            },
            evolutionStage: {
              type: Type.STRING,
              enum: ['seed', 'refinement', 'new_direction', 'mature'],
              description: 'Idea evolution stage'
            }
          },
          required: ['title', 'description', 'content', 'topicTags', 'keyConcepts', 'evolutionStage']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ idea: parsed });
  } catch (error: any) {
    console.error('Error in /api/synthesize-idea:', error?.message || error);
    const isDemandError = isTemporaryOrDemandError(error);
    return res.status(isDemandError ? 503 : 500).json({
      error: isDemandError
        ? 'Gemini is currently experiencing high demand across models. Please try again in a moment.'
        : 'Failed to synthesize idea metadata with Gemini.'
    });
  }
});

// 4. Original Feature: Idea Connections & Evolution
app.post('/api/discover-connections', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const authenticatedUid = req.user!.uid;
    const { currentIdea } = req.body;

    if (!currentIdea || !currentIdea.title) {
      return res.status(400).json({ error: 'currentIdea with title is required.' });
    }

    // Security Hardening: Fetch existing ideas directly from Firestore scoped strictly to authenticated UID
    const userIdeas = await fetchUserIdeasFromFirestore(authenticatedUid, req.token!);

    // Filter out the current idea if it is already present in Firestore
    const candidatePool = userIdeas.filter((i: any) => i.id !== currentIdea.id && i.title !== currentIdea.title);

    if (candidatePool.length === 0) {
      // No existing ideas in this user's garden to compare against
      return res.json({
        connections: [],
        evolution: {
          hasEvolution: false,
          stage: currentIdea.evolutionStage || 'seed',
          evolutionPath: [currentIdea.title],
          narrative: 'This is an initial standalone seed idea in your garden.'
        }
      });
    }

    const ai = getGeminiClient();

    // Bound the existing ideas checked to prevent prompt inflation
    const candidateIdeas = candidatePool
      .slice(0, 15)
      .map((i: any) => ({
        id: String(i.id),
        title: String(i.title || '').slice(0, 150),
        description: String(i.description || '').slice(0, 300),
        topicTags: Array.isArray(i.topicTags) ? i.topicTags.slice(0, 6) : [],
        keyConcepts: Array.isArray(i.keyConcepts) ? i.keyConcepts.slice(0, 6) : [],
        evolutionStage: i.evolutionStage || 'seed'
      }));

    const prompt = `You are the Idea Garden Relational Engine.
Analyze the NEW IDEA below and compare it against the user's PREVIOUSLY SAVED IDEAS.

CRITICAL INSTRUCTIONS:
- ONLY identify genuinely meaningful conceptual relationships.
- DO NOT claim two ideas are related merely because they contain similar words or generic tags.
- Relationships must reflect intellectual substance:
  * "extends": Expands the scope, capabilities, or domain of the earlier idea.
  * "refines": Sharpens, details, or resolves a specific ambiguity or mechanism of the earlier idea.
  * "combines": Synthesizes concepts from this idea and an earlier idea together.
  * "alternative_direction": Addresses the same underlying problem using a distinctly different paradigm or angle.
  * "contradicts": Challenges, pivots away from, or repudiates the premise of the earlier idea.
- If there is NO meaningful connection with a candidate idea, do not include it. Maximum 4 most meaningful connections.
- Detect if the new idea is an EVOLUTION of one of the earlier ideas. If so, identify the predecessor and lay out a clear 2 to 4-step intellectual progression path.

NEW IDEA:
Title: ${currentIdea.title}
Description: ${currentIdea.description}
Content Summary: ${String(currentIdea.content || '').slice(0, 2000)}
Tags: ${(currentIdea.topicTags || []).join(', ')}
Key Concepts: ${(currentIdea.keyConcepts || []).join(', ')}

PREVIOUSLY SAVED IDEAS OF THIS USER:
${JSON.stringify(candidateIdeas, null, 2)}
`;

    const response = await generateContentWithRetryAndFallback({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            connections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  connectedIdeaId: { type: Type.STRING },
                  relationshipType: {
                    type: Type.STRING,
                    enum: ['extends', 'refines', 'combines', 'alternative_direction', 'contradicts']
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Detailed explanation of why and how these two ideas relate conceptually'
                  }
                },
                required: ['connectedIdeaId', 'relationshipType', 'explanation']
              }
            },
            evolution: {
              type: Type.OBJECT,
              properties: {
                hasEvolution: { type: Type.BOOLEAN },
                predecessorIdeaId: { type: Type.STRING, description: 'ID of earlier idea if direct evolution' },
                stage: {
                  type: Type.STRING,
                  enum: ['seed', 'refinement', 'new_direction', 'mature']
                },
                evolutionPath: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2 to 4 step evolution progression sequence'
                },
                narrative: {
                  type: Type.STRING,
                  description: 'Explanation of how the idea developed intellectually over time'
                }
              },
              required: ['hasEvolution', 'stage', 'evolutionPath', 'narrative']
            }
          },
          required: ['connections', 'evolution']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');

    // Filter connections to only ensure valid ID references that exist in candidateIdeas
    const validCandidateIds = new Set(candidateIdeas.map((c) => c.id));
    const safeConnections = (parsed.connections || [])
      .filter((c: any) => validCandidateIds.has(c.connectedIdeaId))
      .map((c: any) => {
        const match = candidateIdeas.find((ci) => ci.id === c.connectedIdeaId);
        return {
          ...c,
          connectedIdeaTitle: match ? match.title : 'Connected Idea'
        };
      });

    let safeEvolution = parsed.evolution;
    if (safeEvolution?.predecessorIdeaId && !validCandidateIds.has(safeEvolution.predecessorIdeaId)) {
      safeEvolution.predecessorIdeaId = undefined;
    }

    return res.json({
      connections: safeConnections,
      evolution: safeEvolution
    });
  } catch (error: any) {
    console.error('Error in /api/discover-connections:', error?.message || error);
    const isDemandError = isTemporaryOrDemandError(error);
    return res.status(isDemandError ? 503 : 500).json({
      error: isDemandError
        ? 'Gemini is currently experiencing high demand across models. Please try again in a moment.'
        : 'Failed to discover idea connections with Gemini.'
    });
  }
});

// Vite middleware & Production Serving
async function setupApp() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Idea Garden server listening on http://0.0.0.0:${PORT}`);
  });
}

setupApp();
