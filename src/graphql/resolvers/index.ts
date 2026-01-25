import type { AxiomContext } from '../context';
import { scalarResolvers } from '../schema';
import { PaperService } from '@/modules/paper';

const paperService = new PaperService();

/**
 * GraphQL Resolvers
 * Stub implementations - will be filled in as modules are built
 */

// Placeholder data for development
const MOCK_USER = {
    id: 'anon_placeholder',
    isAnonymous: true,
    email: null,
    username: null,
    displayName: null,
    avatarUrl: null,
    interestClusters: [],
    depthStreak: 0,
    createdAt: new Date(),
};

const MOCK_PAPER = {
    id: 'paper_1',
    externalId: 'arxiv:2301.00001',
    source: 'arxiv',
    title: 'Sample Paper Title',
    authors: [{ name: 'John Doe', affiliation: 'MIT', externalId: null }],
    rawAbstract: 'This is a sample abstract.',
    simplifiedAbstract: 'A simplified version of the abstract.',
    categories: ['cs.AI', 'cs.LG'],
    difficultyLevel: 'INTERMEDIATE',
    confidenceBand: 'VALIDATED',
    publishedAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    pdfUrl: 'https://arxiv.org/pdf/2301.00001',
    sourceUrl: 'https://arxiv.org/abs/2301.00001',
    citationCount: 100,
    createdAt: new Date(),
};

export const resolvers = {
    // Custom scalars
    ...scalarResolvers,

    // ==============================================
    // QUERY RESOLVERS
    // ==============================================
    Query: {
        // Current user
        me: async (_: unknown, __: unknown, context: AxiomContext) => {
            if (context.user) {
                return {
                    ...MOCK_USER,
                    id: context.user.id,
                    isAnonymous: context.user.isAnonymous,
                };
            }
            return MOCK_USER;
        },

        // Papers
        paper: async (_: unknown, { id }: { id: string }) => {
            return paperService.getPaper(id);
        },

        paperByExternalId: async (_: unknown, { externalId }: { externalId: string }) => {
            return paperService.getPaper(externalId);
        },

        papers: async () => {
            return {
                edges: [],
                pageInfo: { hasNextPage: false, hasPreviousPage: false },
                totalCount: 0,
            };
        },

        searchPapers: async (_: unknown, { query }: { query: string }) => {
            const results = await paperService.searchPapers(query);
            return {
                edges: results.map((paper, i) => ({
                    node: paper as any,
                    cursor: Buffer.from(`cursor:${i}`).toString('base64'),
                })),
                pageInfo: {
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: null,
                    endCursor: null,
                },
                totalCount: results.length,
            };
        },

        trendingPapers: async () => {
            // TODO: Implement trending
            return [MOCK_PAPER];
        },

        todaysBreakthrough: async () => {
            // TODO: Implement daily selection
            return MOCK_PAPER;
        },

        // Concepts
        concept: async (_: unknown, { id }: { id: string }) => {
            // TODO: Implement concept service
            return {
                id,
                name: 'Sample Concept',
                slug: 'sample-concept',
                description: 'A sample concept',
                explanation: 'Plain English explanation',
                field: 'machine_learning',
                difficulty: 'INTERMEDIATE',
                parentConcept: null,
                childConcepts: [],
            };
        },

        conceptBySlug: async (_: unknown, { slug }: { slug: string }) => {
            return {
                id: 'concept_1',
                name: 'Sample Concept',
                slug,
                description: 'A sample concept',
                explanation: 'Plain English explanation',
                field: 'machine_learning',
                difficulty: 'INTERMEDIATE',
                parentConcept: null,
                childConcepts: [],
            };
        },

        concepts: async () => {
            return [];
        },

        // Questions
        question: async (_: unknown, { id }: { id: string }) => {
            return {
                id,
                text: 'Can machines reason?',
                slug: 'can-machines-reason',
                field: 'artificial_intelligence',
                papers: [],
                followerCount: 42,
                isFollowing: false,
            };
        },

        questions: async () => {
            return [];
        },

        // Graph
        curiosityGraph: async () => {
            return {
                papers: [],
                concepts: [],
                questions: [],
                edges: [],
                suggestedNextNodes: [],
                unexplored: [],
            };
        },

        expandNode: async () => {
            return {
                papers: [],
                concepts: [],
                questions: [],
                edges: [],
                suggestedNextNodes: [],
                unexplored: [],
            };
        },

        // Recommendations
        recommendedPapers: async () => {
            return [];
        },

        becauseYouExplored: async () => {
            return [];
        },
    },

    // ==============================================
    // MUTATION RESOLVERS
    // ==============================================
    Mutation: {
        createAnonymousUser: async (_: unknown, __: unknown, context: AxiomContext) => {
            // User is auto-created in context
            return {
                ...MOCK_USER,
                id: context.user?.id || 'anon_new',
                isAnonymous: true,
            };
        },

        registerUser: async () => {
            // TODO: Implement registration
            throw new Error('Not implemented');
        },

        login: async () => {
            // TODO: Implement login
            throw new Error('Not implemented');
        },

        logout: async () => {
            return true;
        },

        explorePaper: async (_: unknown, { paperId }: { paperId: string }) => {
            // TODO: Track exploration
            return {
                interactionType: 'EXPLORED',
                depthLevel: 1,
                timeSpentSeconds: 0,
                createdAt: new Date(),
            };
        },

        savePaper: async () => true,
        unsavePaper: async () => true,
        exploreConcept: async () => ({
            interactionType: 'EXPLORED',
            depthLevel: 1,
            timeSpentSeconds: 0,
            createdAt: new Date(),
        }),
        completeConcept: async () => true,
        followQuestion: async () => true,
        unfollowQuestion: async () => true,

        createCircle: async () => {
            throw new Error('Not implemented');
        },
        joinCircle: async () => true,
        leaveCircle: async () => true,

        createInsight: async () => {
            throw new Error('Not implemented');
        },
        updateInsight: async () => {
            throw new Error('Not implemented');
        },
        deleteInsight: async () => true,
    },

    // ==============================================
    // TYPE RESOLVERS
    // ==============================================
    User: {
        exploredPapers: async () => ({
            edges: [],
            pageInfo: { hasNextPage: false, hasPreviousPage: false },
            totalCount: 0,
        }),
        savedPapers: async () => ({
            edges: [],
            pageInfo: { hasNextPage: false, hasPreviousPage: false },
            totalCount: 0,
        }),
        followedQuestions: async () => [],
        curiosityGraph: async () => ({
            papers: [],
            concepts: [],
            questions: [],
            edges: [],
            suggestedNextNodes: [],
            unexplored: [],
        }),
        circles: async () => [],
        insights: async () => [],
    },

    Paper: {
        prerequisites: async () => [],
        corequisites: async () => [],
        cites: async () => [],
        citedBy: async () => [],
        extends: async () => [],
        relatedPapers: async () => [],
        teachesConcepts: async () => [],
        addressesQuestions: async () => [],
        readiness: async () => null,
        userInteraction: async () => null,
    },

    Concept: {
        parentConcept: async () => null,
        childConcepts: async () => [],
        requiredByPapers: async () => [],
        taughtByPapers: async () => [],
        userInteraction: async () => null,
    },

    Question: {
        papers: async () => [],
    },

    // Union type resolver
    GraphNode: {
        __resolveType(obj: { __typename?: string }) {
            return obj.__typename || 'Paper';
        },
    },
};
