import { ConceptRepository } from './concept.repository';
import { cache, cacheKeys, CACHE_TTL } from '@/shared/cache';
import { logger } from '@/shared/utils';
import type { ConceptDb } from '@/shared/database/schema';

const log = logger.child({ context: 'concept-service' });

export class ConceptService {
    private repo: ConceptRepository;

    constructor() {
        this.repo = new ConceptRepository();
    }

    async getConcept(id: string): Promise<ConceptDb | null> {
        const cached = await cache.get<ConceptDb>(cacheKeys.concept(id));
        if (cached) return cached;

        const dbConcept = await this.repo.findById(id);
        if (!dbConcept) return null;

        await cache.set(cacheKeys.concept(id), dbConcept, CACHE_TTL.CONCEPT);
        return dbConcept;
    }

    async getConceptBySlug(slug: string): Promise<ConceptDb | null> {
        const cached = await cache.get<ConceptDb>(cacheKeys.conceptBySlug(slug));
        if (cached) return cached;

        const dbConcept = await this.repo.findBySlug(slug);
        if (!dbConcept) return null;

        await cache.set(cacheKeys.conceptBySlug(slug), dbConcept, CACHE_TTL.CONCEPT);
        return dbConcept;
    }

    async searchConcepts(query: string): Promise<ConceptDb[]> {
        return this.repo.search(query);
    }

    /**
     * Extract concepts from text (Placeholder for NLP integration)
     */
    async extractConcepts(text: string): Promise<string[]> {
        // Phase 2: Simple regex or keyword matching
        // Phase 3: NLP service
        return [];
    }
}
