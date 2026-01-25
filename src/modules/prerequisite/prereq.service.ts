import { PrereqEngine } from './prereq.engine';
import { PaperRepository } from '@/modules/paper/paper.repository';
import { ConceptRepository } from '@/modules/concept/concept.repository';
import { cache, cacheKeys, CACHE_TTL } from '@/shared/cache';
import { logger } from '@/shared/utils';
import type { Prerequisite } from './prereq.types';

const log = logger.child({ context: 'prereq-service' });

export class PrereqService {
    private engine: PrereqEngine;
    private paperRepo: PaperRepository;
    private conceptRepo: ConceptRepository;

    constructor() {
        this.engine = new PrereqEngine();
        this.paperRepo = new PaperRepository();
        this.conceptRepo = new ConceptRepository();
    }

    /**
     * Get prerequisites for a paper
     * - Checks DB first
     * - If incomplete, runs analysis
     */
    async getPrerequisites(paperId: string, externalId: string): Promise<Prerequisite[]> {
        // 1. Try DB (Paper -> Concepts)
        // Note: This only handles Concept prerequisites for now with getPrerequisites logic
        // We also need Paper prerequisites (Paper Edges)
        // For now, let's rely on cache or analysis

        // Cache layer
        const cacheKey = `prereqs:${paperId}`;
        const cached = await cache.get<Prerequisite[]>(cacheKey);
        if (cached) return cached;

        // Run analysis
        log.info({ paperId }, 'Analyzing prerequisites...');
        const prereqs = await this.engine.analyze(paperId, externalId);

        // Save results asynchronously
        this.saveAnalysisResults(paperId, prereqs).catch(err => {
            log.error({ err, paperId }, 'Failed to save analysis results');
        });

        // Cache
        await cache.set(cacheKey, prereqs, CACHE_TTL.PAPER_DETAIL);

        return prereqs;
    }

    private async saveAnalysisResults(paperId: string, prereqs: Prerequisite[]) {
        // We only have paperId (internal UUID) and prerequisites which have IDs (external/names)
        // Use engine logic

        for (const p of prereqs) {
            if (p.type === 'concept') {
                // Ensure concept exists
                let concept = await this.conceptRepo.findBySlug(p.id); // Assuming p.id is slug/name
                if (!concept) {
                    concept = await this.conceptRepo.create({
                        name: p.name,
                        slug: p.id,
                        field: 'General', // Default
                    } as any);
                }

                await this.paperRepo.addConceptRelation(paperId, concept.id, 'REQUIRES', Math.floor(p.score * 10));
            } else {
                // Paper prerequisite
                // Only if we can map p.id (which is external S2 ID) to internal ID
                // For now, we skip saving Paper edges unless we resolve them to internal IDs
                // Doing full resolution for all prereqs is too heavy for MVP "on view"
                // We'll trust the Engine to return rich objects to frontend
            }
        }
    }
}
