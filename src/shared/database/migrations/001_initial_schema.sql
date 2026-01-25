-- ============================================
-- AXIOM Database Schema
-- Version: 1.0.0
-- 
-- Run this in Supabase SQL Editor to create
-- all tables, indexes, and relationships
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search

-- ============================================
-- USERS (Anonymous-first)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,  -- Can be UUID or anon_xxx format
    
    -- Anonymous users get an ID stored in localStorage
    is_anonymous BOOLEAN DEFAULT true,
    
    -- Only for registered users
    email VARCHAR(255) UNIQUE,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    
    -- Curiosity profile
    curiosity_vector FLOAT[] DEFAULT '{}',
    interest_clusters TEXT[] DEFAULT '{}',
    
    -- Engagement tracking (ethical)
    depth_streak INTEGER DEFAULT 0,
    last_active_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================
-- PAPERS (Enriched from external sources)
-- ============================================
CREATE TABLE IF NOT EXISTS papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- External identifiers
    external_id VARCHAR(100) UNIQUE NOT NULL,
    source VARCHAR(50) NOT NULL,
    
    -- Content
    title TEXT NOT NULL,
    authors JSONB NOT NULL DEFAULT '[]',
    raw_abstract TEXT,
    simplified_abstract TEXT,
    
    -- Metadata
    publication VARCHAR(255),
    published_at TIMESTAMP,
    
    -- Classification
    categories TEXT[] DEFAULT '{}',
    
    -- Difficulty & Reliability
    difficulty_level VARCHAR(20) DEFAULT 'intermediate',
    confidence_band VARCHAR(20) DEFAULT 'validated',
    
    -- Metrics
    citation_count INTEGER DEFAULT 0,
    impact_score FLOAT DEFAULT 0,
    
    -- Implementation readiness
    readiness_math VARCHAR(20),
    readiness_compute VARCHAR(20),
    readiness_data VARCHAR(20),
    readiness_engineering VARCHAR(20),
    
    -- URLs
    pdf_url TEXT,
    source_url TEXT,
    
    -- Flexible metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    indexed_at TIMESTAMP DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX IF NOT EXISTS papers_search_idx ON papers 
    USING GIN (to_tsvector('english', title || ' ' || COALESCE(raw_abstract, '')));

CREATE INDEX IF NOT EXISTS idx_papers_categories ON papers USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_papers_published ON papers(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_papers_source ON papers(source);

-- ============================================
-- CONCEPTS (First-class citizens)
-- ============================================
CREATE TABLE IF NOT EXISTS concepts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    
    -- Classification
    field VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'intermediate',
    
    -- For learning cards
    explanation TEXT,
    
    -- Hierarchy
    parent_concept_id UUID REFERENCES concepts(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_concepts_slug ON concepts(slug);
CREATE INDEX IF NOT EXISTS idx_concepts_field ON concepts(field);

-- ============================================
-- PAPER EDGES (Paper ↔ Paper relationships)
-- ============================================
CREATE TABLE IF NOT EXISTS paper_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    source_paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    target_paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    
    edge_type VARCHAR(50) NOT NULL,
    weight FLOAT DEFAULT 1.0,
    context TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(source_paper_id, target_paper_id, edge_type)
);

CREATE INDEX IF NOT EXISTS idx_paper_edges_source ON paper_edges(source_paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_edges_target ON paper_edges(target_paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_edges_type ON paper_edges(edge_type);

-- ============================================
-- PAPER CONCEPTS (Prerequisites & Corequisites)
-- ============================================
CREATE TABLE IF NOT EXISTS paper_concepts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    
    relation_type VARCHAR(50) NOT NULL,
    priority INTEGER DEFAULT 0,
    is_essential BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(paper_id, concept_id, relation_type)
);

CREATE INDEX IF NOT EXISTS idx_paper_concepts_paper ON paper_concepts(paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_concepts_concept ON paper_concepts(concept_id);
CREATE INDEX IF NOT EXISTS idx_paper_concepts_type ON paper_concepts(relation_type);

-- ============================================
-- USER INTERACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    
    paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    
    interaction_type VARCHAR(50) NOT NULL,
    depth_level INTEGER DEFAULT 1,
    time_spent_seconds INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CHECK (paper_id IS NOT NULL OR concept_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_paper ON user_interactions(paper_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);

-- ============================================
-- QUESTIONS (Follow questions, not people)
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    text TEXT NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    field VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paper_questions (
    paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    relevance_score FLOAT DEFAULT 1.0,
    PRIMARY KEY (paper_id, question_id)
);

CREATE TABLE IF NOT EXISTS user_questions (
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    followed_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, question_id)
);

-- ============================================
-- CIRCLES (Social)
-- ============================================
CREATE TABLE IF NOT EXISTS circles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    topics TEXT[] DEFAULT '{}',
    
    created_by TEXT REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS circle_members (
    circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (circle_id, user_id)
);

-- ============================================
-- INSIGHTS (Think Mode)
-- ============================================
CREATE TABLE IF NOT EXISTS insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(255),
    content TEXT NOT NULL,
    
    linked_paper_ids UUID[] DEFAULT '{}',
    linked_concept_ids UUID[] DEFAULT '{}',
    
    is_private BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_user ON insights(user_id);

-- ============================================
-- ANALYTICS (Ethical tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    
    event_type VARCHAR(50) NOT NULL,
    
    paper_id UUID REFERENCES papers(id) ON DELETE SET NULL,
    concept_id UUID REFERENCES concepts(id) ON DELETE SET NULL,
    
    event_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_time ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Papers, Concepts, Questions are public read
CREATE POLICY "Papers are public" ON papers FOR SELECT USING (true);
CREATE POLICY "Concepts are public" ON concepts FOR SELECT USING (true);
CREATE POLICY "Questions are public" ON questions FOR SELECT USING (true);
CREATE POLICY "Paper edges are public" ON paper_edges FOR SELECT USING (true);
CREATE POLICY "Paper concepts are public" ON paper_concepts FOR SELECT USING (true);

-- User data is private
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (id = current_setting('app.user_id', true));
CREATE POLICY "Users can insert" ON users FOR INSERT WITH CHECK (true);

-- User interactions are private
CREATE POLICY "User interactions are private" ON user_interactions 
    FOR ALL USING (user_id = current_setting('app.user_id', true));

-- Insights can be private or public
CREATE POLICY "Insights visibility" ON insights 
    FOR SELECT USING (user_id = current_setting('app.user_id', true) OR is_private = false);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER papers_updated_at BEFORE UPDATE ON papers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER concepts_updated_at BEFORE UPDATE ON concepts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER insights_updated_at BEFORE UPDATE ON insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- GRAPH TRAVERSAL FUNCTION (Recursive CTE)
-- ============================================

-- Get related papers up to N degrees of separation
CREATE OR REPLACE FUNCTION get_related_papers(
    start_paper_id UUID,
    max_depth INTEGER DEFAULT 2
)
RETURNS TABLE (
    paper_id UUID,
    depth INTEGER,
    path UUID[]
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE paper_graph AS (
        -- Base case: start paper
        SELECT 
            pe.target_paper_id AS paper_id,
            1 AS depth,
            ARRAY[start_paper_id, pe.target_paper_id] AS path
        FROM paper_edges pe
        WHERE pe.source_paper_id = start_paper_id
        
        UNION ALL
        
        -- Recursive case: follow edges
        SELECT 
            pe.target_paper_id,
            pg.depth + 1,
            pg.path || pe.target_paper_id
        FROM paper_graph pg
        JOIN paper_edges pe ON pe.source_paper_id = pg.paper_id
        WHERE pg.depth < max_depth
          AND NOT pe.target_paper_id = ANY(pg.path)  -- Prevent cycles
    )
    SELECT DISTINCT ON (pg.paper_id) 
        pg.paper_id,
        pg.depth,
        pg.path
    FROM paper_graph pg
    ORDER BY pg.paper_id, pg.depth;
END;
$$ LANGUAGE plpgsql;

-- Get prerequisites for a paper
CREATE OR REPLACE FUNCTION get_paper_prerequisites(paper_uuid UUID)
RETURNS TABLE (
    concept_id UUID,
    concept_name VARCHAR(255),
    priority INTEGER,
    is_essential BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        pc.priority,
        pc.is_essential
    FROM paper_concepts pc
    JOIN concepts c ON c.id = pc.concept_id
    WHERE pc.paper_id = paper_uuid
      AND pc.relation_type = 'REQUIRES'
    ORDER BY pc.priority ASC;
END;
$$ LANGUAGE plpgsql;
