# Building My Perplexity

A modern AI-powered search engine with real-time web research capabilities, conversation history, and source citations — built with Bun, TypeScript, React, and Supabase.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Tech Stack

### Backend
- **Runtime:** [Bun](https://bun.sh) — fast JavaScript runtime
- **Framework:** Express.js with TypeScript
- **AI:** LangChain + Groq (Llama 3.3 70B)
- **Search:** Tavily AI — real-time web search with depth
- **Database:** Prisma ORM + Supabase Postgres
- **Auth:** Supabase Authentication (Google & GitHub OAuth)

### Frontend
- **Framework:** React 19 with TypeScript
- **Bundler:** Bun (native HMR & hot reload)
- **Styling:** Tailwind CSS v4 + Radix UI primitives
- **Auth:** Supabase SSR client
- **Routing:** React Router v7

## Features

- **AI-Powered Answers** — Combines real-time web search with LLM reasoning
- **Conversation History** — Persistent chat threads with full context
- **Follow-up Questions** — AI suggests relevant follow-ups
- **Source Citations** — Every answer cites its web sources
- **Streaming Responses** — Real-time token streaming for instant answers
- **OAuth Authentication** — Sign in with Google or GitHub
- **Responsive Design** — Dark theme optimized for research workflows

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  Express API    │────▶│  Groq + Tavily  │
│                 │     │  (Bun Runtime)  │     │  (AI + Search)  │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │                 │
         └─────────────▶│  Supabase       │
                        │  (Auth + Postgres)│
                        │                 │
                        └─────────────────┘
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Supabase](https://supabase.com) account (free tier works)
- [Groq API Key](https://console.groq.com) — for LLM inference
- [Tavily API Key](https://tavily.com) — for web search

### Backend Setup

```bash
cd backend

# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run database migrations
bunx prisma migrate dev

# Start development server
bun --hot index.ts
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
bun install

# Start development server
bun run dev
```

### Environment Variables

**Backend (`backend/.env`)**
```env
DATABASE_URL=postgresql://user:password@host:5432/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
TAVILY_API_KEY=your-tavily-api-key
```

**Frontend (`frontend/.env.local`)**
```env
BUN_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
BUN_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/conversations` | List all user conversations |
| `GET` | `/conversation/:id` | Get a specific conversation with messages |
| `POST` | `/perplexity_ask` | Ask a new question (creates conversation) |
| `POST` | `/perplexity_ask/followup` | Ask a follow-up question |

### Example Request

```bash
curl -X POST http://localhost:3001/perplexity_ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"query": "What is the latest on AI regulations?"}'
```

## Project Structure

```
├── backend/
│   ├── index.ts          # Express server entry point
│   ├── middleware.ts     # Auth middleware (Supabase)
│   ├── client.ts         # Supabase admin client
│   ├── db.ts             # Prisma client
│   ├── prompt.ts         # LLM system prompts
│   └── prisma/
│       └── schema.prisma # Database schema
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Root component
│   │   ├── index.tsx         # Entry point
│   │   ├── components/
│   │   │   ├── SearchBar.tsx     # AI search input
│   │   │   ├── Sidebar.tsx       # Conversation list
│   │   │   ├── MessageDisplay.tsx # Chat messages
│   │   │   ├── Navbar.tsx        # Navigation
│   │   │   └── pages/
│   │   │       ├── Auth.tsx      # Login page
│   │   │       └── Dashboard.tsx # Main UI
│   │   └── lib/
│   │       ├── client.ts     # Supabase browser client
│   │       ├── server.ts     # API client
│   │       └── utils.ts      # Utilities (cn, etc)
│   └── dist/                 # Built frontend
│
└── README.md
```

## Database Schema

The app uses three main models:

- **User** — Supabase auth sync with provider info
- **Conversation** — Thread container with title/slug
- **Message** — Individual messages with role (User/Assistant)

## Future Roadmap

- [ ] Stripe integration for user credits
- [ ] Real-time collaboration
- [ ] Image search
- [ ] Bookmarking & collections
- [ ] API access for developers

