import { pgTable, text, varchar, timestamp, boolean, uuid, jsonb, integer, doublePrecision, unique, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * USERS TABLE
 */
export const users = pgTable('users', {
    id: text('id').primaryKey(), // Can be UUID or anon_xxx
    isAnonymous: boolean('is_anonymous').default(true),

    email: varchar('email', { length: 255 }).unique(),
    username: varchar('username', { length: 50 }).unique(),
    displayName: varchar('display_name', { length: 100 }),
    avatarUrl: text('avatar_url'),

    curiosityVector: doublePrecision('curiosity_vector').array().default([]),
    interestClusters: text('interest_clusters').array().default([]),

    depthStreak: integer('depth_streak').default(0),
    lastActiveAt: timestamp('last_active_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * PAPERS TABLE
 */
export const papers = pgTable('papers', {
    id: uuid('id').defaultRandom().primaryKey(),

    externalId: varchar('external_id', { length: 100 }).unique().notNull(),
    source: varchar('source', { length: 50 }).notNull(),

    title: text('title').notNull(),
    authors: jsonb('authors').notNull().default([]),
    rawAbstract: text('raw_abstract'),
    simplifiedAbstract: text('simplified_abstract'),

    publication: varchar('publication', { length: 255 }),
    publishedAt: timestamp('published_at'),

    categories: text('categories').array().default([]),

    difficultyLevel: varchar('difficulty_level', { length: 20 }).default('intermediate'),
    confidenceBand: varchar('confidence_band', { length: 20 }).default('validated'),

    citationCount: integer('citation_count').default(0),
    impactScore: doublePrecision('impact_score').default(0),

    readinessMath: varchar('readiness_math', { length: 20 }),
    readinessCompute: varchar('readiness_compute', { length: 20 }),
    readinessData: varchar('readiness_data', { length: 20 }),
    readinessEngineering: varchar('readiness_engineering', { length: 20 }),

    pdfUrl: text('pdf_url'),
    sourceUrl: text('source_url'),

    metadata: jsonb('metadata').default({}),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    indexedAt: timestamp('indexed_at').defaultNow().notNull(),
});

/**
 * CONCEPTS TABLE
 */
export const concepts = pgTable('concepts', {
    id: uuid('id').defaultRandom().primaryKey(),

    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).unique().notNull(),
    description: text('description'),

    field: varchar('field', { length: 100 }),
    difficulty: varchar('difficulty', { length: 20 }).default('intermediate'),

    explanation: text('explanation'),

    parentConceptId: uuid('parent_concept_id').references((): any => concepts.id),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * PAPER EDGES (Graph)
 */
export const paperEdges = pgTable('paper_edges', {
    id: uuid('id').defaultRandom().primaryKey(),

    sourcePaperId: uuid('source_paper_id').references(() => papers.id, { onDelete: 'cascade' }).notNull(),
    targetPaperId: uuid('target_paper_id').references(() => papers.id, { onDelete: 'cascade' }).notNull(),

    edgeType: varchar('edge_type', { length: 50 }).notNull(),
    weight: doublePrecision('weight').default(1.0),
    context: text('context'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    uniqueEdge: unique().on(t.sourcePaperId, t.targetPaperId, t.edgeType),
}));

/**
 * PAPER CONCEPTS (Prereqs)
 */
export const paperConcepts = pgTable('paper_concepts', {
    id: uuid('id').defaultRandom().primaryKey(),

    paperId: uuid('paper_id').references(() => papers.id, { onDelete: 'cascade' }).notNull(),
    conceptId: uuid('concept_id').references(() => concepts.id, { onDelete: 'cascade' }).notNull(),

    relationType: varchar('relation_type', { length: 50 }).notNull(),
    priority: integer('priority').default(0),
    isEssential: boolean('is_essential').default(false),

    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    uniqueRelation: unique().on(t.paperId, t.conceptId, t.relationType),
}));

/**
 * QUESTIONS
 */
export const questions = pgTable('questions', {
    id: uuid('id').defaultRandom().primaryKey(),
    text: text('text').notNull(),
    slug: varchar('slug', { length: 255 }).unique().notNull(),
    field: varchar('field', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const paperQuestions = pgTable('paper_questions', {
    paperId: uuid('paper_id').references(() => papers.id, { onDelete: 'cascade' }).notNull(),
    questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
    relevanceScore: doublePrecision('relevance_score').default(1.0),
}, (t) => ({
    pk: t.paperId, // Composite PK handled by Drizzle usually supports composite but simpler to just index
}));

export const userQuestions = pgTable('user_questions', {
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
    followedAt: timestamp('followed_at').defaultNow().notNull(),
});

/**
 * EXPORT TYPES
 */
// Users
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Papers
export type PaperDb = typeof papers.$inferSelect;
export type NewPaper = typeof papers.$inferInsert;

// Concepts
export type ConceptDb = typeof concepts.$inferSelect;
export type NewConcept = typeof concepts.$inferInsert;

// Relations
export type PaperEdgeDb = typeof paperEdges.$inferSelect;
export type PaperConceptDb = typeof paperConcepts.$inferSelect;
