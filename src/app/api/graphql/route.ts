import { yoga } from '@/graphql';

/**
 * GraphQL API Route
 * 
 * Endpoint: /api/graphql
 * Methods: GET (GraphiQL), POST (queries/mutations)
 */

// Wrap the Yoga fetch handler to match Next.js Route Handler signature
const handle = (request: Request) => yoga.fetch(request, {});

export const GET = handle;
export const POST = handle;
export const OPTIONS = handle;
