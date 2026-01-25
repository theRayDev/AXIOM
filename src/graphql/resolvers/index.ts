import type { AxiomContext } from '../context';
import { scalarResolvers } from '../schema';
import { PaperService } from '@/modules/paper';
import { PrereqService } from '@/modules/prerequisite';
import { ConceptService } from '@/modules/concept';
import { GraphService } from '@/modules/graph';

const paperService = new PaperService();
const prereqService = new PrereqService();
const conceptService = new ConceptService();
const graphService = new GraphService();

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
            return conceptService.getConcept(id);
        },

        conceptBySlug: async (_: unknown, { slug }: { slug: string }) => {
            return conceptService.getConceptBySlug(slug);
        },

        concepts: async (_: unknown, args: { field?: string }) => {
            // Basic search or field filter
            if (args.field) {
                // We don't have getByField exposed in service yet, but repo has it.
                // For now, let's use search with field name or implement getByField in service
                // Using search as fallback
                return conceptService.searchConcepts(args.field);
            }
            return conceptService.searchConcepts(''); // List all?
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
        curiosityGraph: async (_: unknown, args: { userId?: string, centerNodeId?: string, depth?: number }) => {
            return graphService.getCuriosityGraph(args.userId, args.centerNodeId, args.depth);
        },

        expandNode: async (_: unknown, { nodeId }: { nodeId: string }) => {
            return graphService.getCuriosityGraph(undefined, nodeId, 1);
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
        prerequisites: async (parent: any) => {
            const externalId = parent.externalId;
            const id = parent.id;
            // Fetch from service
            const results = await prereqService.getPrerequisites(id, externalId);

            // Filter only concept prerequisites and map to schema
            return results
                .filter((p: any) => p.type === 'concept')
                .map((p: any, index: number) => ({
                    concept: {
                        id: p.id,
                        name: p.name,
                        slug: p.id,
                        difficulty: 'INTERMEDIATE',
                    },
                    priority: index,
                    isEssential: p.score > 0.8,
                    isCompleted: false,
                }));
        },
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
