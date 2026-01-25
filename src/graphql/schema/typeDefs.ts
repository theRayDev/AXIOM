/**
 * AXIOM GraphQL Type Definitions
 * Core types for the Curiosity Graph system
 */

export const typeDefs = /* GraphQL */ `
  scalar DateTime
  scalar JSON

  # ==============================================
  # ENUMS
  # ==============================================
  
  enum DifficultyLevel {
    BEGINNER
    INTERMEDIATE
    ADVANCED
    EXPERT
  }

  enum ConfidenceBand {
    EARLY
    VALIDATED
    DEBATED
    SUPERSEDED
  }

  enum EdgeType {
    CITES
    EXTENDS
    CONTRADICTS
    RELATED
    REQUIRES
    CO_LEARN
    TEACHES
    ADDRESSES
  }

  enum InteractionType {
    EXPLORED
    SAVED
    REVISITED
    COMPLETED
  }

  enum ReadinessLevel {
    LOW
    MEDIUM
    HIGH
  }

  enum ComputeLevel {
    CPU
    GPU
    CLUSTER
  }

  enum DataAvailability {
    OPEN
    RESTRICTED
    UNAVAILABLE
  }

  enum EngineeringDifficulty {
    SIMPLE
    MODERATE
    HARD
  }

  enum PaperSortBy {
    PUBLISHED_AT
    RELEVANCE
    DIFFICULTY
    CITATIONS
  }

  enum NodeType {
    PAPER
    CONCEPT
    QUESTION
  }

  # ==============================================
  # CORE TYPES
  # ==============================================

  type User {
    id: ID!
    isAnonymous: Boolean!
    email: String
    username: String
    displayName: String
    avatarUrl: String
    
    # Curiosity profile
    interestClusters: [String!]!
    depthStreak: Int!
    
    # Connections
    exploredPapers(first: Int = 20, after: String): PaperConnection!
    savedPapers(first: Int = 20, after: String): PaperConnection!
    followedQuestions: [Question!]!
    
    # Personal graph
    curiosityGraph(depth: Int = 2): CuriosityGraph!
    
    # Social
    circles: [Circle!]!
    insights: [Insight!]!
    
    createdAt: DateTime!
  }

  type Author {
    name: String!
    affiliation: String
    externalId: String
  }

  type Paper {
    id: ID!
    externalId: String!
    source: String!
    
    # Content
    title: String!
    authors: [Author!]!
    rawAbstract: String
    simplifiedAbstract: String
    
    # Classification
    categories: [String!]!
    difficultyLevel: DifficultyLevel!
    confidenceBand: ConfidenceBand!
    
    # Dates
    publishedAt: DateTime
    updatedAt: DateTime
    
    # URLs
    pdfUrl: String
    sourceUrl: String
    
    # Metrics (internal use, not for display)
    citationCount: Int
    
    # KEYSTONE: Prerequisites & Corequisites
    prerequisites: [PrerequisiteItem!]!
    corequisites: [Concept!]!
    
    # Graph relationships
    cites: [Paper!]!
    citedBy: [Paper!]!
    extends: [Paper!]!
    relatedPapers(first: Int = 5): [Paper!]!
    
    # Concepts
    teachesConcepts: [Concept!]!
    
    # Questions addressed
    addressesQuestions: [Question!]!
    
    # Implementation readiness
    readiness: ReadinessScore
    
    # User's interaction (null if not interacted)
    userInteraction: UserInteraction
    
    createdAt: DateTime!
  }

  type Concept {
    id: ID!
    name: String!
    slug: String!
    description: String
    explanation: String
    
    field: String
    difficulty: DifficultyLevel!
    
    # Hierarchy
    parentConcept: Concept
    childConcepts: [Concept!]!
    
    # Related papers
    requiredByPapers(first: Int = 10): [Paper!]!
    taughtByPapers(first: Int = 10): [Paper!]!
    
    # User's interaction
    userInteraction: UserInteraction
  }

  type Question {
    id: ID!
    text: String!
    slug: String!
    field: String
    
    papers(first: Int = 10): [Paper!]!
    followerCount: Int!
    isFollowing: Boolean!
  }

  # ==============================================
  # PREREQUISITE SYSTEM
  # ==============================================

  type PrerequisiteItem {
    concept: Concept!
    priority: Int!
    isEssential: Boolean!
    isCompleted: Boolean!
  }

  type ReadinessScore {
    math: ReadinessLevel!
    compute: ComputeLevel!
    data: DataAvailability!
    engineering: EngineeringDifficulty!
    overallScore: Int!
  }

  # ==============================================
  # CURIOSITY GRAPH
  # ==============================================

  union GraphNode = Paper | Concept | Question

  type GraphEdge {
    id: ID!
    sourceId: ID!
    targetId: ID!
    sourceType: NodeType!
    targetType: NodeType!
    edgeType: EdgeType!
    weight: Float!
    context: String
  }

  type CuriosityGraph {
    papers: [Paper!]!
    concepts: [Concept!]!
    questions: [Question!]!
    edges: [GraphEdge!]!
    
    # Recommendations
    suggestedNextNodes: [GraphNode!]!
    unexplored: [GraphNode!]!
  }

  # ==============================================
  # USER INTERACTIONS
  # ==============================================

  type UserInteraction {
    interactionType: InteractionType!
    depthLevel: Int!
    timeSpentSeconds: Int!
    createdAt: DateTime!
  }

  # ==============================================
  # SOCIAL
  # ==============================================

  type Circle {
    id: ID!
    name: String!
    description: String
    topics: [String!]!
    members: [User!]!
    memberCount: Int!
    createdAt: DateTime!
  }

  type Insight {
    id: ID!
    title: String
    content: String!
    linkedPapers: [Paper!]!
    linkedConcepts: [Concept!]!
    isPrivate: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # ==============================================
  # PAGINATION
  # ==============================================

  type PaperConnection {
    edges: [PaperEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PaperEdge {
    node: Paper!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  # ==============================================
  # AUTH
  # ==============================================

  type AuthPayload {
    user: User!
    token: String!
  }

  # ==============================================
  # QUERIES
  # ==============================================

  type Query {
    # Current user (creates anonymous user if needed)
    me: User!
    
    # Papers
    paper(id: ID!): Paper
    paperByExternalId(externalId: String!): Paper
    papers(
      first: Int = 20
      after: String
      category: String
      difficulty: DifficultyLevel
      sortBy: PaperSortBy = PUBLISHED_AT
    ): PaperConnection!
    
    searchPapers(query: String!, first: Int = 20): PaperConnection!
    trendingPapers(first: Int = 10): [Paper!]!
    todaysBreakthrough: Paper
    
    # Concepts
    concept(id: ID!): Concept
    conceptBySlug(slug: String!): Concept
    concepts(field: String, first: Int = 50): [Concept!]!
    
    # Questions
    question(id: ID!): Question
    questionBySlug(slug: String!): Question
    questions(field: String, first: Int = 20): [Question!]!
    
    # Graph
    curiosityGraph(
      userId: ID
      centerNodeId: ID
      centerNodeType: NodeType
      depth: Int = 2
    ): CuriosityGraph!
    
    expandNode(nodeId: ID!, nodeType: NodeType!): CuriosityGraph!
    
    # Recommendations
    recommendedPapers(first: Int = 10): [Paper!]!
    becauseYouExplored(paperId: ID!, first: Int = 5): [Paper!]!
  }

  # ==============================================
  # MUTATIONS
  # ==============================================

  type Mutation {
    # Auth
    createAnonymousUser: User!
    registerUser(email: String!, password: String!, username: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
    
    # Paper interactions
    explorePaper(paperId: ID!, depthLevel: Int = 1): UserInteraction!
    savePaper(paperId: ID!): Boolean!
    unsavePaper(paperId: ID!): Boolean!
    
    # Concept interactions
    exploreConcept(conceptId: ID!): UserInteraction!
    completeConcept(conceptId: ID!): Boolean!
    
    # Questions
    followQuestion(questionId: ID!): Boolean!
    unfollowQuestion(questionId: ID!): Boolean!
    
    # Circles
    createCircle(name: String!, description: String, topics: [String!]): Circle!
    joinCircle(circleId: ID!): Boolean!
    leaveCircle(circleId: ID!): Boolean!
    
    # Insights (Think Mode)
    createInsight(
      title: String
      content: String!
      linkedPaperIds: [ID!]
      linkedConceptIds: [ID!]
      isPrivate: Boolean = true
    ): Insight!
    
    updateInsight(id: ID!, title: String, content: String): Insight!
    deleteInsight(id: ID!): Boolean!
  }
`;
