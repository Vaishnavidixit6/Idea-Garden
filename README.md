# Idea Garden 🌱

Idea Garden is a secure, authenticated AI workspace where users can capture, develop, organize, connect, and evolve their ideas with Gemini.

---

## Why Idea Garden is Different

Instead of being primarily a passive personal journal or an ephemeral chat tool, **Idea Garden** focuses on active idea development, discovering meaningful conceptual connections across a user's own knowledge base, and mapping how ideas evolve over time:

* **From Journaling to Cultivation**: Raw, messy thoughts are nurtured through structured multi-turn dialogue with Gemini and synthesized into structured conceptual units.
* **Autonomous Idea Connections**: Rather than isolated journal entries, Gemini analyzes newly planted thoughts against the user's existing ideas to identify relational bridges (*Extends*, *Refines*, *Combines*, *Alternative Direction*, *Contradicts*).
* **Idea Evolution Trajectories**: Tracks intellectual lineage across developmental phases (*Seed → Refinement → New Direction → Mature*), creating living branches of creative growth.

---

## Core Features

* **Google Sign-In with Firebase Authentication**: Secure, client-side OAuth flow using Google Identity Services; user identity is tied to an authoritative Firebase UID.
* **Multi-turn Gemini Brainstorming**: Interactive, creative field notebook providing contextual questions, challenging assumptions, and surfacing blind spots.
* **Saving Ideas to Firestore**: Durable persistence of ideas and conversations into owner-isolated Cloud Firestore subcollections.
* **AI-Generated Idea Synthesis & Metadata**: Automated extraction of evocative titles, executive summaries, topic tags, key conceptual pillars, and structured markdown synthesis.
* **AI-Powered Idea Connections**: Server-side discovery comparing a new idea against previously planted ideas belonging strictly to the authenticated user.
* **Idea Evolution Mapping**: Visual and relational tracking of how ideas develop, branch, and mature over time.
* **User-Isolated Data**: End-to-end multi-tenant isolation ensuring no user can read, query, update, or analyze another user's private ideas.
* **Secure Server-Side Gemini Access**: All Gemini API calls are executed strictly within the backend service; API keys are never exposed to the client browser.

---

## Technology Stack

* **Google AI Studio**: Prompt engineering, prototyping, and developer tooling.
* **Gemini API (`@google/genai`)**: Server-side language model engine powering multi-turn brainstorming, metadata synthesis, and relational discovery.
* **Firebase Authentication**: User identity management with Google Sign-In.
* **Cloud Firestore**: Scalable NoSQL database with granular attribute-based access control.
* **Firebase Admin SDK (`firebase-admin`)**: Server-side verification of Firebase ID tokens and secure data queries.
* **Google Cloud Secret Manager**: Production-grade secret storage for API keys.
* **Google Cloud Run**: Fully managed serverless container runtime hosting the full-stack service.
* **React 19**: Modern component-based user interface.
* **TypeScript**: Strict type safety across frontend and backend.
* **Express**: Server-side API routing and middleware.
* **Vite**: Client application bundling and development server integration.

---

## Architecture

```
+-----------------------------------------------------------------------+
|                            Browser Client                             |
|  - React 19 + TypeScript + Tailwind CSS                               |
|  - Firebase Authentication (Google Sign-In popup)                     |
|  - Cloud Firestore Client SDK (owner-bound real-time access)          |
+-----------------------------------+-----------------------------------+
                                    |
                    +---------------+---------------+
                    |                               |
          Authenticated HTTPS API              Direct Firestore Queries
         (Bearer <Firebase_ID_Token>)        (Protected by Security Rules)
                    |                               |
                    v                               v
+---------------------------------------+   +---------------------------+
|          Cloud Run Backend            |   |      Cloud Firestore      |
|  - Express HTTP Server (Node.js)      |   |  users/{userId}/ideas/    |
|  - Firebase Admin ID-Token Verify     |   |  users/{userId}/convs/    |
|  - Authenticated UID extraction       |   +---------------------------+
|  - Server-side idea retrieval         |                 ^
|  - Google Cloud Secret Manager        |                 |
+-------------------+-------------------+                 |
                    |                                     |
                    | Direct server query for             |
                    | user's authenticated ideas          |
                    +-------------------------------------+
                    |
                    v
+---------------------------------------+
|              Gemini API               |
|  - Multi-turn conversation            |
|  - Structured JSON metadata synthesis |
|  - Idea relational connection engine  |
+---------------------------------------+
```

### Architectural Principles

1. **Token-Verified API Gateway**: Every protected backend endpoint (`/api/chat`, `/api/synthesize-idea`, `/api/discover-connections`) intercepts incoming HTTP requests and validates the `Authorization: Bearer <ID_TOKEN>` header using the Firebase Admin SDK.
2. **Authoritative Identity Derivation**: The backend derives the user's `uid` strictly from the decoded, cryptographically validated Firebase ID token (`decodedToken.uid`). Client-supplied user IDs in request bodies or query parameters are never trusted.
3. **Server-Side Idea Retrieval for Connections**: When `/api/discover-connections` executes, the backend directly queries Firestore for `users/{authenticatedUid}/ideas` using the Firebase Admin SDK. Gemini only evaluates ideas verified to belong to the authenticated caller. The browser cannot inject arbitrary external ideas to compare against.

---

## Firestore Data Model

The application isolates all user data under a top-level `users` collection:

### 1. User Document
`users/{userId}`
* Contains the user profile information and serves as the parent path for private subcollections.

### 2. Ideas Subcollection
`users/{userId}/ideas/{ideaId}`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique document identifier |
| `userId` | `string` | Owner UID matching parent `{userId}` |
| `title` | `string` | Crisp, descriptive title (1–300 chars) |
| `description` | `string` | 1–2 sentence executive summary |
| `content` | `string` | Full structured markdown content (up to 30,000 chars) |
| `topicTags` | `string[]` | Array of topic categorization tags |
| `keyConcepts` | `string[]` | 3–6 conceptual pillars |
| `evolutionStage` | `string` | `'seed'` \| `'refinement'` \| `'new_direction'` \| `'mature'` |
| `evolvedFromIdeaId`| `string?` | Optional reference to a predecessor idea |
| `connections` | `object[]` | Array of discovered idea connections (each containing `connectedIdeaId`, `connectedIdeaTitle`, `relationshipType`, `explanation`) |
| `evolution` | `object?` | Optional evolution metadata (`stage`, `evolutionPath`, `narrative`, `predecessorIdeaId`) |
| `originalConversationId` | `string?` | Optional reference to the originating brainstorm conversation |
| `createdAt` | `string` | ISO timestamp of creation |
| `updatedAt` | `string` | ISO timestamp of last update |

### 3. Conversations Subcollection
`users/{userId}/conversations/{conversationId}`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique conversation identifier |
| `userId` | `string` | Owner UID matching parent `{userId}` |
| `title` | `string` | Conversation subject or prompt title |
| `messages` | `object[]` | Array of chat turns (`id`, `role: 'user' \| 'assistant'`, `content`, `timestamp`) |
| `createdAt` | `string` | ISO timestamp of creation |
| `updatedAt` | `string` | ISO timestamp of last update |

---

## Security

* **Firebase Authentication**: Google Sign-In handles token lifecycle and cryptographic signing.
* **Backend ID-Token Verification**: All server API routes enforce mandatory Firebase ID token verification through `firebase-admin/auth`. Unauthenticated or invalid requests receive an immediate HTTP 401.
* **Owner-Bound Security Rules**: Cloud Firestore security rules strictly require `request.auth != null && request.auth.uid == userId` for all document reads and writes.
* **No Unrestricted Firestore Access**: All test and open endpoints have been eliminated. There are no wildcards or open read/write permissions anywhere in the rules.
* **Server-Side Gemini API Key**: The Gemini API key is stored strictly on the server and accessed via `process.env.GEMINI_API_KEY`. It is never bundled into client-side JavaScript or sent over the wire to browsers.
* **Google Cloud Secret Manager**: In production Cloud Run environments, the Gemini API key is mounted directly from Secret Manager into container environment variables.
* **No Credentials in Source Control**: Credentials, private keys, service account JSON files, and `.env` files are excluded via `.gitignore`.
* **Complete User Isolation**: A user cannot read, query, modify, delete, or analyze any document belonging to another user.

---

## Cloud Firestore Security Rules

The production `firestore.rules` file enforces strict owner-bound isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isValidId(id) {
      return id is string && id.size() > 0 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$');
    }

    // User profile document and subcollections: strictly isolated per authenticated owner
    match /users/{userId} {
      allow read, write: if isOwner(userId) && isValidId(userId);

      // Ideas subcollection: completely isolated per user
      match /ideas/{ideaId} {
        allow get, list: if isOwner(userId);
        allow create: if isOwner(userId)
                      && isValidId(ideaId)
                      && request.resource.data.userId == request.auth.uid
                      && request.resource.data.title is string
                      && request.resource.data.title.size() > 0
                      && request.resource.data.title.size() <= 300
                      && request.resource.data.content is string
                      && request.resource.data.content.size() <= 30000;
        allow update: if isOwner(userId)
                      && request.resource.data.userId == request.auth.uid
                      && request.resource.data.title is string
                      && request.resource.data.title.size() <= 300
                      && request.resource.data.content is string
                      && request.resource.data.content.size() <= 30000;
        allow delete: if isOwner(userId);
      }

      // Conversations subcollection: completely isolated per user
      match /conversations/{conversationId} {
        allow get, list: if isOwner(userId);
        allow create: if isOwner(userId)
                      && isValidId(conversationId)
                      && request.resource.data.userId == request.auth.uid
                      && request.resource.data.messages is list;
        allow update: if isOwner(userId)
                      && request.resource.data.userId == request.auth.uid
                      && request.resource.data.messages is list;
        allow delete: if isOwner(userId);
      }
    }
  }
}
```

---

## Firebase Setup

To configure Firebase for Idea Garden:

1. **Create a Firebase Project**: Open the Firebase Console and create a new project (or link an existing Google Cloud project).
2. **Enable Firebase Authentication**:
   * Navigate to **Build > Authentication > Sign-in method**.
   * Enable **Google** as a sign-in provider.
   * Add your application's domain (or localhost for local development) to the **Authorized domains** list.
3. **Enable Cloud Firestore**:
   * Navigate to **Build > Firestore Database**.
   * Create a Firestore database in production mode.
   * Deploy the security rules provided in `firestore.rules`.
4. **Register Web App**:
   * Register a Web App in Project Settings.
   * Populate `firebase-applet-config.json` with the project configuration values (or supply the corresponding client config).

---

## Environment Variables

For local development and container execution, define the following variables in `.env` (refer to `.env.example`):

```env
# GEMINI_API_KEY: Required for server-side Gemini API calls
GEMINI_API_KEY=your_gemini_api_key_here

# APP_URL: The base URL where the application is hosted
APP_URL=https://your-app-url.example

# PORT: Server listening port (default: 3000)
PORT=3000
```

> **Important**: Never commit actual API keys, secrets, or credential values to source control.

---

## Local Development Instructions

### Prerequisites
* Node.js v20+ and npm
* A Google Cloud Project with the Gemini API enabled
* A Firebase Project with Google Authentication and Cloud Firestore configured

### Step-by-Step Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_ORGANIZATION/idea-garden.git
   cd idea-garden
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your `GEMINI_API_KEY`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   APP_URL=http://localhost:3000
   PORT=3000
   ```

4. **Verify Firebase client configuration**:
   Ensure `firebase-applet-config.json` contains your Firebase project settings:
   ```json
   {
     "projectId": "YOUR_PROJECT_ID",
     "appId": "YOUR_APP_ID",
     "apiKey": "YOUR_FIREBASE_WEB_API_KEY",
     "authDomain": "YOUR_PROJECT_ID.firebaseapp.com",
     "firestoreDatabaseId": "(default)",
     "storageBucket": "YOUR_PROJECT_ID.firebasestorage.app",
     "messagingSenderId": "YOUR_SENDER_ID"
   }
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

6. **Verify production build**:
   ```bash
   npm run build
   npm start
   ```

---

## Google Cloud Run Deployment

### 1. Store Gemini API Key in Secret Manager

```bash
# Create the secret
gcloud secrets create YOUR_SECRET_NAME \
    --replication-policy="automatic" \
    --project="YOUR_PROJECT_ID"

# Add the secret payload (using your actual key)
echo -n "YOUR_ACTUAL_GEMINI_API_KEY" | gcloud secrets versions add YOUR_SECRET_NAME \
    --data-file=- \
    --project="YOUR_PROJECT_ID"
```

Grant the Cloud Run runtime service account permission to access the secret:

```bash
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding YOUR_SECRET_NAME \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project="YOUR_PROJECT_ID"
```

### 2. Deploy to Cloud Run

Deploy the container using Cloud Build and Cloud Run:

```bash
gcloud run deploy idea-garden \
    --source . \
    --platform managed \
    --region YOUR_REGION \
    --project YOUR_PROJECT_ID \
    --allow-unauthenticated \
    --set-secrets="GEMINI_API_KEY=YOUR_SECRET_NAME:latest" \
    --set-env-vars="NODE_ENV=production" \
    --labels="dev-tutorial=cloud-run-ai-challenge"
```

---

## Challenge Verification Label

The deployment command explicitly attaches the required Google Cloud Run AI Challenge label:

```
dev-tutorial=cloud-run-ai-challenge
```

> **Verification Requirement**: This specific label is required for automated verification and evaluation in the Cloud Run AI Challenge. Do not remove or rename this label.

---

## Testing & Verification Checklist

The following functional and security flows have been tested and verified in the application:

* [x] **Google Sign-In**: Authenticates users through Firebase Google Sign-In popup, establishes session state, and redirects to the garden workbench.
* [x] **Multi-turn Gemini Conversation**: Users can conduct multi-turn brainstorming dialogues with context retention across turns.
* [x] **Saving Ideas**: Brainstormed concepts are synthesized into structured metadata and saved to the user's private Firestore subcollection.
* [x] **Persistence Across Sessions**: Signing out and signing back in reliably reloads all planted ideas from Firestore.
* [x] **AI-Powered Idea Connections**: Server-side discovery compares newly saved ideas against existing authenticated ideas to identify relational bridges (*Extends*, *Refines*, *Combines*, *Alternative Direction*, *Contradicts*).
* [x] **Idea Evolution**: Users can branch existing ideas into iterative developmental stages (*Seed → Refinement → New Direction → Mature*) with tracked lineage.
* [x] **User Isolation**: Verifies that User B cannot view, query, or connect to User A's private ideas or conversations.
* [x] **Unauthorized Backend Access**: Requests to `/api/chat`, `/api/synthesize-idea`, and `/api/discover-connections` without a valid Firebase ID token are rejected with HTTP 401.

---

## Repository Security

To maintain repository security:

* `.env`, `.env.local`, and any file matching `.env.*` must **never** be committed to source control.
* Service account private keys (`service-account.json`, `*.pem`, `*.key`) must **never** be committed.
* Production secrets must be provisioned via Google Cloud Secret Manager or runtime container environment configuration.
