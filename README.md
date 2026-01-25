# AXIOM

The Curiosity Engine. A graph-based research assistant that maps your knowledge journey.

## Stack
- **Framework**: Next.js 16 (App Router)
- **API**: GraphQL Yoga
- **Database**: PostgreSQL (Supabase) + Drizzle ORM
- **Styling**: TailwindCSS
- **Search**: PgTrgm + Semantic Scholar API

## Getting Started

1. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Architecture
- `src/graphql`: GraphQL Schema & Resolvers
- `src/modules`: Domain logic (Paper, Concept, Graph)
- `src/shared`: Utilities & Config
