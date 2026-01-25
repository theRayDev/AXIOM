import { createSchema, createYoga } from 'graphql-yoga';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext, type AxiomContext } from './context';
import { graphqlLogger } from '@/shared/utils';

/**
 * GraphQL Yoga Server for AXIOM
 * 
 * Features:
 * - Full GraphQL spec compliance
 * - Built-in GraphiQL IDE
 * - Automatic error handling
 * - Request logging
 */

// Create the GraphQL schema
const schema = createSchema({
    typeDefs,
    resolvers,
});

// Create the Yoga instance
export const yoga = createYoga<{ request: Request }, AxiomContext>({
    schema,
    context: async ({ request }) => {
        return createContext(request);
    },

    // Enable GraphiQL in development
    graphiql: {
        title: 'AXIOM GraphQL API',
        defaultQuery: `# Welcome to AXIOM GraphQL API
# 
# This is the API for the Curiosity Graph system.
# Try a query to get started:

query GetCurrentUser {
  me {
    id
    isAnonymous
    depthStreak
  }
}

query GetTrendingPapers {
  trendingPapers(first: 5) {
    id
    title
    authors {
      name
    }
    difficultyLevel
    categories
  }
}

query GetPaperWithPrereqs($id: ID!) {
  paper(id: $id) {
    title
    simplifiedAbstract
    prerequisites {
      concept {
        name
        explanation
      }
      priority
      isEssential
    }
    corequisites {
      name
    }
  }
}
`,
    },

    // Logging
    logging: {
        debug: (...args) => graphqlLogger.debug(args),
        info: (...args) => graphqlLogger.info(args),
        warn: (...args) => graphqlLogger.warn(args),
        error: (...args) => graphqlLogger.error(args),
    },

    // CORS for development
    cors: {
        origin: '*',
        credentials: true,
        methods: ['POST', 'GET', 'OPTIONS'],
    },

    // Mask errors in production
    maskedErrors: process.env.NODE_ENV === 'production',
});

graphqlLogger.info('GraphQL Yoga server configured');
