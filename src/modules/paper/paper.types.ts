import { type PaperDb, type NewPaper } from '@/shared/database/schema';

export type PaperSource = 'arxiv' | 'semantic_scholar' | 'crossref';

export interface Author {
    name: string;
    affiliation?: string;
    externalId?: string;
}

export interface ArxivRaw {
    id: string;
    title: string;
    summary: string;
    author: { name: string } | { name: string }[];
    link: { href: string; rel: string; title?: string; type?: string }[];
    published: string;
    updated: string;
    category: { term: string; scheme?: string } | { term: string }[];
    'arxiv:comment'?: { '#text': string };
    'arxiv:journal_ref'?: { '#text': string };
    'arxiv:doi'?: { '#text': string };
    feed?: { entry?: any }; // Helper for type checking root
}

export interface PaperFilter {
    category?: string;
    difficulty?: string; // 'beginner' | 'intermediate' | ...
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'publishedAt' | 'relevance' | 'citations';
}

// Normalized Paper structure (matches DB insertion shape mostly)
export interface NormalizedPaper {
    externalId: string;
    source: string;
    title: string;
    authors: Author[];
    rawAbstract: string;
    publication?: string;
    publishedAt: Date;
    updatedAt: Date;
    categories: string[];
    pdfUrl?: string;
    sourceUrl?: string;
    metadata?: Record<string, any>;
}
