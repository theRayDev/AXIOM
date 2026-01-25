/**
 * AXIOM Constants
 * Central configuration for the application
 */

// ==============================================
// PAGINATION
// ==============================================
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
} as const;

// ==============================================
// CACHE TTL (in seconds)
// ==============================================
export const CACHE_TTL = {
    PAPER_DETAIL: 60 * 60,          // 1 hour
    PAPER_LIST: 60 * 30,            // 30 minutes
    SEARCH_RESULTS: 60 * 15,        // 15 minutes
    TRENDING: 60 * 5,               // 5 minutes
    USER_FEED: 60 * 2,              // 2 minutes
    CURIOSITY_GRAPH: 60 * 10,       // 10 minutes
    CONCEPT: 60 * 60 * 24,          // 24 hours (concepts change rarely)
} as const;

// ==============================================
// GRAPH TRAVERSAL
// ==============================================
export const GRAPH = {
    DEFAULT_DEPTH: 2,
    MAX_DEPTH: 5,
    MAX_NODES_PER_QUERY: 100,
} as const;

// ==============================================
// SOCIAL LIMITS
// ==============================================
export const SOCIAL = {
    MAX_CIRCLE_MEMBERS: 10,
    MAX_CIRCLES_PER_USER: 5,
} as const;

// ==============================================
// DIFFICULTY LEVELS
// ==============================================
export const DIFFICULTY_LEVELS = [
    'beginner',
    'intermediate',
    'advanced',
    'expert',
] as const;

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

// ==============================================
// CONFIDENCE BANDS
// ==============================================
export const CONFIDENCE_BANDS = [
    'early',       // New, not yet validated
    'validated',   // Peer-reviewed, widely accepted
    'debated',     // Controversial or disputed
    'superseded',  // Replaced by newer research
] as const;

export type ConfidenceBand = typeof CONFIDENCE_BANDS[number];

// ==============================================
// EDGE TYPES (Graph relationships)
// ==============================================
export const PAPER_EDGE_TYPES = [
    'CITES',
    'EXTENDS',
    'CONTRADICTS',
    'RELATED',
] as const;

export const CONCEPT_EDGE_TYPES = [
    'REQUIRES',    // Prerequisite
    'CO_LEARN',    // Corequisite
    'TEACHES',     // Paper teaches this concept
] as const;

export const USER_INTERACTION_TYPES = [
    'EXPLORED',
    'SAVED',
    'REVISITED',
    'COMPLETED',
] as const;

export type PaperEdgeType = typeof PAPER_EDGE_TYPES[number];
export type ConceptEdgeType = typeof CONCEPT_EDGE_TYPES[number];
export type UserInteractionType = typeof USER_INTERACTION_TYPES[number];

// ==============================================
// EXTERNAL SOURCES
// ==============================================
export const PAPER_SOURCES = {
    ARXIV: 'arxiv',
    SEMANTIC_SCHOLAR: 'semantic_scholar',
    CROSSREF: 'crossref',
} as const;

export type PaperSource = typeof PAPER_SOURCES[keyof typeof PAPER_SOURCES];

// ==============================================
// READINESS SCORES
// ==============================================
export const READINESS = {
    MATH: ['low', 'medium', 'high'] as const,
    COMPUTE: ['cpu', 'gpu', 'cluster'] as const,
    DATA: ['open', 'restricted', 'unavailable'] as const,
    ENGINEERING: ['simple', 'moderate', 'hard'] as const,
};

// ==============================================
// ARXIV CATEGORIES
// ==============================================
export const ARXIV_CATEGORIES: Record<string, { name: string; field: string }> = {
    'cs.AI': { name: 'Artificial Intelligence', field: 'computer_science' },
    'cs.LG': { name: 'Machine Learning', field: 'computer_science' },
    'cs.CL': { name: 'Computation and Language', field: 'computer_science' },
    'cs.CV': { name: 'Computer Vision', field: 'computer_science' },
    'cs.NE': { name: 'Neural and Evolutionary Computing', field: 'computer_science' },
    'cs.RO': { name: 'Robotics', field: 'computer_science' },
    'stat.ML': { name: 'Machine Learning (Statistics)', field: 'statistics' },
    'physics.quant-ph': { name: 'Quantum Physics', field: 'physics' },
    'q-bio': { name: 'Quantitative Biology', field: 'biology' },
    'math.CO': { name: 'Combinatorics', field: 'mathematics' },
    'econ': { name: 'Economics', field: 'economics' },
    'astro-ph': { name: 'Astrophysics', field: 'physics' },
};
